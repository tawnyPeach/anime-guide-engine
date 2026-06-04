"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AiringEntry, WeeklySchedule } from "@/lib/calendar";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCurrentDayIndex(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sunday, 1=Monday...
  return day === 0 ? 6 : day - 1; // Convert to 0=Monday, 6=Sunday
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
  schedule: WeeklySchedule;
}

export default function CalendarGrid({ schedule }: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const entries: AiringEntry[] = schedule[selectedDay] || [];

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
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                  : isToday
                  ? "bg-purple-900/30 text-purple-300 border border-purple-500/30 hover:border-purple-400/50"
                  : "bg-anime-card border border-anime-border text-gray-400 hover:text-white hover:border-gray-500"
              }`}
            >
              {label}
              {isToday && !isSelected && (
                <span className="ml-1 w-1.5 h-1.5 bg-purple-400 rounded-full inline-block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Anime Cards */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No anime airing on this day</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {entries.map((entry, idx) => (
            <div
              key={`${entry.media.id}-${entry.episode}-${idx}`}
              className="bg-anime-card border border-anime-border rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
            >
              <div className="flex gap-3 p-3">
                {/* Cover Image */}
                <div className="relative w-16 h-22 flex-shrink-0 rounded-lg overflow-hidden">
                  {entry.media.coverImage?.large ? (
                    <Image
                      src={entry.media.coverImage.large}
                      alt={entry.media.title.english || entry.media.title.romaji}
                      width={64}
                      height={88}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 text-xs">No img</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {entry.media.title.english || entry.media.title.romaji}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Episode {entry.episode}
                    {entry.media.episodes && (
                      <span className="text-gray-600"> / {entry.media.episodes}</span>
                    )}
                  </p>
                  {entry.media.format && (
                    <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-700/30">
                      {entry.media.format}
                    </span>
                  )}
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs text-blue-400">
                      {formatLocalTime(entry.airingAt)}
                    </p>
                    <p className="text-xs text-emerald-400 font-medium">
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
