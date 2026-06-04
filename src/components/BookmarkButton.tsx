'use client';

import { useCallback, useSyncExternalStore } from 'react';

interface BookmarkData {
  id: number;
  slug: string;
  title: string;
  coverImage: string | null;
}

interface BookmarkButtonProps {
  anime: BookmarkData;
}

function getBookmarks(): BookmarkData[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('bookmarks');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

let bookmarkListeners: Array<() => void> = [];

function subscribeBookmarks(callback: () => void) {
  bookmarkListeners.push(callback);
  return () => {
    bookmarkListeners = bookmarkListeners.filter((l) => l !== callback);
  };
}

function emitBookmarkChange() {
  for (const listener of bookmarkListeners) {
    listener();
  }
}

let bookmarkVersion = 0;

function getBookmarkSnapshot() {
  return bookmarkVersion;
}

function getBookmarkServerSnapshot() {
  return 0;
}

export default function BookmarkButton({ anime }: BookmarkButtonProps) {
  useSyncExternalStore(subscribeBookmarks, getBookmarkSnapshot, getBookmarkServerSnapshot);

  const bookmarks = getBookmarks();
  const isBookmarked = bookmarks.some((b) => b.slug === anime.slug);

  const toggleBookmark = useCallback(() => {
    const current = getBookmarks();
    if (current.some((b) => b.slug === anime.slug)) {
      const filtered = current.filter((b) => b.slug !== anime.slug);
      localStorage.setItem('bookmarks', JSON.stringify(filtered));
    } else {
      current.push(anime);
      localStorage.setItem('bookmarks', JSON.stringify(current));
    }
    bookmarkVersion++;
    emitBookmarkChange();
  }, [anime]);

  return (
    <button
      onClick={toggleBookmark}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm ${
        isBookmarked
          ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 hover:bg-pink-500/30'
          : 'bg-card border-border text-muted-foreground hover:border-pink-500/40 hover:text-pink-400'
      }`}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill={isBookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isBookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
