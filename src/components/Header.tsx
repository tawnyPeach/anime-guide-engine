"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex h-14 md:h-16 items-center px-4 md:px-6 gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="font-extrabold text-2xl md:text-3xl tracking-tight">
            <span className="text-brand-teal">Ani</span><span className="text-brand-orange">Yume</span>
          </span>
        </Link>

        {/* Search - centered */}
        <div className="hidden md:flex flex-1 max-w-lg mx-auto">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Link
            href="/tier-list"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 hidden sm:flex items-center gap-1.5"
          >
            <span className="text-sm">🏆</span>
            <span className="text-sm font-medium">Tier List</span>
          </Link>
          <Link
            href="/tier-list"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 sm:hidden"
            aria-label="Tier List"
          >
            <span className="text-lg">🏆</span>
          </Link>
          <Link
            href="/random"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 hidden sm:flex items-center gap-1.5"
          >
            <span className="text-sm">🎰</span>
            <span className="text-sm font-medium">Random</span>
          </Link>
          <Link
            href="/random"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 sm:hidden"
            aria-label="Random"
          >
            <span className="text-lg">🎰</span>
          </Link>
          <Link
            href="/reviews"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 hidden sm:flex items-center gap-1.5"
          >
            <span className="text-sm">⭐</span>
            <span className="text-sm font-medium">Reviews</span>
          </Link>
          <Link
            href="/reviews"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 sm:hidden"
            aria-label="Reviews"
          >
            <span className="text-lg">⭐</span>
          </Link>
          <Link
            href="/quiz"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 hidden sm:flex items-center gap-1.5"
          >
            <span className="text-sm">🎮</span>
            <span className="text-sm font-medium">Quiz</span>
          </Link>
          <Link
            href="/quiz"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 sm:hidden"
            aria-label="Quiz"
          >
            <span className="text-lg">🎮</span>
          </Link>

          <Link
            href="/manga-vs-anime"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 hidden sm:flex items-center gap-1.5"
          >
            <span className="text-sm">📖</span>
            <span className="text-sm font-medium">Manga vs Anime</span>
          </Link>
          <Link
            href="/manga-vs-anime"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 sm:hidden"
            aria-label="Manga vs Anime"
          >
            <span className="text-lg">📖</span>
          </Link>

          {/* Tools dropdown */}
          <div ref={toolsRef} className="relative hidden sm:block">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60 flex items-center gap-1.5"
            >
              <span className="text-sm">🛠️</span>
              <span className="text-sm font-medium">More</span>
              <svg
                className={`w-3 h-3 transition-transform ${toolsOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {toolsOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-lg shadow-primary/10 overflow-hidden z-50">
                <Link
                  href="/compare"
                  onClick={() => setToolsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-sm text-foreground"
                >
                  <span>⚔️</span>
                  <span>Compare Anime</span>
                </Link>
                <Link
                  href="/quotes"
                  onClick={() => setToolsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-sm text-foreground"
                >
                  <span>💬</span>
                  <span>Anime Quotes</span>
                </Link>
                <Link
                  href="/watch-time"
                  onClick={() => setToolsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-sm text-foreground"
                >
                  <span>⏱️</span>
                  <span>Watch Time</span>
                </Link>
                <Link
                  href="/ending-explained"
                  onClick={() => setToolsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-sm text-foreground"
                >
                  <span>📖</span>
                  <span>Endings Explained</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/bookmarks"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60"
            aria-label="Bookmarks"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
}
