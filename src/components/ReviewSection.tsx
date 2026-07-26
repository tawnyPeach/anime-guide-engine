"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Review,
  getReviews,
  getAverageRating,
  addReview,
  updateReview,
  deleteReview,
} from "@/lib/reviews";
import ReviewCard from "./ReviewCard";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < rating ? "text-yellow-400 fill-current" : "text-muted-foreground/30 fill-current"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-card border border-border rounded-xl px-4 py-3 shadow-lg shadow-primary/10 text-sm text-foreground animate-fade-in">
      {message}
    </div>
  );
}

interface ReviewFormProps {
  slug: string;
  initial?: Review;
  onSubmit: (review: Review) => void;
  onCancel: () => void;
  toast: (msg: string) => void;
}

function ReviewForm({ slug, initial, onSubmit, onCancel, toast }: ReviewFormProps) {
  const [rating, setRating] = useState(initial?.rating || 5);
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [author, setAuthor] = useState(initial?.author || "");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (initial) {
      const updated = updateReview(initial.id, { rating, title: title.trim(), content: content.trim(), author: author.trim() || undefined });
      if (updated) {
        onSubmit(updated);
        toast("Review updated!");
      }
    } else {
      const newReview = addReview({ slug, rating, title: title.trim(), content: content.trim(), author: author.trim() || undefined });
      onSubmit(newReview);
      toast("Review submitted!");
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-125"
              aria-label={`Rate ${i + 1} out of 10`}
            >
              <svg
                className={`w-6 h-6 ${i < displayRating ? "text-yellow-400 fill-current" : "text-muted-foreground/30 fill-current"}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm font-bold text-yellow-400">{displayRating}/10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your review a title..."
          className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 2000))}
          placeholder="Share your thoughts about this anime..."
          rows={4}
          className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          required
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${content.length >= 1800 ? "text-yellow-400" : "text-muted-foreground/50"}`}>
            {content.length}/2000
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Author <span className="text-muted-foreground/50">(optional)</span></label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name..."
          className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!title.trim() || !content.trim()}
          className="bg-gradient-to-r from-brand-teal to-brand-orange text-white font-bold px-6 py-2 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {initial ? "Update Review" : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type SortOption = "recent" | "highest" | "helpful";

interface ReviewSectionProps {
  slug: string;
}

export default function ReviewSection({ slug }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(() => getReviews(slug));
  const [stats, setStats] = useState(() => getAverageRating(slug));
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [sort, setSort] = useState<SortOption>("recent");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toast = useCallback((msg: string) => setToastMsg(msg), []);

  const refresh = useCallback(() => {
    setReviews(getReviews(slug));
    setStats(getAverageRating(slug));
  }, [slug]);

  const handleFormSubmit = (review: Review) => {
    setShowForm(false);
    setEditingReview(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteReview(id);
    refresh();
    toast("Review deleted");
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(false);
  };

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "highest") return b.rating - a.rating;
    return (b.upvotes || 0) - (b.downvotes || 0) - ((a.upvotes || 0) - (a.downvotes || 0));
  });

  return (
    <section className="mt-8 border-t border-border pt-8">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
        {!showForm && !editingReview && (
          <button
            onClick={() => { setShowForm(true); setEditingReview(null); }}
            className="bg-gradient-to-r from-brand-teal to-brand-orange text-white font-bold px-5 py-2 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg text-sm"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Average Rating Display */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-yellow-400">{stats.average || "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">out of 10</div>
        </div>
        <div className="flex-1">
          <StarRating rating={Math.round(stats.average)} size="lg" />
          <p className="text-sm text-muted-foreground mt-1">
            {stats.count} {stats.count === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => {
            const starCount = reviews.filter((r) => r.rating === i + 1).length;
            const pct = stats.count > 0 ? (starCount / stats.count) * 100 : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-3 h-16 bg-muted/50 rounded-full overflow-hidden flex flex-col justify-end">
                  <div className="w-full bg-yellow-400 rounded-full transition-all" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <ReviewForm slug={slug} onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} toast={toast} />
        </div>
      )}

      {editingReview && (
        <div className="mb-6">
          <ReviewForm slug={slug} initial={editingReview} onSubmit={handleFormSubmit} onCancel={() => setEditingReview(null)} toast={toast} />
        </div>
      )}

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          {([["recent", "Most Recent"], ["highest", "Highest Rated"], ["helpful", "Most Helpful"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                sort === key ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={handleDelete}
              toast={toast}
            />
          ))}
        </div>
      ) : (
        !showForm && !editingReview && (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )
      )}
    </section>
  );
}
