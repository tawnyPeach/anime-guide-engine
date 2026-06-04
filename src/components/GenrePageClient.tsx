"use client";

import { useState, useCallback } from "react";
import AnimeCard from "@/components/AnimeCard";

const SUB_GENRE_MAP: Record<string, string[]> = {
  Action: ["Shounen", "Martial Arts", "Military", "Mecha", "Samurai"],
  Adventure: ["Isekai", "Fantasy", "Space", "Historical"],
  Comedy: ["Parody", "Slice of Life", "School", "Harem"],
  Drama: ["Psychological", "Tragedy", "Romance", "Music"],
  Fantasy: ["Isekai", "Magic", "Supernatural", "Mythology"],
  Horror: ["Psychological", "Gore", "Supernatural", "Thriller"],
  Romance: ["School", "Harem", "Josei", "Shoujo"],
  "Sci-Fi": ["Mecha", "Space", "Cyberpunk", "Time Travel"],
};

const YEAR_RANGES = [
  { label: "All Years", min: undefined, max: undefined },
  { label: "2024-2026", min: 2024, max: 2026 },
  { label: "2020-2023", min: 2020, max: 2023 },
  { label: "2015-2019", min: 2015, max: 2019 },
  { label: "2010-2014", min: 2010, max: 2014 },
  { label: "Before 2010", min: undefined, max: 2009 },
];

const FORMAT_OPTIONS = ["TV", "MOVIE", "OVA", "ONA"];

interface AnimeResult {
  id: number;
  title: string;
  titleEnglish?: string | null;
  slug: string;
  coverImage?: string | null;
  genres: string;
  totalEpisodes: number;
  averageScore?: number | null;
  status?: string | null;
  seasonYear?: number | null;
}

interface GenrePageClientProps {
  genre: string;
}

export default function GenrePageClient({ genre }: GenrePageClientProps) {
  const [selectedSubGenre, setSelectedSubGenre] = useState<string | null>(null);
  const [yearRange, setYearRange] = useState(YEAR_RANGES[0]);
  const [scoreFilter, setScoreFilter] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [total, setTotal] = useState(0);

  const subGenres = SUB_GENRE_MAP[genre] || null;

  const fetchFiltered = useCallback(
    async (overrides?: {
      subGenre?: string | null;
      year?: (typeof YEAR_RANGES)[0];
      score?: boolean;
      format?: string | null;
    }) => {
      const sg = overrides?.subGenre !== undefined ? overrides.subGenre : selectedSubGenre;
      const yr = overrides?.year !== undefined ? overrides.year : yearRange;
      const sc = overrides?.score !== undefined ? overrides.score : scoreFilter;
      const fmt = overrides?.format !== undefined ? overrides.format : selectedFormat;

      setLoading(true);
      setHasSearched(true);

      const params = new URLSearchParams();
      params.set("genre", genre);
      if (sg) params.set("subGenre", sg);
      if (yr.min) params.set("yearMin", String(yr.min));
      if (yr.max) params.set("yearMax", String(yr.max));
      if (sc) params.set("scoreMin", "70");
      if (fmt) params.set("format", fmt);
      params.set("sort", "popularity");
      params.set("limit", "20");

      try {
        const res = await fetch(`/api/genre?${params.toString()}`);
        const data = await res.json();
        setResults(data.items || []);
        setTotal(data.total || 0);
      } catch {
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [genre, selectedSubGenre, yearRange, scoreFilter, selectedFormat]
  );

  const handleSubGenreClick = (sg: string) => {
    const next = selectedSubGenre === sg ? null : sg;
    setSelectedSubGenre(next);
    fetchFiltered({ subGenre: next });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const yr = YEAR_RANGES[parseInt(e.target.value, 10)];
    setYearRange(yr);
    fetchFiltered({ year: yr });
  };

  const handleScoreToggle = () => {
    const next = !scoreFilter;
    setScoreFilter(next);
    fetchFiltered({ score: next });
  };

  const handleFormatClick = (fmt: string) => {
    const next = selectedFormat === fmt ? null : fmt;
    setSelectedFormat(next);
    fetchFiltered({ format: next });
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-foreground mb-4">Filter Anime</h2>
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        {/* Sub-genre pills */}
        {subGenres && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Sub-genres</p>
            <div className="flex flex-wrap gap-2">
              {subGenres.map((sg) => (
                <button
                  key={sg}
                  onClick={() => handleSubGenreClick(sg)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedSubGenre === sg
                      ? "bg-brand-teal text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:border-primary/40 border border-border"
                  }`}
                >
                  {sg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year range + Score + Format row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Year dropdown */}
          <div>
            <label htmlFor="year-filter" className="text-sm font-medium text-muted-foreground block mb-1">
              Year
            </label>
            <select
              id="year-filter"
              value={YEAR_RANGES.indexOf(yearRange)}
              onChange={handleYearChange}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            >
              {YEAR_RANGES.map((yr, i) => (
                <option key={yr.label} value={i}>
                  {yr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Score toggle */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Score</p>
            <button
              onClick={handleScoreToggle}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                scoreFilter
                  ? "bg-brand-orange text-white"
                  : "bg-muted text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              7.0+ Only
            </button>
          </div>

          {/* Format pills */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Format</p>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleFormatClick(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFormat === fmt
                      ? "bg-brand-teal text-white"
                      : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtered results */}
      {hasSearched && (
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
              <span className="ml-2 text-muted-foreground text-sm">Loading...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Found {total} result{total !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((anime, index) => (
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
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl p-6 text-center border border-border">
              <p className="text-muted-foreground">No anime found matching your filters.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
