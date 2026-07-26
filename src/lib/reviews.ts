"use client";

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

const STORAGE_KEY = "aniyume_reviews";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function getReviews(slug: string): Review[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all: Review[] = JSON.parse(raw);
    return all.filter((r) => r.slug === slug);
  } catch {
    return [];
  }
}

export function getAllReviews(): Review[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addReview(
  review: Omit<Review, "id" | "createdAt" | "updatedAt" | "upvotes" | "downvotes">
): Review {
  const all = getAllReviews();
  const newReview: Review = {
    ...review,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
  };
  all.push(newReview);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newReview;
}

export function updateReview(
  id: string,
  updates: Partial<Pick<Review, "rating" | "title" | "content" | "author">>
): Review | null {
  const all = getAllReviews();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[idx];
}

export function deleteReview(id: string): boolean {
  const all = getAllReviews();
  const filtered = all.filter((r) => r.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getAverageRating(slug: string): { average: number; count: number } {
  const reviews = getReviews(slug);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export function getRecentReviews(limit: number = 4): Review[] {
  const all = getAllReviews();
  return all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function voteReview(id: string, type: "up" | "down"): Review | null {
  const all = getAllReviews();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const review = all[idx];
  if (type === "up") {
    review.upvotes = (review.upvotes || 0) + 1;
  } else {
    review.downvotes = (review.downvotes || 0) + 1;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return review;
}
