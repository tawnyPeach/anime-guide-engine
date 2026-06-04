import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButtons from "@/components/ShareButtons";
import { generateMetaTitle, generateMetaDescription } from "@/lib/content-generator";

const BLUR_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbElEQVQoz2NkYPj/n4EBCxg1atR/BgYGRnwKGRgYGP7//8+Irhgbmx4dNWrUf0ZsLiTCRkYmBgYGhv+MDAzYXPgfi04kVY3EYxI+P+BQiO4mYhXi9AMxCsnlB7I4Aas7cQXBf1xuxJcwAHq0RckiXeZJAAAAAElFTkSuQmCC";

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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
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
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border glow-primary">
            {anime.coverImage ? (
              <Image
                src={anime.coverImage}
                alt={`${displayTitle} cover`}
                fill
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-6xl">🎬</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              {displayTitle}
            </h1>
            <BookmarkButton anime={{ id: anime.id, slug: anime.slug, title: displayTitle, coverImage: anime.coverImage }} />
          </div>
          {anime.titleEnglish && anime.title !== anime.titleEnglish && (
            <p className="text-muted-foreground text-lg mb-2">{anime.title}</p>
          )}
          <div className="mb-4">
            <ShareButtons url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://aniyume.net'}/anime/${anime.slug}`} title={`${displayTitle} - AniYume`} />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl p-3 border border-border hover:border-primary/40 transition-colors">
              <div className="text-muted-foreground text-xs uppercase">Episodes</div>
              <div className="text-foreground font-bold text-lg">
                {anime.totalEpisodes || "?"}
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border hover:border-primary/40 transition-colors">
              <div className="text-muted-foreground text-xs uppercase">Score</div>
              <div className="text-foreground font-bold text-lg">
                {anime.averageScore
                  ? `${(anime.averageScore / 10).toFixed(1)}/10`
                  : "N/A"}
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border hover:border-primary/40 transition-colors">
              <div className="text-muted-foreground text-xs uppercase">Status</div>
              <div className="text-foreground font-bold text-lg">
                {anime.status
                  ? anime.status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Unknown"}
              </div>
            </div>
            {anime.seasonYear && (
              <div className="bg-card rounded-xl p-3 border border-border hover:border-primary/40 transition-colors">
                <div className="text-muted-foreground text-xs uppercase">Year</div>
                <div className="text-foreground font-bold text-lg">
                  {anime.season
                    ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1).toLowerCase()
                    : ""}{" "}
                  {anime.seasonYear}
                </div>
              </div>
            )}
            {anime.format && (
              <div className="bg-card rounded-xl p-3 border border-border hover:border-primary/40 transition-colors">
                <div className="text-muted-foreground text-xs uppercase">Format</div>
                <div className="text-foreground font-bold text-lg">{anime.format}</div>
              </div>
            )}
            {studios.length > 0 && (
              <div className="bg-card rounded-xl p-3 border border-border hover:border-primary/40 transition-colors">
                <div className="text-muted-foreground text-xs uppercase">Studio</div>
                <Link
                  href={`/studio/${studios[0].toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")}`}
                  className="text-foreground font-bold text-lg hover:text-primary transition-colors"
                >
                  {studios[0]}
                </Link>
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
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm border border-primary/20 hover:border-primary/50 hover:bg-primary/20 transition-all duration-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}

          {/* Description */}
          {anime.description && (
            <div className="prose prose-themed max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {anime.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <AdBanner className="mb-8" />

      {/* Guide Links */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Available Guides for {displayTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {anime.fillerMapping && (
            <Link
              href={`/anime/${anime.slug}/filler-list`}
              className="bg-gradient-to-br from-red-900/30 to-card border border-red-800/40 rounded-xl p-6 hover:border-red-500/60 hover:glow-card-hover transition-all duration-300 group"
            >
              <h3 className="text-foreground font-bold text-lg mb-2 group-hover:text-red-400 transition-colors">
                🎯 Filler Guide
              </h3>
              <p className="text-muted-foreground text-sm">
                {anime.fillerMapping.totalFiller} filler episodes identified (
                {Math.round(anime.fillerMapping.fillerPercent)}% of total)
              </p>
            </Link>
          )}
          {anime.totalEpisodes > 0 && (
            <Link
              href={`/anime/${anime.slug}/episodes`}
              className="bg-gradient-to-br from-blue-900/30 to-card border border-blue-800/40 rounded-xl p-6 hover:border-blue-500/60 hover:glow-card-hover transition-all duration-300 group"
            >
              <h3 className="text-foreground font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                📋 Episode Guide
              </h3>
              <p className="text-muted-foreground text-sm">
                Complete list of all {anime.totalEpisodes} episodes with details
              </p>
            </Link>
          )}
          {anime.relationsFrom.length > 0 && (
            <Link
              href={`/anime/${anime.slug}/watch-order`}
              className="bg-gradient-to-br from-purple-900/30 to-card border border-purple-800/40 rounded-xl p-6 hover:border-purple-500/60 hover:glow-card-hover transition-all duration-300 group"
            >
              <h3 className="text-foreground font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                📑 Watch Order
              </h3>
              <p className="text-muted-foreground text-sm">
                {anime.relationsFrom.length} related entries in the franchise
              </p>
            </Link>
          )}
        </div>
      </section>

      {/* Where to Watch */}
      {(() => {
        const externalLinks: { url: string; site: string; type: string | null }[] = (() => {
          try {
            return JSON.parse(anime.externalLinks || "[]");
          } catch {
            return [];
          }
        })();

        const streamingSites: Record<string, { color: string; label: string }> = {
          "Crunchyroll": { color: "from-orange-500 to-orange-600", label: "Crunchyroll" },
          "Funimation": { color: "from-purple-500 to-purple-700", label: "Funimation" },
          "Netflix": { color: "from-red-600 to-red-700", label: "Netflix" },
          "Hulu": { color: "from-green-500 to-green-600", label: "Hulu" },
          "HIDIVE": { color: "from-blue-500 to-blue-700", label: "HIDIVE" },
          "Disney Plus": { color: "from-blue-600 to-indigo-700", label: "Disney+" },
          "Amazon": { color: "from-cyan-600 to-blue-600", label: "Amazon" },
          "YouTube": { color: "from-red-500 to-red-600", label: "YouTube" },
          "VRV": { color: "from-yellow-500 to-orange-500", label: "VRV" },
        };

        const streamingLinks = externalLinks.filter(
          (link) => link.type === "STREAMING" || Object.keys(streamingSites).some((site) => link.site?.includes(site))
        );

        // Deduplicate by site name
        const uniqueStreamingLinks = streamingLinks.filter(
          (link, index, arr) => arr.findIndex((l) => l.site === link.site) === index
        );

        if (uniqueStreamingLinks.length === 0) return null;

        return (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Where to Watch {displayTitle}
            </h2>
            <div className="flex flex-wrap gap-3">
              {uniqueStreamingLinks.map((link, idx) => {
                const siteKey = Object.keys(streamingSites).find((s) => link.site?.includes(s));
                const siteInfo = siteKey ? streamingSites[siteKey] : null;

                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg hover:scale-105 transition-transform duration-200 ${
                      siteInfo
                        ? `bg-gradient-to-r ${siteInfo.color}`
                        : "bg-gradient-to-r from-gray-600 to-gray-700"
                    }`}
                  >
                    {siteInfo?.label || link.site}
                    <span className="text-xs opacity-80">↗</span>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Related Anime */}
      {anime.relationsFrom.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Related Anime</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anime.relationsFrom.map((relation) => (
              <Link
                key={relation.id}
                href={`/anime/${relation.toAnime.slug}`}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/40 hover:bg-card/80 transition-all duration-200 flex items-center gap-4"
              >
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 uppercase">
                  {relation.relationType.replace(/_/g, " ")}
                </span>
                <span className="text-foreground font-medium">
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
            <h2 className="text-2xl font-bold text-foreground">
              Anime Like {displayTitle}
            </h2>
            <Link
              href={`/anime-like/${anime.slug}`}
              className="text-primary hover:text-primary/80 text-sm transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarAnime.map((similar) => (
              <Link
                key={similar.id}
                href={`/anime/${similar.slug}`}
                className="bg-card rounded-xl p-3 border border-border hover:border-primary/40 hover:glow-card-hover transition-all duration-300 text-center"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-2">
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
                <p className="text-foreground text-xs font-medium line-clamp-2">
                  {similar.titleEnglish || similar.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Internal Links */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Explore More
        </h2>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/genre/${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
            >
              {genre} Anime
            </Link>
          ))}
          {anime.seasonYear && (
            <Link
              href={`/year/${anime.seasonYear}`}
              className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
            >
              {anime.seasonYear} Anime
            </Link>
          )}
          <Link
            href={`/anime-like/${anime.slug}`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
          >
            More Anime Like {displayTitle}
          </Link>
        </div>
      </section>

      <AdBanner className="mb-8" />
    </div>
  );
}
