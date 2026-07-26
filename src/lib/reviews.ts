export interface Review {
  id: string;
  slug: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  upvotes?: number;
  downvotes?: number;
}

export async function getReviews(slug: string): Promise<Review[]> {
  const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}&sort=recent&limit=100`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.reviews || [];
}

export async function getAllReviews(
  sort: string = "recent",
  minRating: number = 0,
  page: number = 1,
  limit: number = 10
): Promise<{ reviews: Review[]; total: number; totalPages: number }> {
  const params = new URLSearchParams({ sort, minRating: String(minRating), page: String(page), limit: String(limit) });
  const res = await fetch(`/api/reviews?${params}`);
  if (!res.ok) return { reviews: [], total: 0, totalPages: 0 };
  return res.json();
}

export async function addReview(
  review: Omit<Review, "id" | "createdAt" | "updatedAt" | "upvotes" | "downvotes">
): Promise<Review> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error("Failed to create review");
  return res.json();
}

export async function updateReview(
  id: string,
  updates: Partial<Pick<Review, "rating" | "title" | "content" | "author">>
): Promise<Review | null> {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteReview(id: string): Promise<boolean> {
  const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function getAverageRating(slug: string): Promise<{ average: number; count: number }> {
  const reviews = await getReviews(slug);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export async function getRecentReviews(limit: number = 4): Promise<Review[]> {
  const res = await fetch(`/api/reviews?sort=recent&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.reviews || [];
}

export async function voteReview(id: string, type: "up" | "down"): Promise<Review | null> {
  const res = await fetch(`/api/reviews/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) return null;
  return res.json();
}
