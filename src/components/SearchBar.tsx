"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface SearchResult {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  coverImage: string | null;
  genres: string;
  format: string | null;
  averageScore: number | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results);
        setHasSearched(true);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const formatScore = (score: number | null) => {
    if (!score) return null;
    return (score / 10).toFixed(1);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
          onFocus={() => {
            if (hasSearched && results.length > 0) setIsOpen(true);
          }}
          placeholder="Search anime..."
          className="w-full pl-10 pr-4 py-2 rounded-full bg-white/5 backdrop-blur border border-anime-border text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
        />
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-anime-border rounded-xl shadow-lg shadow-purple-500/10 overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={`/anime/${result.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    {result.coverImage ? (
                      <Image
                        src={result.coverImage}
                        alt={result.title}
                        width={40}
                        height={56}
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded bg-gray-700 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {result.titleEnglish || result.title}
                      </p>
                      {result.titleEnglish && result.titleEnglish !== result.title && (
                        <p className="text-xs text-gray-400 truncate">{result.title}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {result.format && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                            {result.format}
                          </span>
                        )}
                        {result.averageScore && (
                          <span className="text-[10px] text-yellow-400 font-medium">
                            ⭐ {formatScore(result.averageScore)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : hasSearched ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No anime found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
