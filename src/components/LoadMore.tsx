"use client";

import { useState } from "react";
import AnimeCard from "@/components/AnimeCard";

interface AnimeItem {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  coverImage: string | null;
  genres: string | null;
  totalEpisodes: number;
  averageScore: number | null;
  status: string | null;
  seasonYear: number | null;
}

interface LoadMoreProps {
  initialCount: number;
  total: number;
  genre?: string;
  year?: number;
  sort?: string;
}

export default function LoadMore({
  initialCount,
  total,
  genre,
  year,
  sort,
}: LoadMoreProps) {
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCount < total);

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;

    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", "20");
    if (genre) params.set("genre", genre);
    if (year) params.set("year", String(year));
    if (sort) params.set("sort", sort);

    try {
      const res = await fetch(`/api/anime?${params.toString()}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more anime:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render additional loaded items */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {items.map((anime) => (
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
            />
          ))}
        </div>
      )}

      {/* Count indicator */}
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm">
          Showing {initialCount + items.length} of {total} anime
        </p>
      </div>

      {/* Load More button or completion message */}
      {hasMore ? (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 text-sm">All anime loaded</p>
        </div>
      )}
    </div>
  );
}
