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
import {
  buildFullWatchOrder,
  WatchOrderEntry,
} from "@/lib/watch-order-builder";

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
    alternates: { canonical: `/anime/${slug}/watch-order` },
    openGraph: {
      images: [{ url: `/api/og?title=${encodeURIComponent((anime.titleEnglish || anime.title) + ' Watch Order')}&subtitle=Complete+franchise+viewing+guide&type=watch-order` }],
    },
  };
}

export async function generateStaticParams() {
  try {
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
  } catch {
    return [];
  }
}

function getFormatColor(format: string | null): string {
  switch (format) {
    case "TV":
      return "border-l-blue-500";
    case "MOVIE":
      return "border-l-amber-500";
    case "OVA":
      return "border-l-green-500";
    case "ONA":
      return "border-l-teal-500";
    case "SPECIAL":
      return "border-l-purple-500";
    default:
      return "border-l-gray-500";
  }
}

function getFormatBadgeStyle(format: string | null): string {
  switch (format) {
    case "TV":
      return "bg-blue-600/20 text-blue-400 border-blue-700/30";
    case "MOVIE":
      return "bg-amber-600/20 text-amber-400 border-amber-700/30";
    case "OVA":
      return "bg-green-600/20 text-green-400 border-green-700/30";
    case "ONA":
      return "bg-teal-600/20 text-teal-400 border-teal-700/30";
    case "SPECIAL":
      return "bg-purple-600/20 text-purple-400 border-purple-700/30";
    default:
      return "bg-gray-600/20 text-gray-400 border-gray-700/30";
  }
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

  // Build the full franchise watch order
  const watchOrder = await buildFullWatchOrder(anime.id);

  // Generate SEO content using the main order entries for the content generator
  const allRelated = [
    ...watchOrder.mainOrder
      .filter((e) => !e.isCurrentAnime)
      .map((e) => ({ title: e.title, slug: e.slug, type: e.relationType })),
    ...watchOrder.supplementary
      .filter((e) => !e.isCurrentAnime)
      .map((e) => ({ title: e.title, slug: e.slug, type: e.relationType })),
  ];

  const content = generateWatchOrderContent({ ...anime, genres }, allRelated);

  const hasEntries = watchOrder.totalEntries > 0;

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
                name: `What order should I watch ${displayTitle}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: watchOrder.mainOrder.length > 0
                    ? `The recommended watch order for ${displayTitle} is: ${watchOrder.mainOrder.map((e, i) => `${i + 1}. ${e.title}`).join(', ')}.`
                    : `${displayTitle} is a standalone series and can be watched on its own without any specific order.`,
                },
              },
              {
                "@type": "Question",
                name: `How many entries are in the ${displayTitle} franchise?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The ${displayTitle} franchise has ${watchOrder.totalEntries} entries in total, including ${watchOrder.mainOrder.length} main entries${watchOrder.supplementary.length > 0 ? ` and ${watchOrder.supplementary.length} supplementary entries (OVAs, movies, side stories)` : ''}.`,
                },
              },
              {
                "@type": "Question",
                name: `Can I watch ${displayTitle} without watching the prequels?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: watchOrder.mainOrder.length > 1
                    ? `While ${displayTitle} can be enjoyed on its own, watching the franchise in order provides the best experience. The recommended starting point is ${watchOrder.mainOrder[0]?.title || displayTitle}, which establishes the characters and world.`
                    : `Yes, ${displayTitle} is a standalone entry and does not require watching any other series first.`,
                },
              },
            ],
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
        {displayTitle} Watch Order
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        The recommended order to watch the {displayTitle} series
      </p>

      <AdBanner className="mb-8" />

      {/* SEO Content */}
      <article className="prose prose-invert max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      {/* Standalone anime message */}
      {!hasEntries && (
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Standalone Series
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto">
              <strong>{displayTitle}</strong> is a standalone anime. You can
              start watching it directly without any prerequisites!
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href={`/anime/${anime.slug}`}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                View Anime Details
              </Link>
              <Link
                href={`/anime-like/${anime.slug}`}
                className="bg-anime-card text-gray-300 px-4 py-2 rounded-lg border border-anime-border hover:border-purple-700/40 text-sm transition-all"
              >
                Find Similar Anime
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quick Summary */}
      {hasEntries && watchOrder.mainOrder.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Quick Watch Order
          </h2>
          <div className="bg-anime-card rounded-xl border border-anime-border p-5">
            <div className="flex flex-wrap items-center gap-2">
              {watchOrder.mainOrder.map((entry, index) => (
                <span key={entry.animeId} className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      entry.isCurrentAnime
                        ? "text-purple-300 font-bold"
                        : "text-gray-300"
                    }`}
                  >
                    <span className="text-purple-500 font-bold">
                      {index + 1}.
                    </span>{" "}
                    {entry.title}
                  </span>
                  {index < watchOrder.mainOrder.length - 1 && (
                    <span className="text-purple-600">&#8250;</span>
                  )}
                </span>
              ))}
            </div>
            {watchOrder.supplementary.length > 0 && (
              <p className="text-gray-500 text-xs mt-3">
                + {watchOrder.supplementary.length} optional{" "}
                {watchOrder.supplementary.length === 1 ? "entry" : "entries"}{" "}
                (OVAs, movies, side stories)
              </p>
            )}
          </div>
        </section>
      )}

      {/* Detailed Watch Order Timeline */}
      {hasEntries && watchOrder.mainOrder.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Detailed Watch Order
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 via-blue-600 to-purple-600 opacity-50" />

            <div className="space-y-4">
              {watchOrder.mainOrder.map((entry, index) => (
                <WatchOrderCard
                  key={entry.animeId}
                  entry={entry}
                  index={index + 1}
                  isSupplementary={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Supplementary Content */}
      {watchOrder.supplementary.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Optional: OVAs, Movies &amp; Side Stories
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            These entries expand the story but are not required for the main
            plot.
          </p>
          <div className="space-y-3">
            {watchOrder.supplementary.map((entry, index) => (
              <WatchOrderCard
                key={entry.animeId}
                entry={entry}
                index={index + 1}
                isSupplementary={true}
              />
            ))}
          </div>
        </section>
      )}

      <AdBanner className="mb-8" />

      {/* Internal Links */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">More Guides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/anime/${anime.slug}`}
            className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-purple-700/40 hover:text-purple-300 text-sm transition-all duration-200"
          >
            &larr; {displayTitle} Overview
          </Link>
          <Link
            href={`/anime/${anime.slug}/filler-list`}
            className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-blue-700/40 hover:text-blue-300 text-sm transition-all duration-200"
          >
            🎯 Filler Guide
          </Link>
          <Link
            href={`/anime/${anime.slug}/episodes`}
            className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-pink-700/40 hover:text-pink-300 text-sm transition-all duration-200"
          >
            📋 Episode Guide
          </Link>
        </div>
      </section>
    </div>
  );
}

function WatchOrderCard({
  entry,
  index,
  isSupplementary,
}: {
  entry: WatchOrderEntry;
  index: number;
  isSupplementary: boolean;
}) {
  const formatColor = getFormatColor(entry.format);
  const formatBadge = getFormatBadgeStyle(entry.format);

  const cardContent = (
    <div
      className={`relative flex items-start gap-4 ${
        isSupplementary ? "pl-0" : "pl-12"
      }`}
    >
      {/* Timeline node (only for main entries) */}
      {!isSupplementary && (
        <div className="absolute left-3 top-4 z-10">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              entry.isCurrentAnime
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                : "bg-gray-800 border-2 border-purple-600/50 text-purple-400"
            }`}
          >
            {index}
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className={`flex-1 rounded-xl p-4 border-l-4 transition-all duration-300 ${formatColor} ${
          entry.isCurrentAnime
            ? "bg-gradient-to-r from-purple-900/30 to-blue-900/20 border border-l-4 border-purple-500/50 shadow-lg shadow-purple-500/10"
            : isSupplementary
            ? "bg-anime-card border border-l-4 border-dashed border-anime-border hover:border-gray-600"
            : "bg-anime-card border border-l-4 border-anime-border hover:border-purple-700/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-md uppercase font-bold border ${formatBadge}`}
              >
                {entry.format || "TV"}
              </span>
              {entry.isCurrentAnime && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold">
                  You are here
                </span>
              )}
              {isSupplementary && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-700/50 text-gray-400 border border-gray-600/30">
                  Optional
                </span>
              )}
            </div>
            <h3
              className={`font-semibold truncate ${
                entry.isCurrentAnime ? "text-purple-200" : "text-white"
              }`}
            >
              {!isSupplementary && (
                <span className="text-gray-500 mr-1">#{index}</span>
              )}
              {entry.title}
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">
              {entry.totalEpisodes > 0
                ? `${entry.totalEpisodes} episode${entry.totalEpisodes !== 1 ? "s" : ""}`
                : "Unknown episodes"}
              {entry.seasonYear && (
                <span> &bull; {entry.seasonYear}</span>
              )}
            </p>
          </div>
          {!entry.isCurrentAnime && (
            <span className="text-purple-400 text-lg ml-2 flex-shrink-0">
              &rarr;
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (entry.isCurrentAnime) {
    return <div>{cardContent}</div>;
  }

  return (
    <Link
      href={`/anime/${entry.slug}`}
      className="block hover:opacity-90 transition-opacity"
    >
      {cardContent}
    </Link>
  );
}
