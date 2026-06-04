"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { AiringEntry } from "@/lib/calendar";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCurrentDayIndex(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sunday, 1=Monday...
  return day === 0 ? 6 : day - 1; // Convert to 0=Monday, 6=Sunday
}

function groupByLocalDay(entries: AiringEntry[]): Record<number, AiringEntry[]> {
  const grouped: Record<number, AiringEntry[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const entry of entries) {
    const date = new Date(entry.airingAt * 1000);
    const localDay = date.getDay(); // 0=Sunday, 1=Monday...
    const dayIndex = localDay === 0 ? 6 : localDay - 1; // Convert to 0=Monday, 6=Sunday
    grouped[dayIndex].push(entry);
  }
  return grouped;
}

function formatCountdown(airingAt: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = airingAt - now;

  if (diff > 0) {
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    if (hours > 0) {
      return `Airing in ${hours}h ${minutes}m`;
    }
    return `Airing in ${minutes}m`;
  } else {
    const elapsed = Math.abs(diff);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    if (hours > 0) {
      return `Aired ${hours}h ago`;
    }
    return `Aired ${minutes}m ago`;
  }
}

function formatLocalTime(airingAt: number): string {
  const date = new Date(airingAt * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface CalendarGridProps {
  entries: AiringEntry[];
}

export default function CalendarGrid({ entries }: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const schedule = useMemo(() => groupByLocalDay(entries), [entries]);

  const dayEntries: AiringEntry[] = schedule[selectedDay] || [];

  return (
    <div>
      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {DAY_LABELS.map((label, index) => {
          const isSelected = index === selectedDay;
          const isToday = index === getCurrentDayIndex();
          return (
            <button
              key={label}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                isSelected
                  ? "bg-gradient-to-r from-primary to-brand-teal text-primary-foreground shadow-lg"
                  : isToday
                  ? "bg-primary/10 text-primary border border-primary/30 hover:border-primary/50"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {label}
              {isToday && !isSelected && (
                <span className="ml-1 w-1.5 h-1.5 bg-primary rounded-full inline-block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Anime Cards */}
      {dayEntries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No anime airing on this day</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dayEntries.map((entry, idx) => (
            <div
              key={`${entry.media.id}-${entry.episode}-${idx}`}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
            >
              <div className="flex gap-3 p-3">
                {/* Cover Image */}
                <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                  {entry.media.coverImage?.large ? (
                    <Image
                      src={entry.media.coverImage.large}
                      alt={entry.media.title.english || entry.media.title.romaji}
                      width={80}
                      height={112}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No img</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {entry.media.title.english || entry.media.title.romaji}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Episode {entry.episode}
                    {entry.media.episodes && (
                      <span className="text-muted-foreground/60"> / {entry.media.episodes}</span>
                    )}
                  </p>
                  {entry.media.format && (
                    <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {entry.media.format}
                    </span>
                  )}
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs text-brand-teal">
                      {formatLocalTime(entry.airingAt)}
                    </p>
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
                      {formatCountdown(entry.airingAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
