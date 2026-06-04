'use client';

import { useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BookmarkData {
  id: number;
  slug: string;
  title: string;
  coverImage: string | null;
}

let bookmarkPageListeners: Array<() => void> = [];
let bookmarkPageVersion = 0;

function subscribeBookmarkPage(callback: () => void) {
  bookmarkPageListeners.push(callback);
  return () => {
    bookmarkPageListeners = bookmarkPageListeners.filter((l) => l !== callback);
  };
}

function getBookmarkPageSnapshot() {
  return bookmarkPageVersion;
}

function getBookmarkPageServerSnapshot() {
  return 0;
}

function emitBookmarkPageChange() {
  bookmarkPageVersion++;
  for (const listener of bookmarkPageListeners) {
    listener();
  }
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

export default function BookmarksPage() {
  useSyncExternalStore(subscribeBookmarkPage, getBookmarkPageSnapshot, getBookmarkPageServerSnapshot);

  const bookmarks = getBookmarks();

  const removeBookmark = useCallback((slug: string) => {
    const current = getBookmarks();
    const filtered = current.filter((b) => b.slug !== slug);
    localStorage.setItem('bookmarks', JSON.stringify(filtered));
    emitBookmarkPageChange();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
        My Bookmarks
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Your saved anime ({bookmarks.length} saved)
      </p>

      {bookmarks.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <span className="text-4xl mb-4 block">💜</span>
          <p className="text-muted-foreground mb-4">No bookmarked anime yet.</p>
          <p className="text-muted-foreground/60 text-sm mb-6">
            Click the heart icon on any anime page to save it here.
          </p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 bg-gradient-to-r from-primary to-brand-teal text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-all duration-200"
          >
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {bookmarks.map((anime) => (
            <div
              key={anime.slug}
              className="bg-card rounded-xl overflow-hidden border border-border hover:glow-card-hover transition-all duration-300 group hover:-translate-y-1 relative"
            >
              <Link href={`/anime/${anime.slug}`}>
                <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                  {anime.coverImage ? (
                    <Image
                      src={anime.coverImage}
                      alt={`${anime.title} cover`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-foreground font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {anime.title}
                  </h3>
                </div>
              </Link>
              <button
                onClick={() => removeBookmark(anime.slug)}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove bookmark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
