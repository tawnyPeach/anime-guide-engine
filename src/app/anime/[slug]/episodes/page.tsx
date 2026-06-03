import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import {
  generateEpisodeGuideContent,
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
    title: generateMetaTitle("episodes", animeData),
    description: generateMetaDescription("episodes", animeData),
  };
}

export async function generateStaticParams() {
  try {
    const anime = await prisma.anime.findMany({
      where: { totalEpisodes: { gt: 0 } },
      select: { slug: true },
      orderBy: { popularity: "desc" },
      take: 200,
    });
    return anime.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export default async function EpisodesPage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: {
      episodes: {
        orderBy: { episodeNumber: "asc" },
      },
      fillerMapping: true,
    },
  });

  if (!anime) notFound();

  const genres = JSON.parse(anime.genres || "[]");
  const displayTitle = anime.titleEnglish || anime.title;
  const content = generateEpisodeGuideContent({ ...anime, genres });

  // Group episodes by arc if available
  const arcs = groupByArc(anime.episodes);

  const fillerEpisodes: number[] = anime.fillerMapping
    ? JSON.parse(anime.fillerMapping.fillerEpisodes || "[]")
    : [];
  const mixedEpisodes: number[] = anime.fillerMapping
    ? JSON.parse(anime.fillerMapping.mixedEpisodes || "[]")
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Anime", href: "/" },
          { label: displayTitle, href: `/anime/${anime.slug}` },
          { label: "Episodes" },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${displayTitle} Episode Guide`,
            numberOfItems: anime.totalEpisodes,
            itemListElement: anime.episodes.slice(0, 10).map((ep, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: ep.title || `Episode ${ep.episodeNumber}`,
            })),
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {displayTitle} Episode Guide
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        All {anime.totalEpisodes} episodes with filler markers
      </p>

      {/* Content */}
      <article className="prose prose-invert max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }}
        />
      </article>

      <AdBanner className="mb-8" />

      {/* Episode List */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">All Episodes</h2>

        {arcs.length > 1 ? (
          // Render by arc
          arcs.map((arc, arcIndex) => (
            <div key={arcIndex} className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                {arc.name}
              </h3>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {arc.episodes.map((ep) => {
                  const isFiller = fillerEpisodes.includes(ep.episodeNumber);
                  const isMixed = mixedEpisodes.includes(ep.episodeNumber);

                  return (
                    <div
                      key={ep.id}
                      className={`flex items-center justify-between p-3 border-b border-gray-700/50 last:border-0 ${
                        isFiller
                          ? "bg-red-900/10"
                          : isMixed
                          ? "bg-yellow-900/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-mono text-sm w-10">
                          {ep.episodeNumber}
                        </span>
                        <span className="text-white text-sm">
                          {ep.title || `Episode ${ep.episodeNumber}`}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          isFiller
                            ? "bg-red-500/20 text-red-400"
                            : isMixed
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {isFiller ? "Filler" : isMixed ? "Mixed" : "Canon"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          // Flat list
          <div className="bg-gray-800 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
            {anime.episodes.map((ep) => {
              const isFiller = fillerEpisodes.includes(ep.episodeNumber);
              const isMixed = mixedEpisodes.includes(ep.episodeNumber);

              return (
                <div
                  key={ep.id}
                  className={`flex items-center justify-between p-3 border-b border-gray-700/50 last:border-0 ${
                    isFiller
                      ? "bg-red-900/10"
                      : isMixed
                      ? "bg-yellow-900/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-sm w-10">
                      {ep.episodeNumber}
                    </span>
                    <span className="text-white text-sm">
                      {ep.title || `Episode ${ep.episodeNumber}`}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      isFiller
                        ? "bg-red-500/20 text-red-400"
                        : isMixed
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {isFiller ? "Filler" : isMixed ? "Mixed" : "Canon"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
            href={`/anime/${anime.slug}/watch-order`}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            📑 Watch Order
          </Link>
          <Link
            href={`/anime-like/${anime.slug}`}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            🔍 Similar Anime
          </Link>
        </div>
      </section>
    </div>
  );
}

interface EpisodeData {
  id: number;
  episodeNumber: number;
  title: string | null;
  arcName: string | null;
  isFiller: boolean;
  isMixedCanonFiller: boolean;
}

function groupByArc(episodes: EpisodeData[]) {
  const arcs: { name: string; episodes: EpisodeData[] }[] = [];
  let currentArc: { name: string; episodes: EpisodeData[] } | null = null;

  for (const ep of episodes) {
    const arcName = ep.arcName || "Episodes";
    if (!currentArc || currentArc.name !== arcName) {
      currentArc = { name: arcName, episodes: [] };
      arcs.push(currentArc);
    }
    currentArc.episodes.push(ep);
  }

  return arcs;
}
