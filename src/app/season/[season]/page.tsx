import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";

export const revalidate = 86400;

interface Props {
  params: Promise<{ season: string }>;
}

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

function parseSeasonParam(param: string): { season: string; year: number } | null {
  // Format: "winter-2024" -> season="WINTER", year=2024
  const lastHyphen = param.lastIndexOf("-");
  if (lastHyphen === -1) return null;

  const seasonStr = param.substring(0, lastHyphen).toUpperCase();
  const yearStr = param.substring(lastHyphen + 1);
  const year = parseInt(yearStr, 10);

  if (isNaN(year) || year < 1960 || year > 2030) return null;
  if (!SEASONS.includes(seasonStr as typeof SEASONS[number])) return null;

  return { season: seasonStr, year };
}

function getAdjacentSeasons(season: string, year: number): { prev: string; next: string } {
  const idx = SEASONS.indexOf(season as typeof SEASONS[number]);

  let prevSeason: string;
  let prevYear: number;
  if (idx === 0) {
    prevSeason = SEASONS[3];
    prevYear = year - 1;
  } else {
    prevSeason = SEASONS[idx - 1];
    prevYear = year;
  }

  let nextSeason: string;
  let nextYear: number;
  if (idx === 3) {
    nextSeason = SEASONS[0];
    nextYear = year + 1;
  } else {
    nextSeason = SEASONS[idx + 1];
    nextYear = year;
  }

  return {
    prev: `${prevSeason.toLowerCase()}-${prevYear}`,
    next: `${nextSeason.toLowerCase()}-${nextYear}`,
  };
}

function formatSeasonDisplay(season: string, year: number): string {
  return `${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season: seasonParam } = await params;
  const parsed = parseSeasonParam(seasonParam);

  if (!parsed) {
    return { title: "Season Not Found" };
  }

  const display = formatSeasonDisplay(parsed.season, parsed.year);

  return {
    title: `${display} Anime - Seasonal Chart | AniYume`,
    description: `Complete list of anime from ${display}. Browse the ${display} anime season chart with ratings and details.`,
    alternates: { canonical: `/season/${seasonParam}` },
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(display + " Anime")}&subtitle=Seasonal+anime+chart&type=season`,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Determine current season
    let currentSeasonIdx: number;
    if (currentMonth < 3) currentSeasonIdx = 0; // Winter
    else if (currentMonth < 6) currentSeasonIdx = 1; // Spring
    else if (currentMonth < 9) currentSeasonIdx = 2; // Summer
    else currentSeasonIdx = 3; // Fall

    const params: { season: string }[] = [];
    let year = currentYear;
    let seasonIdx = currentSeasonIdx;

    // Generate 8 recent seasons going backwards
    for (let i = 0; i < 8; i++) {
      params.push({
        season: `${SEASONS[seasonIdx].toLowerCase()}-${year}`,
      });
      seasonIdx--;
      if (seasonIdx < 0) {
        seasonIdx = 3;
        year--;
      }
    }

    return params;
  } catch {
    return [];
  }
}

export default async function SeasonPage({ params }: Props) {
  const { season: seasonParam } = await params;
  const parsed = parseSeasonParam(seasonParam);

  if (!parsed) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl text-foreground">Invalid season format</h1>
        <p className="text-muted-foreground mt-2">Use format like winter-2024, spring-2024, etc.</p>
      </div>
    );
  }

  const { season, year } = parsed;
  const display = formatSeasonDisplay(season, year);
  const adjacent = getAdjacentSeasons(season, year);

  let allAnime: Awaited<ReturnType<typeof prisma.anime.findMany>> = [];
  try {
    allAnime = await prisma.anime.findMany({
      where: {
        season: season,
        seasonYear: year,
      },
      orderBy: { popularity: "desc" },
    });
  } catch {
    // Graceful degradation
  }

  const seasonEmoji: Record<string, string> = {
    WINTER: "❄️",
    SPRING: "🌸",
    SUMMER: "☀️",
    FALL: "🍂",
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Seasons", href: "/" },
          { label: `${display} Anime` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${display} Anime`,
            description: `Anime that aired during ${display}.`,
          }),
        }}
      />

      <div className="relative mb-8">
        <div className="absolute inset-0 hero-gradient rounded-xl opacity-50" />
        <div className="relative py-8 px-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {seasonEmoji[season] || ""} {display} Anime
          </h1>
          <p className="text-muted-foreground text-lg">
            {allAnime.length} anime from the {display} season
          </p>
        </div>
      </div>

      {/* Season Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/season/${adjacent.prev}`}
          className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
        >
          ← {formatSeasonDisplay(
            adjacent.prev.substring(0, adjacent.prev.lastIndexOf("-")).toUpperCase(),
            parseInt(adjacent.prev.substring(adjacent.prev.lastIndexOf("-") + 1))
          )}
        </Link>
        <Link
          href={`/season/${adjacent.next}`}
          className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
        >
          {formatSeasonDisplay(
            adjacent.next.substring(0, adjacent.next.lastIndexOf("-")).toUpperCase(),
            parseInt(adjacent.next.substring(adjacent.next.lastIndexOf("-") + 1))
          )} →
        </Link>
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
        <div className="bg-card rounded-xl p-8 text-center mb-8 border border-border">
          <p className="text-muted-foreground">
            No anime found for {display}. Check back after running the seed script or try a different season.
          </p>
        </div>
      )}

      <AdBanner className="mb-8" />

      {/* Browse Other Seasons */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Browse Seasons</h2>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => (
            <Link
              key={`${s}-${year}`}
              href={`/season/${s.toLowerCase()}-${year}`}
              className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                s === season
                  ? "bg-gradient-to-r from-primary to-brand-teal text-primary-foreground shadow-lg glow-primary"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              {seasonEmoji[s]} {s.charAt(0) + s.slice(1).toLowerCase()} {year}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
