'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getWatchlist,
  removeFromWatchlist,
  updateWatchEntry,
  markEpisodeWatched,
  markEpisodeUnwatched,
  exportWatchlist,
  importWatchlist,
  subscribeWatchlist,
  getWatchSnapshot,
  getWatchServerSnapshot,
  getWatchStats,
  type WatchEntry,
  type WatchStatus,
} from '@/lib/watch-tracker';
import { useSyncExternalStore } from 'react';

const STATUS_META: Record<WatchStatus, { label: string; color: string; bg: string; icon: string }> = {
  watching:     { label: 'Watching',      color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',  icon: '▶' },
  completed:    { label: 'Completed',     color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',   icon: '✓' },
  plantowatch:  { label: 'Plan to Watch', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: '☆' },
  dropped:      { label: 'Dropped',       color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',     icon: '✕' },
  onhold:       { label: 'On Hold',       color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: '⏸' },
};

const STATUS_KEYS: WatchStatus[] = ['watching', 'completed', 'plantowatch', 'dropped', 'onhold'];

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium transition-all duration-300 animate-in slide-in-from-bottom-4 ${
        type === 'success'
          ? 'bg-green-500/20 border-green-500/40 text-green-300'
          : 'bg-red-500/20 border-red-500/40 text-red-300'
      }`}
    >
      {message}
    </div>
  );
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <p className="text-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-border text-muted-foreground hover:bg-muted/50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors font-medium">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          className={`text-lg transition-colors ${
            star <= (hover || rating) ? 'text-yellow-400' : 'text-muted-foreground/30'
          } hover:text-yellow-400`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star === rating ? 0 : star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {rating > 0 && <span className="text-xs text-muted-foreground ml-1 self-center">{rating}/10</span>}
    </div>
  );
}

function WatchEntryCard({
  entry,
  onRemove,
  showToast,
}: {
  entry: WatchEntry;
  onRemove: (slug: string) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [status, setStatus] = useState(entry.status);
  const [eps, setEps] = useState(entry.episodesWatched);
  const [rating, setRating] = useState(entry.rating || 0);
  const [notes, setNotes] = useState(entry.notes || '');
  const [expanded, setExpanded] = useState(false);

  const pct = entry.totalEpisodes > 0 ? Math.round((eps / entry.totalEpisodes) * 100) : 0;

  const handleStatusChange = (newStatus: WatchStatus) => {
    setStatus(newStatus);
    updateWatchEntry(entry.slug, { status: newStatus });
    showToast(`Moved to ${STATUS_META[newStatus].label}`, 'success');
  };

  const handleInc = () => {
    if (entry.totalEpisodes > 0 && eps >= entry.totalEpisodes) return;
    const next = eps + 1;
    setEps(next);
    const isComplete = entry.totalEpisodes > 0 && next >= entry.totalEpisodes;
    markEpisodeWatched(entry.slug);
    if (isComplete) {
      setStatus('completed');
      showToast('Anime completed!', 'success');
    }
  };

  const handleDec = () => {
    if (eps <= 0) return;
    setEps(eps - 1);
    markEpisodeUnwatched(entry.slug);
    if (status === 'completed') {
      setStatus('watching');
    }
  };

  const handleRating = (r: number) => {
    setRating(r);
    updateWatchEntry(entry.slug, { rating: r });
  };

  const handleNotesBlur = () => {
    if (notes !== (entry.notes || '')) {
      updateWatchEntry(entry.slug, { notes });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 group">
      <div className="flex gap-4 p-4">
        {/* Cover */}
        <Link href={`/anime/${entry.slug}`} className="flex-shrink-0">
          <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-muted">
            {entry.coverImage ? (
              <Image src={entry.coverImage} alt={entry.title} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">🎬</div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/anime/${entry.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate">
              {entry.title}
            </Link>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground text-xs shrink-0 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {expanded ? 'Less' : 'More'}
            </button>
          </div>

          {/* Episodes */}
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleDec} className="w-7 h-7 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center text-sm transition-colors" disabled={eps <= 0}>
              −
            </button>
            <span className="text-sm text-foreground font-medium min-w-[70px] text-center">
              {eps}/{entry.totalEpisodes || '?'} eps
            </span>
            <button onClick={handleInc} className="w-7 h-7 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center text-sm transition-colors" disabled={entry.totalEpisodes > 0 && eps >= entry.totalEpisodes}>
              +
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground mt-1 block">{pct}% complete</span>

          {/* Status selector */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {STATUS_KEYS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`text-xs px-2 py-1 rounded-lg border transition-all duration-200 ${
                  status === s
                    ? `${STATUS_META[s].bg} ${STATUS_META[s].color} font-medium`
                    : 'border-border text-muted-foreground/60 hover:text-muted-foreground hover:border-border/80'
                }`}
              >
                {STATUS_META[s].icon} {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3 animate-in slide-in-from-top-1 duration-200">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Rating</label>
            <StarRating rating={rating} onChange={handleRating} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes about this anime..."
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
              rows={2}
            />
          </div>
          <button
            onClick={() => onRemove(entry.slug)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Remove from list
          </button>
        </div>
      )}
    </div>
  );
}

export default function TrackerClient() {
  useSyncExternalStore(subscribeWatchlist, getWatchSnapshot, getWatchServerSnapshot);

  const [activeTab, setActiveTab] = useState<WatchStatus>('watching');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'score'>('date');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const watchlist = getWatchlist();
  const stats = getWatchStats();

  const filtered = watchlist
    .filter((e) => e.status === activeTab)
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'score') return (b.rating || 0) - (a.rating || 0);
      return 0; // date = default order (most recent first since we push to end, but reverse for UX)
    });

  if (sortBy === 'date') filtered.reverse();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleRemove = (slug: string) => {
    setConfirmSlug(slug);
  };

  const confirmRemove = () => {
    if (confirmSlug) {
      removeFromWatchlist(confirmSlug);
      showToast('Removed from watchlist', 'success');
      setConfirmSlug(null);
    }
  };

  const handleExport = () => {
    const json = exportWatchlist();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aniyume-watchlist.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Watchlist exported!', 'success');
  };

  const handleImport = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importWatchlist(text)) {
        showToast('Watchlist imported!', 'success');
      } else {
        showToast('Invalid watchlist file', 'error');
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const statCards = [
    { label: 'Watching', value: stats.totalWatching, icon: '▶', color: 'text-green-400', bg: 'from-green-500/10 to-green-500/5' },
    { label: 'Completed', value: stats.totalCompleted, icon: '✓', color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Plan to Watch', value: stats.totalPlanToWatch, icon: '☆', color: 'text-yellow-400', bg: 'from-yellow-500/10 to-yellow-500/5' },
    { label: 'Dropped', value: stats.totalDropped, icon: '✕', color: 'text-red-400', bg: 'from-red-500/10 to-red-500/5' },
    { label: 'On Hold', value: stats.totalOnHold, icon: '⏸', color: 'text-orange-400', bg: 'from-orange-500/10 to-orange-500/5' },
    { label: 'Hours Watched', value: stats.totalHoursWatched, icon: '◷', color: 'text-purple-400', bg: 'from-purple-500/10 to-purple-500/5' },
  ];

  const emptyMsg: Record<WatchStatus, string> = {
    watching: 'No anime watching yet — browse our catalog!',
    completed: 'No completed anime yet — start watching!',
    plantowatch: 'Your plan to watch list is empty — find something to add!',
    dropped: 'No dropped anime — nice!',
    onhold: 'Nothing on hold right now.',
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} border border-border rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Sort + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {STATUS_KEYS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`text-sm px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                activeTab === s
                  ? `${STATUS_META[s].bg} ${STATUS_META[s].color} font-medium`
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
            >
              {STATUS_META[s].icon} {STATUS_META[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="date">Date Added</option>
            <option value="title">Title</option>
            <option value="score">Score</option>
          </select>
          <button onClick={handleExport} className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors" title="Export watchlist">
            ↓ Export
          </button>
          <button onClick={handleImport} className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors" title="Import watchlist">
            ↑ Import
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-muted-foreground text-lg mb-2">{emptyMsg[activeTab]}</p>
          <Link href="/" className="text-primary hover:text-primary/80 text-sm transition-colors">
            Browse anime catalog →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <WatchEntryCard
              key={entry.slug}
              entry={entry}
              onRemove={handleRemove}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmSlug && (
        <ConfirmDialog
          message="Remove this anime from your watchlist?"
          onConfirm={confirmRemove}
          onCancel={() => setConfirmSlug(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
