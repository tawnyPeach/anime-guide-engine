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
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 -ml-3 shadow-lg border border-purple-700/40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 -mr-3 shadow-lg border border-purple-700/40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {items.map((anime) => (
          <Link
            key={anime.id}
            href={`/anime/${anime.slug}/filler-list`}
            className="flex-shrink-0 snap-start w-[260px] bg-anime-card rounded-xl overflow-hidden border border-anime-border hover:border-purple-700/50 hover:glow-card-hover transition-all duration-300 group"
          >
            <div className="flex h-[100px]">
              {/* Cover Image */}
              <div className="relative w-[70px] h-full flex-shrink-0 bg-gray-800">
                {anime.coverImage ? (
                  <Image
                    src={anime.coverImage}
                    alt={`${anime.titleEnglish || anime.title} cover`}
                    fill
                    className="object-cover"
                    sizes="70px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-2xl">🎬</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors duration-200">
                  {anime.titleEnglish || anime.title}
                </h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {anime.totalEpisodes} eps
                  </span>
                  <span
                    className={`font-bold ${
                      anime.fillerPercent > 30
                        ? "text-red-400"
                        : anime.fillerPercent > 15
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {Math.round(anime.fillerPercent)}% filler
                  </span>
                </div>
                {/* Filler bar */}
                <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full"
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
