import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import EpisodeTracker from "@/components/EpisodeTracker";
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
    alternates: { canonical: `/anime/${slug}/episodes` },
    openGraph: {
      images: [{ url: `/api/og?title=${encodeURIComponent((anime.titleEnglish || anime.title) + ' Episode Guide')}&subtitle=${encodeURIComponent('All ' + (anime.totalEpisodes || '') + ' episodes')}&type=episodes` }],
    },
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
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

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        {displayTitle} Episode Guide
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        All {anime.totalEpisodes} episodes with filler markers
      </p>

      {/* Episode Tracker */}
      <EpisodeTracker
        animeSlug={anime.slug}
        totalEpisodes={anime.totalEpisodes || anime.episodes.length}
        episodes={anime.episodes.map((ep) => ({ episodeNumber: ep.episodeNumber, title: ep.title }))}
      />

      {/* Content */}
      <article className="prose prose-themed max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      <AdBanner className="mb-8" />

      {/* Episode List */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">All Episodes</h2>

        {arcs.length > 1 ? (
          // Render by arc
          arcs.map((arc, arcIndex) => (
            <div key={arcIndex} className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-3">
                {arc.name}
              </h3>
              <div className="bg-muted rounded-lg overflow-hidden">
                {arc.episodes.map((ep) => {
                  const isFiller = fillerEpisodes.includes(ep.episodeNumber);
                  const isMixed = mixedEpisodes.includes(ep.episodeNumber);

                  return (
                    <div
                      key={ep.id}
                      className={`flex items-center justify-between p-3 border-b border-border last:border-0 ${
                        isFiller
                          ? "bg-red-900/10"
                          : isMixed
                          ? "bg-yellow-900/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-mono text-sm w-10">
                          {ep.episodeNumber}
                        </span>
                        <span className="text-foreground text-sm">
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
          <div className="bg-muted rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
            {anime.episodes.map((ep) => {
              const isFiller = fillerEpisodes.includes(ep.episodeNumber);
              const isMixed = mixedEpisodes.includes(ep.episodeNumber);

              return (
                <div
                  key={ep.id}
                  className={`flex items-center justify-between p-3 border-b border-border last:border-0 ${
                    isFiller
                      ? "bg-red-900/10"
                      : isMixed
                      ? "bg-yellow-900/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono text-sm w-10">
                      {ep.episodeNumber}
                    </span>
                    <span className="text-foreground text-sm">
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
        <h2 className="text-xl font-bold text-foreground mb-4">More Guides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/anime/${anime.slug}`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            ← {displayTitle} Overview
          </Link>
          <Link
            href={`/anime/${anime.slug}/filler-list`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            🎯 Filler Guide
          </Link>
          <Link
            href={`/anime/${anime.slug}/watch-order`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            📑 Watch Order
          </Link>
          <Link
            href={`/anime-like/${anime.slug}`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
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
