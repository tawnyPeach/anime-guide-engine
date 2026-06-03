import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import {
  generateAnimeLikeContent,
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
    title: generateMetaTitle("anime-like", animeData),
    description: generateMetaDescription("anime-like", animeData),
  };
}

export async function generateStaticParams() {
  const anime = await prisma.anime.findMany({
    select: { slug: true },
    orderBy: { popularity: "desc" },
    take: 100,
  });
  return anime.map((a) => ({ slug: a.slug }));
}

export default async function AnimeLikePage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({ where: { slug } });

  if (!anime) notFound();

  const genres: string[] = JSON.parse(anime.genres || "[]");
  const displayTitle = anime.titleEnglish || anime.title;

  // Find similar anime based on shared genres
  const similarAnime = await prisma.anime.findMany({
    where: {
      id: { not: anime.id },
      OR: genres.map((genre) => ({ genres: { contains: genre } })),
    },
    orderBy: { popularity: "desc" },
    take: 20,
  });

  // Score similar anime by genre overlap
  const scored = similarAnime.map((similar) => {
    const similarGenres: string[] = JSON.parse(similar.genres || "[]");
    const overlap = genres.filter((g) => similarGenres.includes(g)).length;
    return { ...similar, score: overlap };
  });
  scored.sort((a, b) => b.score - a.score);

  const content = generateAnimeLikeContent(
    { ...anime, genres },
    scored.slice(0, 10).map((s) => ({
      title: s.titleEnglish || s.title,
      slug: s.slug,
    }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Anime", href: "/" },
          { label: displayTitle, href: `/anime/${anime.slug}` },
          { label: "Similar Anime" },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Anime Like ${displayTitle}`,
            numberOfItems: scored.length,
            itemListElement: scored.slice(0, 10).map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.titleEnglish || s.title,
              url: `/anime/${s.slug}`,
            })),
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Anime Like {displayTitle}
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        {scored.length} anime similar to {displayTitle} based on genre and
        popularity
      </p>

      {/* Content */}
      <article className="prose prose-invert max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }}
        />
      </article>

      <AdBanner className="mb-8" />

      {/* Recommendations Grid */}
      {scored.length > 0 ? (
        <div className="space-y-4 mb-8">
          {scored.map((similar, index) => {
            const simGenres: string[] = JSON.parse(similar.genres || "[]");
            const sharedGenres = genres.filter((g) => simGenres.includes(g));

            return (
              <Link
                key={similar.id}
                href={`/anime/${similar.slug}`}
                className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-gray-600 w-8">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {similar.titleEnglish || similar.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      {similar.totalEpisodes > 0 && (
                        <span>{similar.totalEpisodes} eps</span>
                      )}
                      {similar.averageScore && (
                        <span>
                          ⭐ {(similar.averageScore / 10).toFixed(1)}
                        </span>
                      )}
                      {similar.seasonYear && <span>{similar.seasonYear}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {simGenres.slice(0, 4).map((g) => (
                        <span
                          key={g}
                          className={`text-xs px-2 py-0.5 rounded ${
                            sharedGenres.includes(g)
                              ? "bg-blue-600/20 text-blue-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    {similar.description && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {similar.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {sharedGenres.length}/{genres.length} genres match
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center mb-8">
          <p className="text-gray-400">
            No similar anime found yet. Try running the seed script to populate
            the database.
          </p>
        </div>
      )}

      <AdBanner className="mb-8" />

      {/* Back link */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/anime/${anime.slug}`}
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            ← Back to {displayTitle}
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
