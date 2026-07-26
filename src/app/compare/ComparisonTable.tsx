"use client";

import Link from "next/link";
import Image from "next/image";

interface AnimeData {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  coverImage: string | null;
  averageScore: number | null;
  totalEpisodes: number;
  status: string | null;
  format: string | null;
  season: string | null;
  seasonYear: number | null;
  genres: string;
  studios: string;
  popularity: number | null;
}

interface ComparisonTableProps {
  anime1: AnimeData;
  anime2: AnimeData;
}

function getScore(val: number | null) {
  return val ? val / 10 : 0;
}

function getMaxBarValue(rows: { val1: number; val2: number }[]) {
  let max = 0;
  for (const row of rows) {
    if (row.val1 > max) max = row.val1;
    if (row.val2 > max) max = row.val2;
  }
  return max || 1;
}

export default function ComparisonTable({ anime1, anime2 }: ComparisonTableProps) {
  const title1 = anime1.titleEnglish || anime1.title;
  const title2 = anime2.titleEnglish || anime2.title;
  const genres1: string[] = JSON.parse(anime1.genres || "[]");
  const genres2: string[] = JSON.parse(anime2.genres || "[]");
  const studios1: string[] = JSON.parse(anime1.studios || "[]");
  const studios2: string[] = JSON.parse(anime2.studios || "[]");
  const sharedGenres = genres1.filter((g) => genres2.includes(g));

  const s1 = getScore(anime1.averageScore);
  const s2 = getScore(anime2.averageScore);
  const e1 = anime1.totalEpisodes || 0;
  const e2 = anime2.totalEpisodes || 0;
  const p1 = anime1.popularity || Infinity;
  const p2 = anime2.popularity || Infinity;

  const numericRows = [
    { label: "Score", val1: s1, val2: s2, display1: s1 ? `${s1.toFixed(1)}/10` : "N/A", display2: s2 ? `${s2.toFixed(1)}/10` : "N/A", higher: "better" as const },
    { label: "Episodes", val1: e1, val2: e2, display1: e1 > 0 ? String(e1) : "N/A", display2: e2 > 0 ? String(e2) : "N/A", higher: "more" as const },
    { label: "Popularity Rank", val1: p1 === Infinity ? 0 : 100000 - p1, val2: p2 === Infinity ? 0 : 100000 - p2, display1: p1 < Infinity ? `#${p1.toLocaleString()}` : "N/A", display2: p2 < Infinity ? `#${p2.toLocaleString()}` : "N/A", higher: "better" as const },
  ];

  const maxBar = getMaxBarValue(numericRows);

  const textRows = [
    { label: "Status", val1: anime1.status?.toLowerCase().replace(/_/g, " ") || "N/A", val2: anime2.status?.toLowerCase().replace(/_/g, " ") || "N/A" },
    { label: "Format", val1: anime1.format || "N/A", val2: anime2.format || "N/A" },
    { label: "Season", val1: anime1.season || "N/A", val2: anime2.season || "N/A" },
    { label: "Year", val1: anime1.seasonYear ? String(anime1.seasonYear) : "N/A", val2: anime2.seasonYear ? String(anime2.seasonYear) : "N/A" },
    { label: "Studio", val1: studios1[0] || "N/A", val2: studios2[0] || "N/A" },
  ];

  return (
    <div>
      {/* Cover images + VS */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-8">
        <Link href={`/anime/${anime1.slug}`} className="group block">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border group-hover:border-purple-700/40 transition-all">
            {anime1.coverImage ? (
              <Image
                src={anime1.coverImage}
                alt={title1}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-5xl">🎬</span>
              </div>
            )}
          </div>
          <h2 className="text-foreground font-bold text-base md:text-lg mt-3 text-center group-hover:text-purple-300 transition-colors truncate">
            {title1}
          </h2>
        </Link>

        <div className="flex flex-col items-center gap-2 px-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-teal to-brand-orange flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
            VS
          </div>
        </div>

        <Link href={`/anime/${anime2.slug}`} className="group block">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border group-hover:border-blue-700/40 transition-all">
            {anime2.coverImage ? (
              <Image
                src={anime2.coverImage}
                alt={title2}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-5xl">🎬</span>
              </div>
            )}
          </div>
          <h2 className="text-foreground font-bold text-base md:text-lg mt-3 text-center group-hover:text-blue-300 transition-colors truncate">
            {title2}
          </h2>
        </Link>
      </div>

      {/* Numeric comparison with bars */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Stats Comparison</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
          {numericRows.map((row) => {
            const w1 = maxBar > 0 ? (row.val1 / maxBar) * 100 : 0;
            const w2 = maxBar > 0 ? (row.val2 / maxBar) * 100 : 0;
            const winner =
              row.val1 > row.val2
                ? 1
                : row.val2 > row.val1
                ? 2
                : 0;

            return (
              <div key={row.label} className="p-4">
                <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                  {row.label}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* Left value + bar */}
                  <div className="text-right">
                    <div className={`text-sm font-bold mb-1 ${winner === 1 ? "text-green-400" : "text-foreground"}`}>
                      {row.display1}
                      {winner === 1 && " ✓"}
                    </div>
                    <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${w1}%` }}
                      />
                    </div>
                  </div>

                  {/* Center label */}
                  <div className="w-3" />

                  {/* Right value + bar */}
                  <div className="text-left">
                    <div className={`text-sm font-bold mb-1 ${winner === 2 ? "text-green-400" : "text-foreground"}`}>
                      {row.display2}
                      {winner === 2 && " ✓"}
                    </div>
                    <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${w2}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Text comparison */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Details</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">
                  Stat
                </th>
                <th className="px-4 py-3 text-center text-purple-400 text-sm font-medium">
                  {title1}
                </th>
                <th className="px-4 py-3 text-center text-blue-400 text-sm font-medium">
                  {title2}
                </th>
              </tr>
            </thead>
            <tbody>
              {textRows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-foreground">
                    {row.val1}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-foreground">
                    {row.val2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Genre overlap */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Genre Overlap</h2>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-purple-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Only {title1}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {genres1
                  .filter((g) => !sharedGenres.includes(g))
                  .map((g) => (
                    <span
                      key={g}
                      className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md border border-purple-800/30"
                    >
                      {g}
                    </span>
                  ))}
                {genres1.filter((g) => !sharedGenres.includes(g)).length ===
                  0 && (
                  <span className="text-muted-foreground text-xs">
                    None unique
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Shared
              </h3>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {sharedGenres.map((g) => (
                  <span
                    key={g}
                    className="bg-green-900/30 text-green-300 text-xs px-2 py-1 rounded-md border border-green-800/30"
                  >
                    {g}
                  </span>
                ))}
                {sharedGenres.length === 0 && (
                  <span className="text-muted-foreground text-xs">
                    No shared genres
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Only {title2}
              </h3>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {genres2
                  .filter((g) => !sharedGenres.includes(g))
                  .map((g) => (
                    <span
                      key={g}
                      className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-md border border-blue-800/30"
                    >
                      {g}
                    </span>
                  ))}
                {genres2.filter((g) => !sharedGenres.includes(g)).length ===
                  0 && (
                  <span className="text-muted-foreground text-xs">
                    None unique
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="flex flex-wrap gap-3">
        <Link
          href={`/anime/${anime1.slug}`}
          className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
        >
          View {title1}
        </Link>
        <Link
          href={`/anime/${anime2.slug}`}
          className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
        >
          View {title2}
        </Link>
        <Link
          href={`/anime-like/${anime1.slug}`}
          className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
        >
          More Like {title1}
        </Link>
        <Link
          href={`/anime-like/${anime2.slug}`}
          className="bg-card text-muted-foreground px-4 py-2 rounded-xl border border-border hover:border-primary/40 hover:text-primary text-sm transition-all duration-200"
        >
          More Like {title2}
        </Link>
      </section>
    </div>
  );
}
