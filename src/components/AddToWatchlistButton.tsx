'use client';

import { useState, useRef, useEffect } from 'react';
import {
  isInWatchlist,
  getWatchEntry,
  addToWatchlist,
  updateWatchEntry,
  removeFromWatchlist,
  subscribeWatchlist,
  getWatchSnapshot,
  getWatchServerSnapshot,
  type WatchStatus,
} from '@/lib/watch-tracker';
import { useSyncExternalStore } from 'react';

const STATUS_OPTIONS: { value: WatchStatus; label: string; icon: string }[] = [
  { value: 'plantowatch', label: 'Plan to Watch', icon: '☆' },
  { value: 'watching', label: 'Currently Watching', icon: '▶' },
  { value: 'completed', label: 'Completed', icon: '✓' },
  { value: 'dropped', label: 'Dropped', icon: '✕' },
  { value: 'onhold', label: 'On Hold', icon: '⏸' },
];

const STATUS_COLORS: Record<WatchStatus, string> = {
  watching: 'text-green-400 border-green-500/40 bg-green-500/10',
  completed: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  plantowatch: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  dropped: 'text-red-400 border-red-500/40 bg-red-500/10',
  onhold: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
};

interface Props {
  slug: string;
  title: string;
  coverImage: string;
  totalEpisodes: number;
}

export default function AddToWatchlistButton({ slug, title, coverImage, totalEpisodes }: Props) {
  useSyncExternalStore(subscribeWatchlist, getWatchSnapshot, getWatchServerSnapshot);

  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const inList = isInWatchlist(slug);
  const entry = getWatchEntry(slug);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAdd = (status: WatchStatus) => {
    addToWatchlist({ slug, title, coverImage, totalEpisodes, status, episodesWatched: entry?.episodesWatched || 0 });
    setFeedback(STATUS_OPTIONS.find((o) => o.value === status)?.label || 'Added');
    setOpen(false);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleRemove = () => {
    removeFromWatchlist(slug);
    setFeedback('Removed');
    setOpen(false);
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm ${
          inList && entry
            ? `${STATUS_COLORS[entry.status]} font-medium`
            : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
        }`}
        aria-label={inList ? `Watchlist: ${entry?.status}` : 'Add to watchlist'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {inList && entry ? (
          <span>{STATUS_OPTIONS.find((o) => o.value === entry.status)?.icon} {STATUS_OPTIONS.find((o) => o.value === entry.status)?.label}</span>
        ) : (
          <span>Add to List</span>
        )}
      </button>

      {/* Feedback toast */}
      {feedback && (
        <div className="absolute top-full mt-2 left-0 z-50 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-medium whitespace-nowrap animate-in fade-in duration-200">
          {feedback}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-card border border-border rounded-xl shadow-2xl py-1 min-w-[180px] animate-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border mb-1">
            {inList ? 'Change status' : 'Add to watchlist'}
          </div>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAdd(opt.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                entry?.status === opt.value ? 'text-primary font-medium' : 'text-foreground'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
              {entry?.status === opt.value && <span className="ml-auto text-xs text-primary">✓</span>}
            </button>
          ))}
          {inList && (
            <>
              <div className="border-t border-border my-1" />
              <button
                onClick={handleRemove}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <span>✕</span>
                <span>Remove from list</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
