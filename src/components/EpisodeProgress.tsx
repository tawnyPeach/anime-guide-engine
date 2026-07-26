'use client';

import { useState, useEffect } from 'react';
import {
  getWatchEntry,
  markEpisodeWatched,
  markEpisodeUnwatched,
  subscribeWatchlist,
  getWatchSnapshot,
  getWatchServerSnapshot,
} from '@/lib/watch-tracker';
import { useSyncExternalStore } from 'react';

interface Props {
  slug: string;
  totalEpisodes: number;
}

export default function EpisodeProgress({ slug, totalEpisodes }: Props) {
  useSyncExternalStore(subscribeWatchlist, getWatchSnapshot, getWatchServerSnapshot);

  const entry = getWatchEntry(slug);
  const watched = entry?.episodesWatched || 0;
  const pct = totalEpisodes > 0 ? Math.round((watched / totalEpisodes) * 100) : 0;

  if (!entry) return null;

  const handleInc = () => {
    if (totalEpisodes > 0 && watched >= totalEpisodes) return;
    markEpisodeWatched(slug);
  };

  const handleDec = () => {
    if (watched <= 0) return;
    markEpisodeUnwatched(slug);
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-foreground font-medium">
          Episode Progress
        </span>
        <span className="text-sm text-muted-foreground">
          {watched}/{totalEpisodes || '?'} episodes
        </span>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{pct}% complete</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDec}
            disabled={watched <= 0}
            className="w-8 h-8 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Mark previous episode unwatched"
          >
            −
          </button>
          <button
            onClick={handleInc}
            disabled={totalEpisodes > 0 && watched >= totalEpisodes}
            className="w-8 h-8 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold"
            aria-label="Mark episode watched"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
