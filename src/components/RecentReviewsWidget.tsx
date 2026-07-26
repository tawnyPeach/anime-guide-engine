"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Review, getRecentReviews } from "@/lib/reviews";
import ReviewCard from "@/components/ReviewCard";

export default function RecentReviewsWidget() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviews(getRecentReviews(4));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-1 h-6 bg-yellow-400 rounded-full mr-3" />
          <h2 className="text-2xl font-bold text-foreground">Recent Reviews</h2>
        </div>
        <Link
          href="/reviews"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} compact showAnimeLink />
        ))}
      </div>
    </section>
  );
}
