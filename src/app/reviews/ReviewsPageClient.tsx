"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Review, getAllReviews } from "@/lib/reviews";
import ReviewCard from "@/components/ReviewCard";

type SortOption = "recent" | "highest" | "lowest";

export default function ReviewsPageClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState<SortOption>("recent");
  const [filterSlug, setFilterSlug] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setReviews(getAllReviews());
  }, []);

  const slugs = [...new Set(reviews.map((r) => r.slug))];

  const filtered = reviews
    .filter((r) => !filterSlug || r.slug === filterSlug)
    .filter((r) => r.rating >= minRating)
    .sort((a, b) => {
      if (sort === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "highest") return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Sort by</label>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Filter by anime</label>
          <select
            value={filterSlug}
            onChange={(e) => { setFilterSlug(e.target.value); setPage(1); }}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="">All anime</option>
            {slugs.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Minimum rating</label>
          <select
            value={minRating}
            onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1); }}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value={0}>Any rating</option>
            <option value={5}>5+ stars</option>
            <option value={7}>7+ stars</option>
            <option value={9}>9+ stars</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {paginated.length > 0 ? (
        <div className="space-y-4">
          {paginated.map((review) => (
            <ReviewCard key={review.id} review={review} showAnimeLink toast={() => {}} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-muted-foreground">
            {reviews.length === 0
              ? "No reviews yet. Visit an anime page to write the first review!"
              : "No reviews match your filters."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
