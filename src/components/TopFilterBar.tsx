"use client";

import { useState, useCallback, useEffect } from "react";
import AnimeCard from "@/components/AnimeCard";
import Pagination from "@/components/Pagination";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",
  "Sports", "Supernatural", "Slice of Life", "Mecha",
];

const FORMATS = ["TV", "MOVIE", "OVA", "ONA"];

const SORTS = [
  { value: "score", label: "Score" },
  { value: "popularity", label: "Popularity" },
  { value: "year", label: "Year" },
  { value: "episodes", label: "Episodes" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

interface AnimeItem {
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
  fillerMapping?: { totalFiller: number; fillerPercent: number } | null;
}

interface TopFilterBarProps {
  type: string;
  children?: React.ReactNode;
}

export default function TopFilterBar({ type, children }: TopFilterBarProps) {
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [format, setFormat] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchData = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ type, page: String(currentPage), limit: String(limit) });
        if (genre) params.set("genre", genre);
        if (year) params.set("year", year);
        if (format) params.set("format", format);
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/top?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
          setPage(data.page);
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    },
    [type, genre, year, format, sort]
  );

  useEffect(() => {
    if (hasFiltered) {
      fetchData(1);
    }
  }, [genre, year, format, sort, fetchData, hasFiltered]);

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setHasFiltered(true);
  };

  const handlePageChange = (newPage: number) => {
    setHasFiltered(true);
    fetchData(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-8">
      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>

          <select
            value={year}
            onChange={handleFilterChange(setYear)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={genre}
            onChange={handleFilterChange(setGenre)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={format}
            onChange={handleFilterChange(setFormat)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Formats</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={handleFilterChange(setSort)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">Default Sort</option>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Show SSR children when no filter is active, otherwise show filtered results */}
      {!hasFiltered && children}

      {/* Results */}
      {hasFiltered && (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {items.length} of {total} results
                </p>
              </div>

              {items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {items.map((anime, index) => (
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
                      fillerCount={anime.fillerMapping?.totalFiller}
                      fillerPercent={anime.fillerMapping?.fillerPercent}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-8 text-center border border-border">
                  <p className="text-muted-foreground">No anime found matching your filters.</p>
                </div>
              )}

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
