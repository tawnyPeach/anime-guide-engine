"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AnimeCard from "@/components/AnimeCard";

interface AnimeResult {
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
  format: string | null;
  fillerMapping?: {
    totalFiller: number;
    fillerPercent: number;
  } | null;
}

interface SearchResponse {
  items: AnimeResult[];
  total: number;
  page: number;
  hasMore: boolean;
}

const POPULAR_SEARCHES = [
  "Naruto",
  "Bleach",
  "One Piece",
  "Attack on Titan",
  "Dragon Ball Z",
  "Death Note",
  "Fullmetal Alchemist",
  "My Hero Academia",
  "Demon Slayer",
  "Jujutsu Kaisen",
];

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Sports",
  "Supernatural",
  "Slice of Life",
  "Mecha",
];

const FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"];
const STATUSES = [
  { label: "All", value: "" },
  { label: "Airing", value: "RELEASING" },
  { label: "Finished", value: "FINISHED" },
  { label: "Upcoming", value: "NOT_YET_RELEASED" },
];
const SCORE_OPTIONS = [
  { label: "Any", value: "" },
  { label: "6.0+", value: "6" },
  { label: "7.0+", value: "7" },
  { label: "8.0+", value: "8" },
  { label: "9.0+", value: "9" },
];

const RECENT_SEARCHES_KEY = "aniyume-recent-searches";
const MAX_RECENT = 10;

export default function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [trending, setTrending] = useState<AnimeResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Filters
  const [genre, setGenre] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [format, setFormat] = useState("");
  const [status, setStatus] = useState("");

  // Recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch trending anime for empty state
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/anime?sort=popularity&limit=10");
        const data = await res.json();
        setTrending(data.items || []);
      } catch {
        // ignore
      }
    }
    fetchTrending();
  }, []);

  // Save a search to recent
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string, searchPage: number, filters: { genre: string; yearMin: string; yearMax: string; scoreMin: string; format: string; status: string }) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchQuery.trim().length >= 2) params.set("q", searchQuery.trim());
      if (filters.genre) params.set("genre", filters.genre);
      if (filters.yearMin) params.set("yearMin", filters.yearMin);
      if (filters.yearMax) params.set("yearMax", filters.yearMax);
      if (filters.scoreMin) params.set("scoreMin", filters.scoreMin);
      if (filters.format) params.set("format", filters.format);
      if (filters.status) params.set("status", filters.status);
      params.set("page", searchPage.toString());
      params.set("limit", "20");

      try {
        const res = await fetch(`/api/search/advanced?${params.toString()}`, {
          signal: controller.signal,
        });
        const data: SearchResponse = await res.json();
        if (searchPage === 1) {
          setResults(data.items);
        } else {
          setResults((prev) => [...prev, ...data.items]);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
        setHasSearched(true);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search effect
  useEffect(() => {
    const hasFilters = genre || yearMin || yearMax || scoreMin || format || status;
    if (query.trim().length < 2 && !hasFilters) {
      setResults([]);
      setHasSearched(false);
      setTotal(0);
      return;
    }

    const timeout = setTimeout(() => {
      setPage(1);
      performSearch(query, 1, { genre, yearMin, yearMax, scoreMin, format, status });
      if (query.trim().length >= 2) {
        saveRecentSearch(query.trim());
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, genre, yearMin, yearMax, scoreMin, format, status, performSearch, saveRecentSearch]);

  // Load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage, { genre, yearMin, yearMax, scoreMin, format, status });
  };

  // Click popular/recent search
  const handleSearchClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  // Click genre tag in results
  const handleGenreClick = (g: string) => {
    setGenre(g);
  };

  // Clear all filters
  const clearFilters = () => {
    setGenre("");
    setYearMin("");
    setYearMax("");
    setScoreMin("");
    setFormat("");
    setStatus("");
  };

  const hasActiveFilters = genre || yearMin || yearMax || scoreMin || format || status;
  const showSuggestions = isFocused && query.trim().length === 0 && !hasActiveFilters;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Search input */}
      <div className="relative">
        <div className={`relative flex items-center rounded-2xl transition-all duration-200 ${
          isFocused
            ? "bg-card ring-2 ring-primary/30 shadow-lg shadow-primary/5"
            : "bg-muted/60 hover:bg-muted/80"
        }`}>
          <svg
            className="absolute left-4 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search anime by title..."
            className="w-full bg-transparent border-0 pl-12 pr-4 py-4 text-lg text-foreground placeholder-muted-foreground/60 focus:outline-none rounded-2xl"
          />
          {isLoading && (
            <div className="absolute right-4">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          {query && !isLoading && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearchClick(term)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/80 hover:bg-muted text-sm text-foreground transition-colors"
                  >
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearchClick(term)}
                  className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-sm text-primary font-medium transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Genre */}
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Year Min */}
          <select
            value={yearMin}
            onChange={(e) => setYearMin(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Year From</option>
            {Array.from({ length: 27 }, (_, i) => 2026 - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Year Max */}
          <select
            value={yearMax}
            onChange={(e) => setYearMax(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Year To</option>
            {Array.from({ length: 27 }, (_, i) => 2026 - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Score */}
          <select
            value={scoreMin}
            onChange={(e) => setScoreMin(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {SCORE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Format */}
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Formats</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results section */}
      {hasSearched && results.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {total} result{total !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((anime, i) => {
              const genres: string[] = (() => {
                try {
                  return JSON.parse(anime.genres || "[]");
                } catch {
                  return [];
                }
              })();
              return (
                <div key={anime.id} className="relative">
                  <AnimeCard
                    title={anime.title}
                    titleEnglish={anime.titleEnglish}
                    slug={anime.slug}
                    coverImage={anime.coverImage}
                    genres={genres}
                    totalEpisodes={anime.totalEpisodes}
                    averageScore={anime.averageScore}
                    status={anime.status}
                    seasonYear={anime.seasonYear}
                    index={i}
                    fillerCount={anime.fillerMapping?.totalFiller ?? null}
                    fillerPercent={anime.fillerMapping?.fillerPercent ?? null}
                  />
                  {/* Clickable genre tags */}
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 px-1">
                      {genres.slice(0, 2).map((g) => (
                        <button
                          key={g}
                          onClick={() => handleGenreClick(g)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No results state */}
      {hasSearched && results.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try a different spelling or browse by genre
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {GENRES.slice(0, 8).map((g) => (
              <button
                key={g}
                onClick={() => {
                  setQuery("");
                  setGenre(g);
                }}
                className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-sm text-primary font-medium transition-colors"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state - show trending */}
      {!hasSearched && !showSuggestions && trending.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Trending Anime</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trending.map((anime, i) => {
              const genres: string[] = (() => {
                try {
                  return JSON.parse(anime.genres || "[]");
                } catch {
                  return [];
                }
              })();
              return (
                <AnimeCard
                  key={anime.id}
                  title={anime.title}
                  titleEnglish={anime.titleEnglish}
                  slug={anime.slug}
                  coverImage={anime.coverImage}
                  genres={genres}
                  totalEpisodes={anime.totalEpisodes}
                  averageScore={anime.averageScore}
                  status={anime.status}
                  seasonYear={anime.seasonYear}
                  index={i}
                  fillerCount={anime.fillerMapping?.totalFiller ?? null}
                  fillerPercent={anime.fillerMapping?.fillerPercent ?? null}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
