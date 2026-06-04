"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface FillerAnimeItem {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  coverImage: string | null;
  totalEpisodes: number;
  fillerPercent: number;
}

interface FillerCarouselProps {
  items: FillerAnimeItem[];
}

export default function FillerCarousel({ items }: FillerCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="relative group/carousel">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 -ml-3 shadow-lg border border-border"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-foreground w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 -mr-3 shadow-lg border border-border"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
      >
        {items.map((anime) => (
          <Link
            key={anime.id}
            href={`/anime/${anime.slug}/filler-list`}
            className="flex-shrink-0 snap-start w-[300px] bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
          >
            <div className="flex h-[130px]">
              {/* Cover Image */}
              <div className="relative w-[90px] h-full flex-shrink-0 bg-muted">
                {anime.coverImage ? (
                  <Image
                    src={anime.coverImage}
                    alt={`${anime.titleEnglish || anime.title} cover`}
                    fill
                    className="object-cover"
                    sizes="90px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-2xl">🎬</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <h3 className="text-foreground font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {anime.titleEnglish || anime.title}
                </h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {anime.totalEpisodes} eps
                  </span>
                  <span
                    className={`font-bold ${
                      anime.fillerPercent > 30
                        ? "text-red-400"
                        : anime.fillerPercent > 15
                        ? "text-brand-orange"
                        : "text-emerald-400"
                    }`}
                  >
                    {Math.round(anime.fillerPercent)}% filler
                  </span>
                </div>
                {/* Filler bar */}
                <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-orange to-red-500 h-full rounded-full"
                    style={{ width: `${Math.min(anime.fillerPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
