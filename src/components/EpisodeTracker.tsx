'use client';

import { useCallback, useSyncExternalStore } from 'react';

interface EpisodeTrackerProps {
  animeSlug: string;
  totalEpisodes: number;
  episodes: { episodeNumber: number; title: string | null }[];
}

let trackerListeners: Array<() => void> = [];
let trackerVersion = 0;

function subscribeTracker(callback: () => void) {
  trackerListeners.push(callback);
  return () => {
    trackerListeners = trackerListeners.filter((l) => l !== callback);
  };
}

function getTrackerSnapshot() {
  return trackerVersion;
}

function getTrackerServerSnapshot() {
  return 0;
}

function emitTrackerChange() {
  trackerVersion++;
  for (const listener of trackerListeners) {
    listener();
  }
}

function getWatched(slug: string): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(`watched_${slug}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function EpisodeTracker({ animeSlug, totalEpisodes, episodes }: EpisodeTrackerProps) {
  useSyncExternalStore(subscribeTracker, getTrackerSnapshot, getTrackerServerSnapshot);

  const watched = getWatched(animeSlug);

  const toggleEpisode = useCallback((epNum: number) => {
    const current = getWatched(animeSlug);
    const next = current.includes(epNum)
      ? current.filter((n) => n !== epNum)
      : [...current, epNum].sort((a, b) => a - b);
    localStorage.setItem(`watched_${animeSlug}`, JSON.stringify(next));
    emitTrackerChange();
  }, [animeSlug]);

  const markAllWatched = useCallback(() => {
    const all = episodes.map((ep) => ep.episodeNumber);
    localStorage.setItem(`watched_${animeSlug}`, JSON.stringify(all));
    emitTrackerChange();
  }, [animeSlug, episodes]);

  const clearAll = useCallback(() => {
    localStorage.removeItem(`watched_${animeSlug}`);
    emitTrackerChange();
  }, [animeSlug]);

  const progress = totalEpisodes > 0 ? (watched.length / totalEpisodes) * 100 : 0;

  return (
    <div className="bg-anime-card border border-anime-border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Episode Tracker</h3>
        <div className="flex gap-2">
          <button
            onClick={markAllWatched}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Mark All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{watched.length}/{totalEpisodes} episodes watched</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Episode checkboxes */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {episodes.map((ep) => (
          <label
            key={ep.episodeNumber}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-800/50 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={watched.includes(ep.episodeNumber)}
              onChange={() => toggleEpisode(ep.episodeNumber)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span className="text-gray-400 font-mono text-xs w-8">{ep.episodeNumber}</span>
            <span className="text-gray-300 text-xs group-hover:text-white transition-colors truncate">
              {ep.title || `Episode ${ep.episodeNumber}`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
