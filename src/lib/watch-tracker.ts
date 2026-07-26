const STORAGE_KEY = "watchlist";

export type WatchStatus =
  | "watching"
  | "completed"
  | "plantowatch"
  | "dropped"
  | "onhold";

export interface WatchEntry {
  slug: string;
  title: string;
  coverImage: string;
  totalEpisodes: number;
  status: WatchStatus;
  episodesWatched: number;
  rating?: number;
  notes?: string;
  startDate?: string;
  completedDate?: string;
}

export interface WatchStats {
  totalWatching: number;
  totalCompleted: number;
  totalPlanToWatch: number;
  totalDropped: number;
  totalOnHold: number;
  totalEpisodesWatched: number;
  totalHoursWatched: number;
}

function safeGet(): WatchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeSet(entries: WatchEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

let listeners: Array<() => void> = [];

function notify() {
  for (const l of listeners) l();
}

export function subscribeWatchlist(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

let watchVersion = 0;
export function getWatchSnapshot() {
  return watchVersion;
}
export function getWatchServerSnapshot() {
  return 0;
}

export function getWatchlist(): WatchEntry[] {
  return safeGet();
}

export function addToWatchlist(entry: WatchEntry) {
  const list = safeGet();
  const idx = list.findIndex((e) => e.slug === entry.slug);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...entry };
  } else {
    list.push({ ...entry, startDate: entry.startDate || new Date().toISOString() });
  }
  safeSet(list);
  watchVersion++;
  notify();
}

export function removeFromWatchlist(slug: string) {
  safeSet(safeGet().filter((e) => e.slug !== slug));
  watchVersion++;
  notify();
}

export function updateWatchEntry(slug: string, updates: Partial<WatchEntry>) {
  const list = safeGet();
  const idx = list.findIndex((e) => e.slug === slug);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates };
    safeSet(list);
    watchVersion++;
    notify();
  }
}

export function markEpisodeWatched(slug: string) {
  const list = safeGet();
  const idx = list.findIndex((e) => e.slug === slug);
  if (idx < 0) return;
  const entry = list[idx];
  if (entry.episodesWatched >= entry.totalEpisodes && entry.totalEpisodes > 0) return;
  entry.episodesWatched++;
  if (entry.totalEpisodes > 0 && entry.episodesWatched >= entry.totalEpisodes) {
    entry.status = "completed";
    entry.completedDate = new Date().toISOString();
  }
  safeSet(list);
  watchVersion++;
  notify();
}

export function markEpisodeUnwatched(slug: string) {
  const list = safeGet();
  const idx = list.findIndex((e) => e.slug === slug);
  if (idx < 0) return;
  const entry = list[idx];
  if (entry.episodesWatched <= 0) return;
  entry.episodesWatched--;
  if (entry.status === "completed") {
    entry.status = "watching";
    entry.completedDate = undefined;
  }
  safeSet(list);
  watchVersion++;
  notify();
}

export function getWatchStats(): WatchStats {
  const list = safeGet();
  const epsPerHour = 24; // ~24 min per episode
  return {
    totalWatching: list.filter((e) => e.status === "watching").length,
    totalCompleted: list.filter((e) => e.status === "completed").length,
    totalPlanToWatch: list.filter((e) => e.status === "plantowatch").length,
    totalDropped: list.filter((e) => e.status === "dropped").length,
    totalOnHold: list.filter((e) => e.status === "onhold").length,
    totalEpisodesWatched: list.reduce((s, e) => s + e.episodesWatched, 0),
    totalHoursWatched: Math.round(
      (list.reduce((s, e) => s + e.episodesWatched, 0) * epsPerHour) / 60
    ),
  };
}

export function exportWatchlist(): string {
  return JSON.stringify(safeGet(), null, 2);
}

export function importWatchlist(json: string): boolean {
  try {
    const parsed: WatchEntry[] = JSON.parse(json);
    if (!Array.isArray(parsed)) return false;
    safeSet(parsed);
    watchVersion++;
    notify();
    return true;
  } catch {
    return false;
  }
}

export function isInWatchlist(slug: string): boolean {
  return safeGet().some((e) => e.slug === slug);
}

export function getWatchEntry(slug: string): WatchEntry | undefined {
  return safeGet().find((e) => e.slug === slug);
}
