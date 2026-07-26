"use client";

import Link from "next/link";
import { useState } from "react";
import { Review, deleteReview, voteReview } from "@/lib/reviews";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < rating ? "text-yellow-400" : "text-muted-foreground/30"} ${i < rating ? "fill-current" : "fill-current"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (id: string) => void;
  showAnimeLink?: boolean;
  toast?: (msg: string) => void;
}

export default function ReviewCard({
  review,
  compact = false,
  onEdit,
  onDelete,
  showAnimeLink = false,
  toast,
}: ReviewCardProps) {
  const [helpfulOpen, setHelpfulOpen] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(review.id);
    } else {
      deleteReview(review.id);
      toast?.("Review deleted");
    }
  };

  const handleVote = (type: "up" | "down") => {
    if (voted) return;
    voteReview(review.id, type);
    setVoted(type);
    toast?.(type === "up" ? "Thanks for your feedback!" : "Thanks for your feedback!");
  };

  if (compact) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <StarRating rating={review.rating} />
          <span className="text-xs font-bold text-yellow-400">{review.rating}/10</span>
        </div>
        <h4 className="text-sm font-semibold text-foreground truncate">{review.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{review.content}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground/60">
            {review.author ? `by ${review.author}` : "Anonymous"} · {formatDate(review.createdAt)}
          </span>
          {showAnimeLink && (
            <Link href={`/anime/${review.slug}`} className="text-[11px] text-primary hover:text-primary/80">
              View →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} size="lg" />
            <span className="text-sm font-bold text-yellow-400">{review.rating}/10</span>
          </div>
          <h3 className="text-base font-bold text-foreground">{review.title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded-lg hover:bg-muted/60 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-xs text-muted-foreground hover:text-red-400 px-2 py-1 rounded-lg hover:bg-muted/60 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.content}</p>

      {showAnimeLink && (
        <Link href={`/anime/${review.slug}`} className="text-xs text-primary hover:text-primary/80 mb-2 inline-block">
          View anime page →
        </Link>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground/60">
          {review.author ? `by ${review.author}` : "Anonymous"} · {formatDate(review.createdAt)}
        </span>
        <div className="relative">
          <button
            onClick={() => setHelpfulOpen(!helpfulOpen)}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/60 transition-colors"
          >
            Helpful?
          </button>
          {helpfulOpen && (
            <div className="absolute bottom-full right-0 mb-1 flex gap-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10">
              <button
                onClick={() => handleVote("up")}
                disabled={!!voted}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-muted/60 transition-colors disabled:opacity-40"
              >
                <span>👍</span>
                <span>{review.upvotes || 0}</span>
              </button>
              <button
                onClick={() => handleVote("down")}
                disabled={!!voted}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-muted/60 transition-colors disabled:opacity-40"
              >
                <span>👎</span>
                <span>{review.downvotes || 0}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
