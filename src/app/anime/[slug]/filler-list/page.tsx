import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import ShareButtons from "@/components/ShareButtons";
import FillerTimeline from "@/components/FillerTimeline";
import {
  generateFillerPageContent,
  generateMetaTitle,
  generateMetaDescription,
} from "@/lib/content-generator";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: { fillerMapping: true },
  });
  if (!anime) return { title: "Not Found" };

  const genres = JSON.parse(anime.genres || "[]");
  const animeData = { ...anime, genres };

  return {
    title: generateMetaTitle("filler", animeData),
    description: generateMetaDescription("filler", animeData),
    alternates: { canonical: `/anime/${slug}/filler-list` },
    openGraph: {
      title: `${anime.titleEnglish || anime.title} Filler List`,
      description: `Complete filler episode guide for ${anime.titleEnglish || anime.title}. ${anime.fillerMapping?.totalFiller || 0} filler episodes identified.`,
      images: [{ url: `/api/og?title=${encodeURIComponent((anime.titleEnglish || anime.title) + ' Filler List')}&subtitle=${encodeURIComponent((anime.fillerMapping?.totalFiller || 0) + ' filler episodes identified')}&type=filler` }],
    },
  };
}

export async function generateStaticParams() {
  try {
    const anime = await prisma.anime.findMany({
      where: { fillerMapping: { isNot: null } },
      select: { slug: true },
    });
    return anime.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export default async function FillerListPage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: {
      fillerMapping: true,
      episodes: {
        orderBy: { episodeNumber: "asc" },
      },
    },
  });

  if (!anime || !anime.fillerMapping) notFound();

  const genres = JSON.parse(anime.genres || "[]");
  const displayTitle = anime.titleEnglish || anime.title;
  const fillerEpisodes: number[] = JSON.parse(anime.fillerMapping.fillerEpisodes || "[]");
  const mixedEpisodes: number[] = JSON.parse(anime.fillerMapping.mixedEpisodes || "[]");

  const stats = {
    totalFiller: anime.fillerMapping.totalFiller,
    totalMixed: anime.fillerMapping.totalMixed,
    totalCanon: anime.fillerMapping.totalCanon,
    fillerPercent: anime.fillerMapping.fillerPercent,
  };

  const content = generateFillerPageContent({ ...anime, genres }, stats);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Anime", href: "/" },
          { label: displayTitle, href: `/anime/${anime.slug}` },
          { label: "Filler List" },
        ]}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${displayTitle} Filler Episode Guide`,
            description: `Complete filler guide for ${displayTitle} with ${stats.totalFiller} filler episodes identified.`,
            author: { "@type": "Organization", name: "AniYume" },
          }),
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `What are the filler episodes in ${displayTitle}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: fillerEpisodes.length > 0
                    ? `The filler episodes in ${displayTitle} are: ${formatEpisodeRanges(fillerEpisodes)}. These episodes do not follow the original manga storyline.`
                    : `${displayTitle} does not have any confirmed filler episodes.`,
                },
              },
              {
                "@type": "Question",
                name: `How many filler episodes does ${displayTitle} have?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${displayTitle} has ${stats.totalFiller} filler episodes out of ${anime.totalEpisodes} total episodes, along with ${stats.totalMixed} mixed canon/filler episodes.`,
                },
              },
              {
                "@type": "Question",
                name: `Should I skip ${displayTitle} filler episodes?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: stats.fillerPercent > 20
                    ? `With ${Math.round(stats.fillerPercent)}% filler content, skipping filler episodes in ${displayTitle} is recommended if you want to follow only the main storyline. This will save you ${stats.totalFiller} episodes.`
                    : `${displayTitle} has only ${Math.round(stats.fillerPercent)}% filler content, so the filler episodes are minimal. You can skip them without missing the main story, but they are few enough that watching them won't significantly delay your progress.`,
                },
              },
              {
                "@type": "Question",
                name: `What percentage of ${displayTitle} is filler?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${Math.round(stats.fillerPercent)}% of ${displayTitle} is filler. Out of ${anime.totalEpisodes} total episodes, ${stats.totalCanon} are canon, ${stats.totalFiller} are filler, and ${stats.totalMixed} are mixed canon/filler.`,
                },
              },
            ],
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        {displayTitle} Filler List
      </h1>
      <p className="text-muted-foreground text-lg mb-4">
        Complete filler episode guide — know which episodes to skip
      </p>
      <div className="mb-8">
        <ShareButtons url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aniyume.net'}/anime/${slug}/filler-list`} title={`${displayTitle} Filler List`} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-foreground">
            {anime.totalEpisodes}
          </div>
          <div className="text-muted-foreground text-sm">Total Episodes</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400">
            {stats.totalCanon}
          </div>
          <div className="text-muted-foreground text-sm">Canon</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-400">
            {stats.totalFiller}
          </div>
          <div className="text-muted-foreground text-sm">Filler</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">
            {stats.totalMixed}
          </div>
          <div className="text-muted-foreground text-sm">Mixed</div>
        </div>
      </div>

      {/* Filler percentage bar */}
      <div className="bg-muted rounded-lg p-4 mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Filler Percentage</span>
          <span className="text-foreground font-bold">
            {Math.round(stats.fillerPercent)}%
          </span>
        </div>
        <div className="bg-background rounded-full h-4 overflow-hidden flex border border-border">
          <div
            className="bg-green-500 h-full"
            style={{
              width: `${((stats.totalCanon / anime.totalEpisodes) * 100)}%`,
            }}
            title={`${stats.totalCanon} canon episodes`}
          />
          <div
            className="bg-yellow-500 h-full"
            style={{
              width: `${((stats.totalMixed / anime.totalEpisodes) * 100)}%`,
            }}
            title={`${stats.totalMixed} mixed episodes`}
          />
          <div
            className="bg-red-500 h-full"
            style={{
              width: `${stats.fillerPercent}%`,
            }}
            title={`${stats.totalFiller} filler episodes`}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded" /> Canon
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded" /> Mixed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded" /> Filler
          </span>
        </div>
      </div>

      {/* Interactive Filler Timeline */}
      <FillerTimeline
        episodes={anime.episodes.map((ep) => ({
          episodeNumber: ep.episodeNumber,
          isFiller: fillerEpisodes.includes(ep.episodeNumber),
          isMixed: mixedEpisodes.includes(ep.episodeNumber),
          arcName: ep.arcName,
        }))}
        totalCanon={stats.totalCanon}
        totalFiller={stats.totalFiller}
        totalMixed={stats.totalMixed}
        shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aniyume.net'}/anime/${slug}/filler-list`}
      />

      <AdBanner className="mb-8" />

      {/* Content */}
      <article className="prose prose-themed max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>

      {/* Episode Table */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Complete Episode List
        </h2>
        <div className="bg-muted rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-2 p-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-2">Episode</div>
            <div className="col-span-7">Title</div>
            <div className="col-span-3">Type</div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {anime.episodes.map((ep) => {
              const isFiller = fillerEpisodes.includes(ep.episodeNumber);
              const isMixed = mixedEpisodes.includes(ep.episodeNumber);
              const type = isFiller
                ? "filler"
                : isMixed
                ? "mixed"
                : "canon";

              return (
                <div
                  key={ep.id}
                  className={`grid grid-cols-12 gap-2 p-3 border-b border-border text-sm ${
                    isFiller
                      ? "bg-red-900/10"
                      : isMixed
                      ? "bg-yellow-900/10"
                      : ""
                  }`}
                >
                  <div className="col-span-2 text-muted-foreground font-mono">
                    #{ep.episodeNumber}
                  </div>
                  <div className="col-span-7 text-foreground">
                    {ep.title || `Episode ${ep.episodeNumber}`}
                  </div>
                  <div className="col-span-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        type === "filler"
                          ? "bg-red-500/20 text-red-400"
                          : type === "mixed"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {type === "filler"
                        ? "🔴 Filler"
                        : type === "mixed"
                        ? "🟡 Mixed"
                        : "🟢 Canon"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AdBanner className="mb-8" />

      {/* Quick Reference */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Filler Episodes Quick Reference
        </h2>
        <div className="bg-muted rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-3">
            Episodes you can safely skip:
          </p>
          <p className="text-red-400 font-mono text-sm break-all">
            {fillerEpisodes.length > 0
              ? formatEpisodeRanges(fillerEpisodes)
              : "No filler episodes identified"}
          </p>
        </div>
        {mixedEpisodes.length > 0 && (
          <div className="bg-muted rounded-lg p-4 mt-4">
            <p className="text-muted-foreground text-sm mb-3">
              Mixed canon/filler episodes (watch recommended):
            </p>
            <p className="text-yellow-400 font-mono text-sm break-all">
              {formatEpisodeRanges(mixedEpisodes)}
            </p>
          </div>
        )}
      </section>

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
            href={`/anime/${anime.slug}/episodes`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            📋 Episode Guide
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

function formatEpisodeRanges(episodes: number[]): string {
  if (episodes.length === 0) return "";
  const sorted = [...episodes].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(", ");
}
