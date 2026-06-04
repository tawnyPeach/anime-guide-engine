import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import { getRecommendations } from "@/lib/recommendations";
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
    alternates: { canonical: `/anime-like/${slug}` },
    openGraph: {
      images: [{ url: `/api/og?title=${encodeURIComponent('Anime Like ' + (anime.titleEnglish || anime.title))}&subtitle=Similar+anime+recommendations&type=anime-like` }],
    },
  };
}

export async function generateStaticParams() {
  try {
    const anime = await prisma.anime.findMany({
      select: { slug: true },
      orderBy: { popularity: "desc" },
      take: 100,
    });
    return anime.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export default async function AnimeLikePage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({ where: { slug } });

  if (!anime) notFound();

  const genres: string[] = JSON.parse(anime.genres || "[]");
  const displayTitle = anime.titleEnglish || anime.title;

  // Use enhanced recommendation engine
  const recommendations = await getRecommendations(anime.id, 20);

  const content = generateAnimeLikeContent(
    { ...anime, genres },
    recommendations.slice(0, 10).map((r) => ({
      title: r.anime.titleEnglish || r.anime.title,
      slug: r.anime.slug,
    }))
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
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
            numberOfItems: recommendations.length,
            itemListElement: recommendations.slice(0, 10).map((r, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: r.anime.titleEnglish || r.anime.title,
              url: `/anime/${r.anime.slug}`,
            })),
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        Anime Like {displayTitle}
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        {recommendations.length} anime similar to {displayTitle} based on genre,
        format, studio, and popularity
      </p>

      {/* Content */}
      <article className="prose prose-themed max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      <AdBanner className="mb-8" />

      {/* Recommendations Grid */}
      {recommendations.length > 0 ? (
        <div className="space-y-4 mb-8">
          {recommendations.map((rec, index) => {
            const simGenres: string[] = JSON.parse(rec.anime.genres || "[]");
            const sharedGenres = genres.filter((g) => simGenres.includes(g));

            return (
              <Link
                key={rec.anime.id}
                href={`/anime/${rec.anime.slug}`}
                className="block bg-card border border-border rounded-lg p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-muted-foreground/40 w-8">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold text-lg">
                      {rec.anime.titleEnglish || rec.anime.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {rec.anime.totalEpisodes > 0 && (
                        <span>{rec.anime.totalEpisodes} eps</span>
                      )}
                      {rec.anime.averageScore && (
                        <span>
                          ⭐ {(rec.anime.averageScore / 10).toFixed(1)}
                        </span>
                      )}
                      {rec.anime.seasonYear && <span>{rec.anime.seasonYear}</span>}
                      <span className="text-primary">
                        Score: {rec.score.toFixed(1)}
                      </span>
                    </div>
                    {/* Recommendation reasons */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.reasons.map((reason, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {simGenres.slice(0, 4).map((g) => (
                        <span
                          key={g}
                          className={`text-xs px-2 py-0.5 rounded ${
                            sharedGenres.includes(g)
                              ? "bg-blue-600/20 text-blue-500 dark:text-blue-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    {rec.anime.description && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {rec.anime.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {sharedGenres.length}/{genres.length} genres match
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-8 text-center mb-8">
          <p className="text-muted-foreground">
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
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            ← Back to {displayTitle}
          </Link>
          <Link
            href={`/anime/${anime.slug}/filler-list`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            🎯 Filler Guide
          </Link>
          <Link
            href={`/anime/${anime.slug}/episodes`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            📋 Episode Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
