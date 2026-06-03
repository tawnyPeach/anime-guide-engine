import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";

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
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const listType = LIST_TYPES[type];

  if (!listType) {
    return { title: "Top Anime Lists" };
  }

  return {
    title: `${listType.title} - Top 100 | Anime Guide Engine`,
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
  ];
}

export default async function TopListPage({ params }: Props) {
  const { type } = await params;
  const listType = LIST_TYPES[type];

  if (!listType) notFound();

  let allAnime: Awaited<ReturnType<typeof prisma.anime.findMany>> = [];

  try {
    switch (type) {
      case "highest-rated":
        allAnime = await prisma.anime.findMany({
          where: { averageScore: { not: null } },
          orderBy: { averageScore: "desc" },
          take: 100,
        });
        break;
      case "most-popular":
        allAnime = await prisma.anime.findMany({
          orderBy: { popularity: "desc" },
          take: 100,
        });
        break;
      case "longest-running":
        allAnime = await prisma.anime.findMany({
          where: { totalEpisodes: { gt: 0 } },
          orderBy: { totalEpisodes: "desc" },
          take: 100,
        });
        break;
    }
  } catch {
    // Graceful degradation
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <p className="text-gray-400 text-lg">{listType.description}</p>
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
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg glow-purple"
                : "bg-anime-card text-gray-300 border border-anime-border hover:border-purple-700/40 hover:text-purple-300"
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
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-anime-card rounded-xl p-8 text-center mb-8 border border-anime-border">
          <p className="text-gray-400">
            No anime data available yet. Run the seed script to populate the database.
          </p>
        </div>
      )}

      <AdBanner className="mb-8" />
    </div>
  );
}
