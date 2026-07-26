'use client';

import Link from 'next/link';
import {
  getWatchStats,
  subscribeWatchlist,
  getWatchSnapshot,
  getWatchServerSnapshot,
} from '@/lib/watch-tracker';
import { useSyncExternalStore } from 'react';

export default function TrackerWidget() {
  useSyncExternalStore(subscribeWatchlist, getWatchSnapshot, getWatchServerSnapshot);

  const stats = getWatchStats();
  const hasEntries = stats.totalWatching + stats.totalCompleted + stats.totalPlanToWatch + stats.totalDropped + stats.totalOnHold > 0;

  if (!hasEntries) {
    return (
      <section className="mb-12">
        <div className="relative bg-gradient-to-br from-primary/10 via-brand-orange/5 to-transparent border border-border rounded-2xl p-6 md:p-8 text-center overflow-hidden">
          <div className="absolute top-0 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="text-3xl mb-3">📋</div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Start Tracking Your Anime
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-5 text-sm">
              Keep track of what you&apos;re watching, rate your favorites, and never lose progress.
            </p>
            <Link
              href="/tracker"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-teal to-brand-orange text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg text-sm"
            >
              Get Started
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="bg-gradient-to-br from-primary/10 via-brand-orange/5 to-transparent border border-border rounded-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Your Watch Tracker</h2>
          <Link href="/tracker" className="text-sm text-primary hover:text-primary/80 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="text-lg font-bold text-green-400">{stats.totalWatching}</div>
            <div className="text-xs text-muted-foreground">Watching</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="text-lg font-bold text-blue-400">{stats.totalCompleted}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="text-lg font-bold text-yellow-400">{stats.totalPlanToWatch}</div>
            <div className="text-xs text-muted-foreground">Plan to Watch</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="text-lg font-bold text-red-400">{stats.totalDropped}</div>
            <div className="text-xs text-muted-foreground">Dropped</div>
          </div>
          <div className="text-center p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <div className="text-lg font-bold text-orange-400">{stats.totalOnHold}</div>
            <div className="text-xs text-muted-foreground">On Hold</div>
          </div>
          <div className="text-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-lg font-bold text-purple-400">{stats.totalHoursWatched}h</div>
            <div className="text-xs text-muted-foreground">Watched</div>
          </div>
        </div>
      </div>
    </section>
  );
}
