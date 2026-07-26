import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";

export const dynamic = "force-dynamic";

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

function getCurrentSeason(): { season: string; year: number } {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let season: string;
  if (month < 3) season = "WINTER";
  else if (month < 6) season = "SPRING";
  else if (month < 9) season = "SUMMER";
  else season = "FALL";
  return { season, year };
}

function getNextSeason(
  season: string,
  year: number
): { season: string; year: number } {
  const idx = SEASONS.indexOf(season as (typeof SEASONS)[number]);
  if (idx === 3) return { season: SEASONS[0], year: year + 1 };
  return { season: SEASONS[idx + 1], year };
}

function formatSeason(season: string, year: number): string {
  return `${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`;
}

const SEASON_EMOJI: Record<string, string> = {
  WINTER: "❄️",
  SPRING: "🌸",
  SUMMER: "☀️",
  FALL: "🍂",
};

export async function generateMetadata(): Promise<Metadata> {
  const { season, year } = getCurrentSeason();
  const display = formatSeason(season, year);
  return {
    title: `Anime Seasonal Chart - ${display}`,
    description: `Browse the ${display} anime seasonal chart. View rankings, scores, studios, and airing schedules for this season's anime lineup.`,
    alternates: { canonical: "/seasonal" },
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`Seasonal Chart - ${display}`)}&subtitle=Anime+rankings+and+schedule&type=season`,
        },
      ],
    },
  };
}

export default async function SeasonalPage() {
  const { season: currentSeason, year: currentYear } = getCurrentSeason();
  const { season: nextSeason, year: nextYear } = getNextSeason(
    currentSeason,
    currentYear
  );

  const allSeasons: { season: string; year: number; isUpcoming?: boolean }[] = [
    ...SEASONS.map((s) => ({ season: s, year: currentYear })),
    { season: nextSeason, year: nextYear, isUpcoming: true },
  ];

  const seasonQueries = await Promise.all(
    allSeasons.map(async (s) => {
      try {
        const anime = await prisma.anime.findMany({
          where: { season: s.season, seasonYear: s.year },
          orderBy: { popularity: "desc" },
        });
        return { ...s, anime };
      } catch {
        return { ...s, anime: [] };
      }
    })
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Seasons", href: "/" },
          { label: "Seasonal Chart" },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Anime Seasonal Chart - ${formatSeason(currentSeason, currentYear)}`,
            description: `Current anime seasonal chart for ${formatSeason(currentSeason, currentYear)}`,
            numberOfItems: seasonQueries[0]?.anime.length || 0,
            itemListElement: (
              seasonQueries[0]?.anime || []
            )
              .slice(0, 20)
              .map((anime, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: anime.titleEnglish || anime.title,
                url: `/anime/${anime.slug}`,
              })),
          }),
        }}
      />

      {/* Hero */}
      <div className="relative mb-8">
        <div className="absolute inset-0 hero-gradient rounded-xl opacity-50" />
        <div className="relative py-8 px-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            🗓️ Anime Seasonal Chart
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse anime by season. Rankings sorted by popularity.
          </p>
        </div>
      </div>

      {/* Season Tabs (server-side, each links to the section) */}
      <nav className="flex flex-wrap gap-2 mb-8" aria-label="Season tabs">
        {allSeasons.map((s) => {
          const label = s.isUpcoming
            ? `Upcoming (${formatSeason(s.season, s.year)})`
            : formatSeason(s.season, s.year);
          return (
            <a
              key={`${s.season}-${s.year}`}
              href={`#season-${s.season.toLowerCase()}-${s.year}`}
              className="px-4 py-2 rounded-xl text-sm transition-all duration-200 bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-primary"
            >
              {SEASON_EMOJI[s.season]} {label}
            </a>
          );
        })}
      </nav>

      <AdBanner className="mb-8" />

      {/* Season Sections */}
      {seasonQueries.map((sq) => {
        const label = sq.isUpcoming
          ? `Upcoming - ${formatSeason(sq.season, sq.year)}`
          : formatSeason(sq.season, sq.year);

        return (
          <section
            key={`${sq.season}-${sq.year}`}
            id={`season-${sq.season.toLowerCase()}-${sq.year}`}
            className="mb-12 scroll-mt-24"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-primary rounded-full mr-3" />
                <h2 className="text-2xl font-bold text-foreground">
                  {SEASON_EMOJI[sq.season]} {label}
                </h2>
                <span className="ml-3 text-sm text-muted-foreground">
                  {sq.anime.length} anime
                </span>
              </div>
              <Link
                href={`/season/${sq.season.toLowerCase()}-${sq.year}`}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Full season &rarr;
              </Link>
            </div>

            {sq.anime.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium w-12">#</th>
                      <th className="pb-3 pr-4 font-medium">Title</th>
                      <th className="pb-3 pr-4 font-medium w-20">Score</th>
                      <th className="pb-3 pr-4 font-medium w-20">Eps</th>
                      <th className="pb-3 pr-4 font-medium hidden md:table-cell">
                        Studio
                      </th>
                      <th className="pb-3 pr-4 font-medium hidden lg:table-cell">
                        Genres
                      </th>
                      <th className="pb-3 font-medium hidden sm:table-cell w-28">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sq.anime.map((anime, index) => {
                      const genres: string[] = JSON.parse(anime.genres || "[]");
                      const studios: string[] = anime.studios
                        ? JSON.parse(anime.studios)
                        : [];
                      const displayTitle =
                        anime.titleEnglish || anime.title;
                      const statusLabel: Record<string, string> = {
                        RELEASING: "Airing",
                        FINISHED: "Finished",
                        NOT_YET_RELEASED: "Upcoming",
                        CANCELLED: "Cancelled",
                      };

                      return (
                        <tr
                          key={anime.id}
                          className="border-b border-border/50 hover:bg-card/50 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <Link
                              href={`/anime/${anime.slug}`}
                              className="flex items-center gap-3 group"
                            >
                              <div className="relative w-10 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                {anime.coverImage ? (
                                  <Image
                                    src={anime.coverImage}
                                    alt={displayTitle}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    🎬
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="block font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-xs">
                                  {displayTitle}
                                </span>
                                {anime.titleEnglish &&
                                  anime.title !== anime.titleEnglish && (
                                    <span className="block text-xs text-muted-foreground truncate max-w-xs">
                                      {anime.title}
                                    </span>
                                  )}
                              </div>
                            </Link>
                          </td>
                          <td className="py-3 pr-4">
                            {anime.averageScore ? (
                              <span className="flex items-center gap-1 font-medium text-brand-orange">
                                <svg
                                  className="h-3 w-3 fill-current"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                {(anime.averageScore / 10).toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {anime.totalEpisodes > 0
                              ? anime.totalEpisodes
                              : "—"}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">
                            {studios.length > 0
                              ? studios.slice(0, 2).join(", ")
                              : "—"}
                          </td>
                          <td className="py-3 pr-4 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {genres.slice(0, 3).map((g) => (
                                <span
                                  key={g}
                                  className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 hidden sm:table-cell">
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                anime.status === "RELEASING"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : anime.status === "FINISHED"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : anime.status === "NOT_YET_RELEASED"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {statusLabel[anime.status || ""] || anime.status || "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-8 text-center border border-border">
                <p className="text-muted-foreground">
                  No anime found for {label}. Data will appear once the season
                  starts or after running the seed script.
                </p>
              </div>
            )}
          </section>
        );
      })}

      {/* Schedule Section */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-brand-orange rounded-full mr-3" />
          <h2 className="text-2xl font-bold text-foreground">
            📅 Airing Schedule
          </h2>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-muted-foreground mb-4">
            Airing days and times for currently airing anime this season.
          </p>
          {seasonQueries[0]?.anime.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {seasonQueries[0].anime
                .filter((a) => a.status === "RELEASING")
                .slice(0, 12)
                .map((anime) => (
                  <Link
                    key={anime.id}
                    href={`/anime/${anime.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                  >
                    <div className="relative w-8 h-11 rounded overflow-hidden flex-shrink-0 bg-muted">
                      {anime.coverImage ? (
                        <Image
                          src={anime.coverImage}
                          alt={anime.titleEnglish || anime.title}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-foreground truncate">
                        {anime.titleEnglish || anime.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {anime.totalEpisodes > 0
                          ? `${anime.totalEpisodes} episodes`
                          : "Ongoing"}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No currently airing anime this season.
            </p>
          )}
        </div>
      </section>

      <AdBanner className="mb-8" />

      {/* Browse by Season */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Browse All Seasons
        </h2>
        <div className="flex flex-wrap gap-2">
          {allSeasons.map((s) => (
            <Link
              key={`link-${s.season}-${s.year}`}
              href={`/season/${s.season.toLowerCase()}-${s.year}`}
              className="px-4 py-2 rounded-xl text-sm bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-primary transition-all duration-200"
            >
              {SEASON_EMOJI[s.season]} {formatSeason(s.season, s.year)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
