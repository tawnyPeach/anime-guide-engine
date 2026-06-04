import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import AnimeCard from "@/components/AnimeCard";
import { getRecommendations } from "@/lib/recommendations";

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbElEQVQoz2NkYPj/n4EBCxg1atR/BgYGRnwKGRgYGP7//8+Irhgbmx4dNWrUf0ZsLiTCRkYmBgYGhv+MDAzYXPgfi04kVY3EYxI+P+BQiO4mYhXi9AMxCsnlB7I4Aas7cQXBf1xuxJcwAHq0RckiXeZJAAAAAElFTkSuQmCC";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({ where: { slug } });
  if (!anime) return { title: "Not Found" };

  const displayTitle = anime.titleEnglish || anime.title;

  return {
    title: `What to Watch After ${displayTitle} | AniYume`,
    description: `Finished watching ${displayTitle}? Here are sequels, side stories, and similar anime recommendations to watch next.`,
    alternates: { canonical: `/after/${slug}` },
    openGraph: {
      title: `What to Watch After ${displayTitle}`,
      description: `Sequels, side stories, and similar anime recommendations after finishing ${displayTitle}.`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent("What to Watch After " + displayTitle)}&subtitle=Sequels+%26+Recommendations&type=after`,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  try {
    const anime = await prisma.anime.findMany({
      select: { slug: true },
      orderBy: { popularity: "desc" },
      take: 50,
    });
    return anime.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export default async function AfterPage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: { fillerMapping: true },
  });

  if (!anime) notFound();

  const displayTitle = anime.titleEnglish || anime.title;
  const genres: string[] = JSON.parse(anime.genres || "[]");

  // Get sequels, side stories, and recommendations in parallel
  const [sequelRelations, sideStoryRelations, recommendations] = await Promise.all([
    prisma.animeRelation.findMany({
      where: {
        fromAnimeId: anime.id,
        relationType: "SEQUEL",
      },
      include: {
        toAnime: {
          include: { fillerMapping: true },
        },
      },
    }),
    prisma.animeRelation.findMany({
      where: {
        fromAnimeId: anime.id,
        relationType: { in: ["SIDE_STORY", "SPIN_OFF"] },
      },
      include: {
        toAnime: {
          include: { fillerMapping: true },
        },
      },
    }),
    getRecommendations(anime.id, 10),
  ]);

  // Build structured data
  const allItems = [
    ...sequelRelations.map((r) => r.toAnime),
    ...sideStoryRelations.map((r) => r.toAnime),
    ...recommendations.map((r) => r.anime),
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Anime", href: "/" },
          { label: displayTitle, href: `/anime/${anime.slug}` },
          { label: "What to Watch Next" },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `What to Watch After ${displayTitle}`,
            numberOfItems: allItems.length,
            itemListElement: allItems.slice(0, 20).map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.titleEnglish || item.title,
              url: `https://www.aniyume.net/anime/${item.slug}`,
            })),
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden mb-8">
        <div className="relative h-48 md:h-64 bg-muted">
          {anime.bannerImage ? (
            <Image
              src={anime.bannerImage}
              alt={`${displayTitle} banner`}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          ) : anime.coverImage ? (
            <Image
              src={anime.coverImage}
              alt={`${displayTitle} cover`}
              fill
              className="object-cover object-top opacity-40"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">
              What to Watch After{" "}
              <span className="text-primary">{displayTitle}</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Finished {displayTitle}? Here are sequels, side stories, and
              similar anime you might enjoy next.
            </p>
          </div>
        </div>
      </section>

      {/* Continue the Story - Sequels */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-primary">&#9654;</span> Continue the Story
        </h2>
        {sequelRelations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sequelRelations.map((rel, index) => {
              const a = rel.toAnime;
              const aGenres: string[] = JSON.parse(a.genres || "[]");
              return (
                <AnimeCard
                  key={a.id}
                  title={a.title}
                  titleEnglish={a.titleEnglish}
                  slug={a.slug}
                  coverImage={a.coverImage}
                  genres={aGenres}
                  totalEpisodes={a.totalEpisodes}
                  averageScore={a.averageScore}
                  status={a.status}
                  seasonYear={a.seasonYear}
                  index={index}
                  fillerCount={a.fillerMapping?.totalFiller ?? null}
                  fillerPercent={
                    a.fillerMapping?.fillerPercent != null
                      ? Math.round(a.fillerMapping.fillerPercent)
                      : null
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              No direct sequels found for {displayTitle}. Check back later or
              explore the recommendations below.
            </p>
          </div>
        )}
      </section>

      {/* Side Stories & Spin-offs */}
      {sideStoryRelations.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-brand-orange">&#10038;</span> Side Stories &amp;
            Spin-offs
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sideStoryRelations.map((rel, index) => {
              const a = rel.toAnime;
              const aGenres: string[] = JSON.parse(a.genres || "[]");
              return (
                <AnimeCard
                  key={a.id}
                  title={a.title}
                  titleEnglish={a.titleEnglish}
                  slug={a.slug}
                  coverImage={a.coverImage}
                  genres={aGenres}
                  totalEpisodes={a.totalEpisodes}
                  averageScore={a.averageScore}
                  status={a.status}
                  seasonYear={a.seasonYear}
                  index={index}
                  fillerCount={a.fillerMapping?.totalFiller ?? null}
                  fillerPercent={
                    a.fillerMapping?.fillerPercent != null
                      ? Math.round(a.fillerMapping.fillerPercent)
                      : null
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      <AdBanner className="mb-8" />

      {/* Similar Anime Recommendations */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-brand-teal">&#9733;</span> Similar Anime You
          Might Enjoy
        </h2>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendations.map((rec, index) => {
              const recGenres: string[] = JSON.parse(rec.anime.genres || "[]");
              return (
                <div key={rec.anime.id} className="flex flex-col">
                  <AnimeCard
                    title={rec.anime.title}
                    titleEnglish={rec.anime.titleEnglish}
                    slug={rec.anime.slug}
                    coverImage={rec.anime.coverImage}
                    genres={recGenres}
                    totalEpisodes={rec.anime.totalEpisodes}
                    averageScore={rec.anime.averageScore}
                    status={rec.anime.status}
                    seasonYear={rec.anime.seasonYear}
                    index={index}
                  />
                  {rec.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 px-1">
                      {rec.reasons.slice(0, 2).map((reason, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 truncate max-w-full"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              No recommendations available yet. This anime may have limited
              genre data.
            </p>
          </div>
        )}
      </section>

      <AdBanner className="mb-8" />

      {/* Navigation Links */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/anime/${anime.slug}`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            &larr; Back to {displayTitle}
          </Link>
          <Link
            href={`/anime-like/${anime.slug}`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            &#128269; More Like {displayTitle}
          </Link>
          <Link
            href={`/anime/${anime.slug}/filler-list`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            &#127919; Filler Guide
          </Link>
          <Link
            href={`/anime/${anime.slug}/episodes`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            &#128203; Episode Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
