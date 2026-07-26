"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const AVG_EPISODE_MINUTES = 24;

interface SearchAnime {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  totalEpisodes: number;
  coverImage: string | null;
}

interface WatchlistItem {
  name: string;
  episodes: number;
  source: "manual" | "database";
  slug?: string;
}

function formatTime(totalMinutes: number) {
  const hours = totalMinutes / 60;
  const days = hours / 24;
  return {
    minutes: totalMinutes,
    hours: hours.toFixed(1),
    days: days.toFixed(1),
  };
}

function getComparisons(hours: number) {
  const footballGames = (hours / 3).toFixed(1);
  const movieSittings = (hours / 2).toFixed(1);
  const workDays = (hours / 8).toFixed(1);
  return { footballGames, movieSittings, workDays };
}

export default function WatchTimeCalculator() {
  const [mode, setMode] = useState<"single" | "watchlist">("single");
  const [singleInput, setSingleInput] = useState("");
  const [singleEps, setSingleEps] = useState<number | null>(null);
  const [singleAnimeName, setSingleAnimeName] = useState("");

  const [watchlistInput, setWatchlistInput] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [customMinutes, setCustomMinutes] = useState(AVG_EPISODE_MINUTES);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchAnime[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchDatabase = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/search-anime?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  function addFromDatabase(anime: SearchAnime) {
    const name = anime.titleEnglish || anime.title;
    const eps = anime.totalEpisodes > 0 ? anime.totalEpisodes : 12;
    if (mode === "single") {
      setSingleInput(name);
      setSingleEps(eps);
      setSingleAnimeName(name);
    } else {
      setWatchlist((prev) => [
        ...prev,
        { name, episodes: eps, source: "database", slug: anime.slug },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  }

  function addManualToList() {
    const lines = watchlistInput
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    const newItems: WatchlistItem[] = lines.map((line) => ({
      name: line,
      episodes: 12,
      source: "manual" as const,
    }));
    setWatchlist((prev) => [...prev, ...newItems]);
    setWatchlistInput("");
  }

  function removeFromList(idx: number) {
    setWatchlist((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateEpisodeCount(idx: number, eps: number) {
    setWatchlist((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, episodes: eps } : item))
    );
  }

  const singleResult =
    singleEps && singleEps > 0
      ? {
          name: singleAnimeName || singleInput || "Your anime",
          totalMinutes: singleEps * customMinutes,
          episodes: singleEps,
        }
      : null;

  const watchlistResult =
    watchlist.length > 0
      ? {
          totalEpisodes: watchlist.reduce((s, i) => s + i.episodes, 0),
          totalMinutes: watchlist.reduce(
            (s, i) => s + i.episodes * customMinutes,
            0
          ),
          items: watchlist,
        }
      : null;

  const renderResult = (name: string, totalMinutes: number, episodes: number) => {
    const t = formatTime(totalMinutes);
    const c = getComparisons(parseFloat(t.hours));

    return (
      <div className="bg-card rounded-xl border border-border p-6 mt-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          ⏱️ Watch Time for &quot;{name}&quot;
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold text-primary">{episodes}</span>
            <span className="block text-xs text-muted-foreground mt-1">
              Episodes
            </span>
          </div>
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold text-brand-orange">
              {t.hours}h
            </span>
            <span className="block text-xs text-muted-foreground mt-1">
              Total Hours
            </span>
          </div>
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold text-emerald-400">
              {t.days}
            </span>
            <span className="block text-xs text-muted-foreground mt-1">
              Days (24h binge)
            </span>
          </div>
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <span className="text-2xl font-bold text-brand-teal">
              {t.minutes.toLocaleString()}
            </span>
            <span className="block text-xs text-muted-foreground mt-1">
              Total Minutes
            </span>
          </div>
        </div>
        <div className="bg-background/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            Fun Comparisons
          </p>
          <ul className="text-sm text-foreground space-y-1">
            <li>
              That&apos;s equivalent to <strong>{c.footballGames}</strong>{" "}
              football games (3h each)
            </li>
            <li>
              Or <strong>{c.movieSittings}</strong> movie sittings (2h each)
            </li>
            <li>
              That&apos;s <strong>{c.workDays}</strong> 8-hour workdays of
              watching
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Calculation: {episodes} episodes × {customMinutes} min ={" "}
          {totalMinutes.toLocaleString()} min = {t.hours} hours
        </p>
      </div>
    );
  };

  return (
    <>
      {/* Hero */}
      <div className="relative mb-8">
        <div className="absolute inset-0 hero-gradient rounded-xl opacity-50" />
        <div className="relative py-8 px-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            ⏱️ How Long to Watch?
          </h1>
          <p className="text-muted-foreground text-lg">
            Calculate total watch time for any anime or your entire watchlist.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
            mode === "single"
              ? "bg-gradient-to-r from-primary to-brand-teal text-primary-foreground shadow-lg glow-primary"
              : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-primary"
          }`}
        >
          Single Anime
        </button>
        <button
          onClick={() => setMode("watchlist")}
          className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
            mode === "watchlist"
              ? "bg-gradient-to-r from-primary to-brand-teal text-primary-foreground shadow-lg glow-primary"
              : "bg-card text-muted-foreground border border-border hover:border-primary/40 hover:text-primary"
          }`}
        >
          Watchlist Calculator
        </button>
      </div>

      {/* Episode Length Setting */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <label className="text-sm text-muted-foreground">
          Average episode length:{" "}
          <input
            type="number"
            value={customMinutes}
            onChange={(e) =>
              setCustomMinutes(Math.max(1, parseInt(e.target.value) || 24))
            }
            className="ml-2 w-16 bg-background border border-border rounded-md px-2 py-1 text-foreground text-sm"
            min={1}
          />{" "}
          minutes
        </label>
      </div>

      {/* Database Search */}
      <div ref={searchRef} className="relative mb-6">
        <label className="text-sm text-muted-foreground block mb-1">
          Search our database to add anime
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => searchDatabase(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          placeholder="Search anime title..."
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
        {searchLoading && (
          <span className="absolute right-4 top-9 text-muted-foreground text-sm">
            Searching...
          </span>
        )}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            {searchResults.map((anime) => (
              <button
                key={anime.id}
                onClick={() => addFromDatabase(anime)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background/50 transition-colors text-left"
              >
                <div className="relative w-8 h-11 rounded overflow-hidden flex-shrink-0 bg-muted">
                  {anime.coverImage ? (
                    <Image
                      src={anime.coverImage}
                      alt={anime.title}
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
                      : "Unknown episodes"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Single Mode */}
      {mode === "single" && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Single Anime Calculator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Anime name
              </label>
              <input
                type="text"
                value={singleInput}
                onChange={(e) => {
                  setSingleInput(e.target.value);
                  setSingleAnimeName(e.target.value);
                }}
                placeholder="e.g. Attack on Titan"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Number of episodes
              </label>
              <input
                type="number"
                value={singleEps ?? ""}
                onChange={(e) =>
                  setSingleEps(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="e.g. 87"
                min={1}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {singleResult &&
            renderResult(
              singleResult.name,
              singleResult.totalMinutes,
              singleResult.episodes
            )}
        </div>
      )}

      {/* Watchlist Mode */}
      {mode === "watchlist" && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Watchlist Calculator
          </h2>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Enter anime names (one per line or comma separated)
            </label>
            <textarea
              value={watchlistInput}
              onChange={(e) => setWatchlistInput(e.target.value)}
              placeholder={"Attack on Titan, Death Note\nFullmetal Alchemist: Brotherhood"}
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <button
              onClick={addManualToList}
              disabled={!watchlistInput.trim()}
              className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Watchlist
            </button>
          </div>

          {watchlist.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">
                  Your Watchlist ({watchlist.length} anime)
                </h3>
                <button
                  onClick={() => setWatchlist([])}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2">
                {watchlist.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-background/50 rounded-lg px-4 py-2"
                  >
                    <span className="text-sm text-foreground truncate flex-1 min-w-0">
                      {item.slug ? (
                        <Link
                          href={`/anime/${item.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                      {item.source === "database" && (
                        <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          DB
                        </span>
                      )}
                    </span>
                    <input
                      type="number"
                      value={item.episodes}
                      onChange={(e) =>
                        updateEpisodeCount(
                          idx,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-16 bg-card border border-border rounded px-2 py-1 text-foreground text-sm text-center"
                      min={1}
                    />
                    <span className="text-xs text-muted-foreground">eps</span>
                    <button
                      onClick={() => removeFromList(idx)}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {watchlistResult && (
            <div className="bg-card rounded-xl border border-border p-6 mt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                ⏱️ Total Watch Time
              </h3>
              {(() => {
                const t = formatTime(watchlistResult.totalMinutes);
                const c = getComparisons(parseFloat(t.hours));
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-background/50 rounded-lg p-4 text-center">
                        <span className="text-2xl font-bold text-primary">
                          {watchlistResult.totalEpisodes}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          Total Episodes
                        </span>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4 text-center">
                        <span className="text-2xl font-bold text-brand-orange">
                          {t.hours}h
                        </span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          Total Hours
                        </span>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4 text-center">
                        <span className="text-2xl font-bold text-emerald-400">
                          {t.days}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          Days (24h binge)
                        </span>
                      </div>
                      <div className="bg-background/50 rounded-lg p-4 text-center">
                        <span className="text-2xl font-bold text-brand-teal">
                          {watchlist.length}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          Anime in List
                        </span>
                      </div>
                    </div>
                    <div className="bg-background/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground font-medium mb-2">
                        Fun Comparisons
                      </p>
                      <ul className="text-sm text-foreground space-y-1">
                        <li>
                          That&apos;s equivalent to{" "}
                          <strong>{c.footballGames}</strong> football games (3h
                          each)
                        </li>
                        <li>
                          Or <strong>{c.movieSittings}</strong> movie sittings
                          (2h each)
                        </li>
                        <li>
                          That&apos;s <strong>{c.workDays}</strong> 8-hour
                          workdays of watching
                        </li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Calculation: {watchlistResult.totalEpisodes} episodes ×{" "}
                      {customMinutes} min ={" "}
                      {watchlistResult.totalMinutes.toLocaleString()} min ={" "}
                      {t.hours} hours
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </>
  );
}
