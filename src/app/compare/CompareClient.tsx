"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ComparisonTable from "./ComparisonTable";

interface SearchResult {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  totalEpisodes: number;
  coverImage: string | null;
}

interface SelectedAnime extends SearchResult {
  averageScore: number | null;
  status: string | null;
  format: string | null;
  season: string | null;
  seasonYear: number | null;
  genres: string;
  studios: string;
  popularity: number | null;
}

function SearchInput({
  label,
  selected,
  onSelect,
  onClear,
  color,
}: {
  label: string;
  selected: SelectedAnime | null;
  onSelect: (anime: SelectedAnime) => void;
  onClear: () => void;
  color: "purple" | "blue";
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      const timeout = setTimeout(() => {
        setResults([]);
        setIsOpen(false);
      }, 0);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/search-anime?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    async (result: SearchResult) => {
      setQuery("");
      setIsOpen(false);
      setResults([]);
      try {
        const res = await fetch(`/api/anime/${result.slug}`);
        const data = await res.json();
        onSelect(data);
      } catch {
        onSelect({
          ...result,
          averageScore: null,
          status: null,
          format: null,
          season: null,
          seasonYear: null,
          genres: "[]",
          studios: "[]",
          popularity: null,
        });
      }
    },
    [onSelect]
  );

  const borderColor =
    color === "purple" ? "border-purple-700/40" : "border-blue-700/40";
  const ringColor = color === "purple" ? "ring-purple-600/30" : "ring-blue-600/30";
  const accent = color === "purple" ? "text-purple-400" : "text-blue-400";

  if (selected) {
    return (
      <div className="relative">
        <div
          className={`bg-card border ${borderColor} rounded-xl p-3 flex items-center gap-3`}
        >
          {selected.coverImage ? (
            <Image
              src={selected.coverImage}
              alt={selected.title}
              width={48}
              height={64}
              className="rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-16 rounded-lg bg-muted flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${accent} truncate`}>
              {selected.titleEnglish || selected.title}
            </p>
            {selected.titleEnglish &&
              selected.titleEnglish !== selected.title && (
                <p className="text-xs text-muted-foreground truncate">
                  {selected.title}
                </p>
              )}
          </div>
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/60"
            aria-label="Clear selection"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className={`text-xs font-semibold ${accent} uppercase tracking-wider mb-1.5 block`}>
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl transition-all duration-200 bg-muted/60 ${
          isOpen ? `ring-2 ${ringColor} bg-card` : ""
        }`}
      >
        <svg
          className="absolute left-3 w-4 h-4 text-muted-foreground"
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
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search anime..."
          className="w-full bg-transparent border-0 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none rounded-xl"
        />
        {isLoading && (
          <div className="absolute right-3">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-lg shadow-primary/10 overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left"
                  >
                    {r.coverImage ? (
                      <Image
                        src={r.coverImage}
                        alt={r.title}
                        width={32}
                        height={44}
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-11 rounded bg-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {r.titleEnglish || r.title}
                      </p>
                      {r.titleEnglish && r.titleEnglish !== r.title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {r.title}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 text-center text-sm text-muted-foreground">
              No anime found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompareClient() {
  const router = useRouter();
  const [anime1, setAnime1] = useState<SelectedAnime | null>(null);
  const [anime2, setAnime2] = useState<SelectedAnime | null>(null);

  const handleSwap = useCallback(() => {
    setAnime1(anime2);
    setAnime2(anime1);
  }, [anime1, anime2]);

  const handleRandom = useCallback(async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/anime/random"),
        fetch("/api/anime/random"),
      ]);
      const d1 = await res1.json();
      const d2 = await res2.json();
      if (d1 && d2 && d1.slug !== d2.slug) {
        setAnime1(d1);
        setAnime2(d2);
      }
    } catch {
      // ignore
    }
  }, []);

  const canCompare = anime1 && anime2;

  const handleGo = useCallback(() => {
    if (!anime1 || !anime2) return;
    router.push(`/compare/${anime1.slug}-vs-${anime2.slug}`);
  }, [anime1, anime2, router]);

  return (
    <div>
      {/* Search selectors */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end mb-6">
        <SearchInput
          label="First Anime"
          selected={anime1}
          onSelect={setAnime1}
          onClear={() => setAnime1(null)}
          color="purple"
        />

        <div className="flex items-center justify-center gap-2 pb-1">
          <button
            onClick={handleSwap}
            disabled={!anime1 || !anime2}
            className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Swap anime"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
          <button
            onClick={handleRandom}
            className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            aria-label="Pick random pair"
            title="Pick random pair"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <SearchInput
          label="Second Anime"
          selected={anime2}
          onSelect={setAnime2}
          onClear={() => setAnime2(null)}
          color="blue"
        />
      </div>

      {/* Quick actions */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={handleRandom}
          className="text-sm text-muted-foreground hover:text-foreground bg-card border border-border px-4 py-2 rounded-xl transition-all hover:border-primary/40"
        >
          🎲 Pick Random Pair
        </button>
        <button
          onClick={handleGo}
          disabled={!canCompare}
          className="text-sm font-bold text-white bg-gradient-to-r from-brand-teal to-brand-orange px-6 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Compare Now ⚡
        </button>
      </div>

      {/* Inline preview when both selected but not navigating */}
      {anime1 && anime2 && (
        <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
          <ComparisonTable anime1={anime1} anime2={anime2} />
        </div>
      )}

      {/* Empty state */}
      {!anime1 && !anime2 && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-5xl mb-4">⚔️</div>
          <p className="text-lg font-medium mb-1">Select two anime to compare</p>
          <p className="text-sm">
            Use the search boxes above or hit the random button to get started.
          </p>
        </div>
      )}

      {/* One selected hint */}
      {anime1 && !anime2 && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">
            Now select a second anime to start comparing!
          </p>
        </div>
      )}
    </div>
  );
}
