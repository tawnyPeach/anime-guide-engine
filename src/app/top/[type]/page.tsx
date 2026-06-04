import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import TopFilterBar from "@/components/TopFilterBar";

export const revalidate = 86400;

interface Props {
  params: Promise<{ type: string }>;
}

const LIST_TYPES: Record<string, { title: string; description: string; emoji: string }> = {
  "highest-rated": {
    title: "Highest Rated Anime",
    description: "Top anime ranked by average score from community ratings.",
    emoji: "⭐",
  },
  "most-popular": {
    title: "Most Popular Anime",
    description: "The most popular anime based on community engagement and viewership.",
    emoji: "🔥",
  },
  "longest-running": {
    title: "Longest Running Anime",
    description: "Anime series with the most episodes, from long-running shonen to enduring classics.",
    emoji: "📺",
  },
  "currently-airing": {
    title: "Currently Airing Anime",
    description: "Anime series currently broadcasting new episodes.",
    emoji: "📡",
  },
  "most-filler": {
    title: "Most Filler Anime",
    description: "Anime series ranked by highest filler episode percentage.",
    emoji: "⏭️",
  },
  "least-filler": {
    title: "Least Filler Anime",
    description: "Anime series with the lowest filler percentage - mostly canon content.",
    emoji: "✅",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const listType = LIST_TYPES[type];

  if (!listType) {
    return { title: "Top Anime Lists" };
  }

  return {
    title: `${listType.title} - Top 100 | AniYume`,
    description: listType.description,
    alternates: { canonical: `/top/${type}` },
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(listType.title)}&subtitle=Top+100+ranked+list&type=top`,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  return [
    { type: "highest-rated" },
    { type: "most-popular" },
    { type: "longest-running" },
    { type: "currently-airing" },
    { type: "most-filler" },
    { type: "least-filler" },
  ];
}

interface AnimeWithFiller {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  coverImage: string | null;
  genres: string;
  totalEpisodes: number;
  averageScore: number | null;
  status: string | null;
  seasonYear: number | null;
  fillerMapping?: { totalFiller: number; fillerPercent: number } | null;
}

export default async function TopListPage({ params }: Props) {
  const { type } = await params;
  const listType = LIST_TYPES[type];

  if (!listType) notFound();

  let allAnime: AnimeWithFiller[] = [];

  try {
    switch (type) {
      case "highest-rated":
        allAnime = await prisma.anime.findMany({
          where: { averageScore: { not: null } },
          orderBy: { averageScore: "desc" },
          take: 100,
          include: { fillerMapping: { select: { totalFiller: true, fillerPercent: true } } },
        });
        break;
      case "most-popular":
        allAnime = await prisma.anime.findMany({
          orderBy: { popularity: "desc" },
          take: 100,
          include: { fillerMapping: { select: { totalFiller: true, fillerPercent: true } } },
        });
        break;
      case "longest-running":
        allAnime = await prisma.anime.findMany({
          where: { totalEpisodes: { gt: 0 } },
          orderBy: { totalEpisodes: "desc" },
          take: 100,
          include: { fillerMapping: { select: { totalFiller: true, fillerPercent: true } } },
        });
        break;
      case "currently-airing":
        allAnime = await prisma.anime.findMany({
          where: { status: "RELEASING" },
          orderBy: { popularity: "desc" },
          take: 100,
          include: { fillerMapping: { select: { totalFiller: true, fillerPercent: true } } },
        });
        break;
      case "most-filler": {
        const fillerResults = await prisma.fillerMapping.findMany({
          orderBy: { fillerPercent: "desc" },
          take: 100,
          include: {
            anime: {
              select: {
                id: true,
                title: true,
                titleEnglish: true,
                slug: true,
                coverImage: true,
                genres: true,
                totalEpisodes: true,
                averageScore: true,
                status: true,
                seasonYear: true,
              },
            },
          },
        });
        allAnime = fillerResults.map((fm) => ({
          ...fm.anime,
          fillerMapping: { totalFiller: fm.totalFiller, fillerPercent: fm.fillerPercent },
        }));
        break;
      }
      case "least-filler": {
        const leastFillerResults = await prisma.fillerMapping.findMany({
          where: { fillerPercent: { gt: 0 } },
          orderBy: { fillerPercent: "asc" },
          take: 100,
          include: {
            anime: {
              select: {
                id: true,
                title: true,
                titleEnglish: true,
                slug: true,
                coverImage: true,
                genres: true,
                totalEpisodes: true,
                averageScore: true,
                status: true,
                seasonYear: true,
              },
            },
          },
        });
        allAnime = leastFillerResults.map((fm) => ({
          ...fm.anime,
          fillerMapping: { totalFiller: fm.totalFiller, fillerPercent: fm.fillerPercent },
        }));
        break;
      }
    }
  } catch {
    // Graceful degradation
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Top Anime", href: "/top/most-popular" },
          { label: listType.title },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: listType.title,
            description: listType.description,
            numberOfItems: allAnime.length,
            itemListElement: allAnime.slice(0, 10).map((anime, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: anime.titleEnglish || anime.title,
              url: `/anime/${anime.slug}`,
            })),
          }),
        }}
      />

      <div className="relative mb-8">
        <div className="absolute inset-0 hero-gradient rounded-xl opacity-50" />
        <div className="relative py-8 px-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {listType.emoji} {listType.title}
          </h1>
          <p className="text-muted-foreground text-lg">{listType.description}</p>
        </div>
      </div>

      {/* List Type Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(LIST_TYPES).map(([key, info]) => (
          <a
            key={key}
            href={`/top/${key}`}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
              key === type
                ? "bg-gradient-to-r from-primary to-brand-teal text-primary-foreground shadow-lg glow-primary"
                : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-primary"
            }`}
          >
            {info.emoji} {info.title}
          </a>
        ))}
      </div>

      <AdBanner className="mb-8" />

      {allAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {allAnime.map((anime, index) => (
            <div key={anime.id} className="relative">
              <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                #{index + 1}
              </span>
              <AnimeCard
                title={anime.title}
                titleEnglish={anime.titleEnglish}
                slug={anime.slug}
                coverImage={anime.coverImage}
                genres={JSON.parse(anime.genres || "[]")}
                totalEpisodes={anime.totalEpisodes}
                averageScore={anime.averageScore}
                status={anime.status}
                seasonYear={anime.seasonYear}
                fillerCount={anime.fillerMapping?.totalFiller}
                fillerPercent={anime.fillerMapping?.fillerPercent}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-8 text-center mb-8 border border-border">
          <p className="text-muted-foreground">
            No anime data available yet. Run the seed script to populate the database.
          </p>
        </div>
      )}

      {/* Client-side filter bar and pagination */}
      <TopFilterBar type={type} />

      <AdBanner className="mb-8" />
    </div>
  );
}
