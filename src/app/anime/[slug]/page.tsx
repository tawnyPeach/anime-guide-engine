import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import { generateMetaTitle, generateMetaDescription } from "@/lib/content-generator";

export const revalidate = 86400; // ISR: revalidate daily

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
    title: generateMetaTitle("anime", animeData),
    description: generateMetaDescription("anime", animeData),
    alternates: { canonical: `/anime/${slug}` },
    openGraph: {
      title: anime.titleEnglish || anime.title,
      description: anime.description?.substring(0, 200) || undefined,
      images: anime.coverImage
        ? [{ url: anime.coverImage }]
        : [{ url: `/api/og?title=${encodeURIComponent(anime.titleEnglish || anime.title)}&type=anime` }],
    },
  };
}

export async function generateStaticParams() {
  try {
    const anime = await prisma.anime.findMany({
      select: { slug: true },
      orderBy: { popularity: "desc" },
      take: 200,
    });
    return anime.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export default async function AnimePage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: {
      fillerMapping: true,
      watchOrder: true,
      relationsFrom: {
        include: { toAnime: true },
      },
    },
  });

  if (!anime) notFound();

  const genres: string[] = JSON.parse(anime.genres || "[]");
  const studios: string[] = JSON.parse(anime.studios || "[]");
  const displayTitle = anime.titleEnglish || anime.title;

  // Find similar anime (same genres)
  const similarAnime = await prisma.anime.findMany({
    where: {
      id: { not: anime.id },
      genres: { contains: genres[0] || "" },
    },
    orderBy: { popularity: "desc" },
    take: 8,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Anime", href: "/" },
          { label: displayTitle },
        ]}
      />

      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Cover Image */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-anime-card border border-anime-border glow-purple">
            {anime.coverImage ? (
              <Image
                src={anime.coverImage}
                alt={`${displayTitle} cover`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span className="text-6xl">🎬</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {displayTitle}
          </h1>
          {anime.titleEnglish && anime.title !== anime.titleEnglish && (
            <p className="text-gray-400 text-lg mb-4">{anime.title}</p>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-anime-card rounded-xl p-3 border border-anime-border hover:border-purple-700/40 transition-colors">
              <div className="text-gray-400 text-xs uppercase">Episodes</div>
              <div className="text-white font-bold text-lg">
                {anime.totalEpisodes || "?"}
              </div>
            </div>
            <div className="bg-anime-card rounded-xl p-3 border border-anime-border hover:border-blue-700/40 transition-colors">
              <div className="text-gray-400 text-xs uppercase">Score</div>
              <div className="text-white font-bold text-lg">
                {anime.averageScore
                  ? `${(anime.averageScore / 10).toFixed(1)}/10`
                  : "N/A"}
              </div>
            </div>
            <div className="bg-anime-card rounded-xl p-3 border border-anime-border hover:border-cyan-700/40 transition-colors">
              <div className="text-gray-400 text-xs uppercase">Status</div>
              <div className="text-white font-bold text-lg capitalize">
                {anime.status?.toLowerCase().replace(/_/g, " ") || "Unknown"}
              </div>
            </div>
            {anime.seasonYear && (
              <div className="bg-anime-card rounded-xl p-3 border border-anime-border hover:border-pink-700/40 transition-colors">
                <div className="text-gray-400 text-xs uppercase">Year</div>
                <div className="text-white font-bold text-lg">
                  {anime.season?.toLowerCase()} {anime.seasonYear}
                </div>
              </div>
            )}
            {anime.format && (
              <div className="bg-anime-card rounded-xl p-3 border border-anime-border hover:border-purple-700/40 transition-colors">
                <div className="text-gray-400 text-xs uppercase">Format</div>
                <div className="text-white font-bold text-lg">{anime.format}</div>
              </div>
            )}
            {studios.length > 0 && (
              <div className="bg-anime-card rounded-xl p-3 border border-anime-border hover:border-blue-700/40 transition-colors">
                <div className="text-gray-400 text-xs uppercase">Studio</div>
                <div className="text-white font-bold text-lg">{studios[0]}</div>
              </div>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/genre/${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-700/30 hover:border-purple-500/50 hover:text-purple-200 transition-all duration-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}

          {/* Description */}
          {anime.description && (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed">
                {anime.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <AdBanner className="mb-8" />

      {/* Guide Links */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Available Guides for {displayTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {anime.fillerMapping && (
            <Link
              href={`/anime/${anime.slug}/filler-list`}
              className="bg-gradient-to-br from-red-900/30 to-anime-card border border-red-800/40 rounded-xl p-6 hover:border-red-500/60 hover:glow-card-hover transition-all duration-300 group"
            >
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-red-300 transition-colors">
                🎯 Filler Guide
              </h3>
              <p className="text-gray-400 text-sm">
                {anime.fillerMapping.totalFiller} filler episodes identified (
                {Math.round(anime.fillerMapping.fillerPercent)}% of total)
              </p>
            </Link>
          )}
          {anime.totalEpisodes > 0 && (
            <Link
              href={`/anime/${anime.slug}/episodes`}
              className="bg-gradient-to-br from-blue-900/30 to-anime-card border border-blue-800/40 rounded-xl p-6 hover:border-blue-500/60 hover:glow-card-hover transition-all duration-300 group"
            >
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                📋 Episode Guide
              </h3>
              <p className="text-gray-400 text-sm">
                Complete list of all {anime.totalEpisodes} episodes with details
              </p>
            </Link>
          )}
          {anime.relationsFrom.length > 0 && (
            <Link
              href={`/anime/${anime.slug}/watch-order`}
              className="bg-gradient-to-br from-purple-900/30 to-anime-card border border-purple-800/40 rounded-xl p-6 hover:border-purple-500/60 hover:glow-card-hover transition-all duration-300 group"
            >
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">
                📑 Watch Order
              </h3>
              <p className="text-gray-400 text-sm">
                {anime.relationsFrom.length} related entries in the franchise
              </p>
            </Link>
          )}
        </div>
      </section>

      {/* Related Anime */}
      {anime.relationsFrom.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Related Anime</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anime.relationsFrom.map((relation) => (
              <Link
                key={relation.id}
                href={`/anime/${relation.toAnime.slug}`}
                className="bg-anime-card rounded-xl p-4 border border-anime-border hover:border-purple-700/40 hover:bg-anime-card/80 transition-all duration-200 flex items-center gap-4"
              >
                <span className="text-xs bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-purple-300 px-2 py-1 rounded-md border border-purple-800/30 uppercase">
                  {relation.relationType.replace(/_/g, " ")}
                </span>
                <span className="text-white font-medium">
                  {relation.toAnime.titleEnglish || relation.toAnime.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Similar Anime */}
      {similarAnime.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Anime Like {displayTitle}
            </h2>
            <Link
              href={`/anime-like/${anime.slug}`}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarAnime.map((similar) => (
              <Link
                key={similar.id}
                href={`/anime/${similar.slug}`}
                className="bg-anime-card rounded-xl p-3 border border-anime-border hover:border-purple-700/40 hover:glow-card-hover transition-all duration-300 text-center"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 mb-2">
                  {similar.coverImage && (
                    <Image
                      src={similar.coverImage}
                      alt={similar.titleEnglish || similar.title}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  )}
                </div>
                <p className="text-white text-xs font-medium line-clamp-2">
                  {similar.titleEnglish || similar.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Internal Links */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Explore More
        </h2>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/genre/${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-purple-700/40 hover:text-purple-300 text-sm transition-all duration-200"
            >
              {genre} Anime
            </Link>
          ))}
          {anime.seasonYear && (
            <Link
              href={`/year/${anime.seasonYear}`}
              className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-blue-700/40 hover:text-blue-300 text-sm transition-all duration-200"
            >
              {anime.seasonYear} Anime
            </Link>
          )}
          <Link
            href={`/anime-like/${anime.slug}`}
            className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-pink-700/40 hover:text-pink-300 text-sm transition-all duration-200"
          >
            More Anime Like {displayTitle}
          </Link>
        </div>
      </section>

      <AdBanner className="mb-8" />
    </div>
  );
}
