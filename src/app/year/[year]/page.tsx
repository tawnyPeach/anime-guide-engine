import { Metadata } from "next";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import {
  generateYearPageContent,
  generateMetaTitle,
  generateMetaDescription,
} from "@/lib/content-generator";

export const revalidate = 86400;

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: generateMetaTitle("year", undefined, year),
    description: generateMetaDescription("year", undefined, year),
  };
}

export async function generateStaticParams() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => ({
    year: String(currentYear - i),
  }));
  return years;
}

export default async function YearPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year) || year < 1960 || year > 2030) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl text-white">Invalid year</h1>
      </div>
    );
  }

  const allAnime = await prisma.anime.findMany({
    where: { seasonYear: year },
    orderBy: [{ averageScore: "desc" }, { popularity: "desc" }],
    take: 50,
  });

  // Group by season
  const seasons: Record<string, typeof allAnime> = {
    WINTER: [],
    SPRING: [],
    SUMMER: [],
    FALL: [],
    OTHER: [],
  };
  for (const anime of allAnime) {
    const season = anime.season || "OTHER";
    if (seasons[season]) {
      seasons[season].push(anime);
    } else {
      seasons.OTHER.push(anime);
    }
  }

  const content = generateYearPageContent(year, allAnime.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Years", href: "/" },
          { label: `${year} Anime` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Best Anime of ${year}`,
            description: `Top anime series that aired in ${year}.`,
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Best Anime of {year}
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        Top {allAnime.length} anime series from {year}
      </p>

      {/* Content */}
      <article className="prose prose-invert max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }}
        />
      </article>

      <AdBanner className="mb-8" />

      {/* By Season */}
      {(["WINTER", "SPRING", "SUMMER", "FALL"] as const).map((season) => {
        const seasonAnime = seasons[season];
        if (seasonAnime.length === 0) return null;

        const seasonEmoji: Record<string, string> = {
          WINTER: "❄️",
          SPRING: "🌸",
          SUMMER: "☀️",
          FALL: "🍂",
        };

        return (
          <section key={season} className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {seasonEmoji[season]} {season.charAt(0) + season.slice(1).toLowerCase()}{" "}
              {year}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seasonAnime.map((anime) => (
                <AnimeCard
                  key={anime.id}
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
              ))}
            </div>
          </section>
        );
      })}

      {/* All anime if no season data */}
      {allAnime.length > 0 &&
        Object.values(seasons).every((s) => s.length === 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {allAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
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
            ))}
          </div>
        )}

      <AdBanner className="mb-8" />

      {/* Year Navigation */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Browse by Year</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, i) => year - 5 + i).map((y) => (
            <a
              key={y}
              href={`/year/${y}`}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                y === year
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
