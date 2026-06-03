import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import {
  generateWatchOrderContent,
  generateMetaTitle,
  generateMetaDescription,
} from "@/lib/content-generator";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({ where: { slug } });
  if (!anime) return { title: "Not Found" };

  const genres = JSON.parse(anime.genres || "[]");
  const animeData = { ...anime, genres };

  return {
    title: generateMetaTitle("watch-order", animeData),
    description: generateMetaDescription("watch-order", animeData),
  };
}

export async function generateStaticParams() {
  const anime = await prisma.anime.findMany({
    where: {
      OR: [
        { watchOrder: { isNot: null } },
        { relationsFrom: { some: {} } },
      ],
    },
    select: { slug: true },
    take: 200,
  });
  return anime.map((a) => ({ slug: a.slug }));
}

export default async function WatchOrderPage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: {
      watchOrder: true,
      relationsFrom: {
        include: { toAnime: true },
      },
      relationsTo: {
        include: { fromAnime: true },
      },
    },
  });

  if (!anime) notFound();

  const genres = JSON.parse(anime.genres || "[]");
  const displayTitle = anime.titleEnglish || anime.title;

  // Build the complete watch order chain
  const allRelated = [
    ...anime.relationsFrom.map((r) => ({
      title: r.toAnime.titleEnglish || r.toAnime.title,
      slug: r.toAnime.slug,
      type: r.relationType,
      format: r.toAnime.format,
      episodes: r.toAnime.totalEpisodes,
    })),
    ...anime.relationsTo.map((r) => ({
      title: r.fromAnime.titleEnglish || r.fromAnime.title,
      slug: r.fromAnime.slug,
      type: inverseRelation(r.relationType),
      format: r.fromAnime.format,
      episodes: r.fromAnime.totalEpisodes,
    })),
  ];

  // Sort: prequels first, then main, then sequels, then side stories
  const sortOrder: Record<string, number> = {
    PREQUEL: 1,
    PARENT: 2,
    SEQUEL: 4,
    SIDE_STORY: 5,
    SPIN_OFF: 6,
    ALTERNATIVE: 7,
  };

  allRelated.sort(
    (a, b) => (sortOrder[a.type] || 10) - (sortOrder[b.type] || 10)
  );

  const content = generateWatchOrderContent(
    { ...anime, genres },
    allRelated
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Anime", href: "/" },
          { label: displayTitle, href: `/anime/${anime.slug}` },
          { label: "Watch Order" },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${displayTitle} Watch Order Guide`,
            description: `Complete watch order for the ${displayTitle} franchise.`,
            author: { "@type": "Organization", name: "Anime Guide Engine" },
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {displayTitle} Watch Order
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        The recommended order to watch the {displayTitle} series
      </p>

      <AdBanner className="mb-8" />

      {/* Content */}
      <article className="prose prose-invert max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }}
        />
      </article>

      {/* Visual Watch Order */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Watch Order Timeline
        </h2>
        <div className="space-y-3">
          {/* Current anime */}
          <div className="relative">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded uppercase font-bold">
                    Main Series
                  </span>
                  <h3 className="text-white font-bold text-lg mt-2">
                    {displayTitle}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {anime.totalEpisodes} episodes • {anime.format}
                  </p>
                </div>
                <span className="text-3xl">📺</span>
              </div>
            </div>
          </div>

          {/* Related entries */}
          {allRelated.map((entry, index) => (
            <div key={index} className="relative pl-4 border-l-2 border-gray-700">
              <Link
                href={`/anime/${entry.slug}`}
                className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                        entry.type === "PREQUEL"
                          ? "bg-purple-600/30 text-purple-400"
                          : entry.type === "SEQUEL"
                          ? "bg-green-600/30 text-green-400"
                          : entry.type === "SIDE_STORY"
                          ? "bg-yellow-600/30 text-yellow-400"
                          : "bg-gray-600/30 text-gray-400"
                      }`}
                    >
                      {entry.type.replace(/_/g, " ")}
                    </span>
                    <h3 className="text-white font-semibold mt-2">
                      {entry.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {entry.episodes > 0
                        ? `${entry.episodes} episodes`
                        : "Unknown episodes"}{" "}
                      • {entry.format || "TV"}
                    </p>
                  </div>
                  <span className="text-gray-500 text-xl">→</span>
                </div>
              </Link>
            </div>
          ))}

          {allRelated.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">
                {displayTitle} is a standalone series with no direct prequels or
                sequels in our database. You can start watching it directly!
              </p>
            </div>
          )}
        </div>
      </section>

      <AdBanner className="mb-8" />

      {/* Internal Links */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">More Guides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/anime/${anime.slug}`}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            ← {displayTitle} Overview
          </Link>
          <Link
            href={`/anime/${anime.slug}/filler-list`}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            🎯 Filler Guide
          </Link>
          <Link
            href={`/anime/${anime.slug}/episodes`}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            📋 Episode Guide
          </Link>
        </div>
      </section>
    </div>
  );
}

function inverseRelation(type: string): string {
  const inverseMap: Record<string, string> = {
    PREQUEL: "SEQUEL",
    SEQUEL: "PREQUEL",
    PARENT: "SIDE_STORY",
    SIDE_STORY: "PARENT",
    SPIN_OFF: "PARENT",
    ALTERNATIVE: "ALTERNATIVE",
  };
  return inverseMap[type] || type;
}
