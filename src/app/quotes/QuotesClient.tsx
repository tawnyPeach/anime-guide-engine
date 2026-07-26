"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Quote } from "./page";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuotesClient({ quotes }: { quotes: Quote[] }) {
  const [filterType, setFilterType] = useState<"all" | "anime" | "character">("all");
  const [filterValue, setFilterValue] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const shuffled = useMemo(() => shuffleArray(quotes), [quotes]);

  const animeList = useMemo(
    () => [...new Set(quotes.map((q) => q.anime))].sort(),
    [quotes]
  );
  const characterList = useMemo(
    () => [...new Set(quotes.map((q) => q.character))].sort(),
    [quotes]
  );

  const filteredQuotes = useMemo(() => {
    if (filterType === "all" || !filterValue) return shuffled;
    if (filterType === "anime") {
      return shuffled.filter((q) => q.anime === filterValue);
    }
    return shuffled.filter((q) => q.character === filterValue);
  }, [shuffled, filterType, filterValue]);

  const handleCopy = useCallback(
    async (quote: Quote) => {
      const text = `"${quote.text}" — ${quote.character}, ${quote.anime}`;
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(quote.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // ignore
      }
    },
    []
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
        <div className="flex bg-card border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => { setFilterType("all"); setFilterValue(""); }}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              filterType === "all"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterType("anime"); setFilterValue(""); }}
            className={`px-4 py-2 text-sm font-medium transition-all border-l border-border ${
              filterType === "anime"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            By Anime
          </button>
          <button
            onClick={() => { setFilterType("character"); setFilterValue(""); }}
            className={`px-4 py-2 text-sm font-medium transition-all border-l border-border ${
              filterType === "character"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            By Character
          </button>
        </div>

        {filterType !== "all" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">
              {filterType === "anime" ? "All Anime" : "All Characters"}
            </option>
            {(filterType === "anime" ? animeList : characterList).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        )}

        <span className="text-xs text-muted-foreground">
          {filteredQuotes.length} quote{filteredQuotes.length !== 1 && "s"}
        </span>
      </div>

      {/* Masonry layout using CSS columns */}
      {filteredQuotes.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredQuotes.map((quote) => {
            const isExpanded = expandedId === quote.id;
            const isCopied = copiedId === quote.id;
            const isLong = quote.text.length > 120;
            const displayText =
              isLong && !isExpanded
                ? quote.text.slice(0, 120) + "..."
                : quote.text;

            return (
              <div
                key={quote.id}
                className="break-inside-avoid bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                {/* Quote mark */}
                <div className="text-4xl text-primary/20 font-serif leading-none mb-2 select-none">
                  &ldquo;
                </div>

                {/* Quote text */}
                <p
                  className={`text-foreground text-[15px] leading-relaxed mb-4 ${
                    isLong && !isExpanded ? "line-clamp-4" : ""
                  }`}
                >
                  {displayText}
                </p>

                {isLong && (
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : quote.id)
                    }
                    className="text-xs text-primary hover:text-primary/80 mb-4 transition-colors"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}

                {/* Attribution */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {quote.character}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quote.anime}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/anime/${quote.animeSlug}`}
                      className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded-lg hover:bg-muted/60 transition-all"
                    >
                      View Anime
                    </Link>
                    <button
                      onClick={() => handleCopy(quote)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                      title="Copy quote"
                    >
                      {isCopied ? (
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium mb-1">No quotes found</p>
          <p className="text-sm">Try a different filter.</p>
        </div>
      )}
    </div>
  );
}
