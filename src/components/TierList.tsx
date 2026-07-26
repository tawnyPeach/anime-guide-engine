"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbElEQVQoz2NkYPj/n4EBCxg1atR/BgYGRnwKGRgYGP7//8+Irhgbmx4dNWrUf0ZsLiTCRkYmBgYGhv+MDAzYXPgfi04kVY3EYxI+P+BQiO4mYhXi9AMxCsnlB7I4Aas7cQXBf1xuxJcwAHq0QckiXeZJAAAAAElFTkSuQmCC";

export interface TierAnime {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  coverImage: string | null;
  averageScore: number | null;
}

interface Tier {
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const TIERS: Tier[] = [
  { label: "S", color: "#ef4444", bgClass: "bg-red-500/15", borderClass: "border-red-500/40", textClass: "text-red-400" },
  { label: "A", color: "#f97316", bgClass: "bg-orange-500/15", borderClass: "border-orange-500/40", textClass: "text-orange-400" },
  { label: "B", color: "#eab308", bgClass: "bg-yellow-500/15", borderClass: "border-yellow-500/40", textClass: "text-yellow-400" },
  { label: "C", color: "#22c55e", bgClass: "bg-green-500/15", borderClass: "border-green-500/40", textClass: "text-green-400" },
  { label: "D", color: "#3b82f6", bgClass: "bg-blue-500/15", borderClass: "border-blue-500/40", textClass: "text-blue-400" },
  { label: "F", color: "#6b7280", bgClass: "bg-gray-500/15", borderClass: "border-gray-500/40", textClass: "text-gray-400" },
];

function distributeByScore(anime: TierAnime[]): Record<string, TierAnime[]> {
  const tiers: Record<string, TierAnime[]> = { S: [], A: [], B: [], C: [], D: [], F: [] };
  for (const a of anime) {
    const score = a.averageScore ?? 50;
    if (score >= 90) tiers.S.push(a);
    else if (score >= 80) tiers.A.push(a);
    else if (score >= 70) tiers.B.push(a);
    else if (score >= 60) tiers.C.push(a);
    else if (score >= 50) tiers.D.push(a);
    else tiers.F.push(a);
  }
  return tiers;
}

interface TierListProps {
  initialAnime: TierAnime[];
}

export default function TierList({ initialAnime }: TierListProps) {
  const [tiers, setTiers] = useState<Record<string, TierAnime[]>>(() => distributeByScore(initialAnime));
  const [draggedItem, setDraggedItem] = useState<{ anime: TierAnime; fromTier: string } | null>(null);
  const [dragOverTier, setDragOverTier] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const handleDragStart = useCallback((e: React.DragEvent, anime: TierAnime, fromTier: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: anime.id, fromTier }));
    setDraggedItem({ anime, fromTier });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverTier(null);
    dragCounter.current = {};
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, tierLabel: string) => {
    e.preventDefault();
    dragCounter.current[tierLabel] = (dragCounter.current[tierLabel] || 0) + 1;
    setDragOverTier(tierLabel);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, tierLabel: string) => {
    e.preventDefault();
    dragCounter.current[tierLabel] = (dragCounter.current[tierLabel] || 0) - 1;
    if (dragCounter.current[tierLabel] <= 0) {
      dragCounter.current[tierLabel] = 0;
      setDragOverTier((prev) => (prev === tierLabel ? null : prev));
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toTier: string) => {
      e.preventDefault();
      dragCounter.current[toTier] = 0;
      setDragOverTier(null);

      try {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const { id, fromTier } = data;
        if (!id || !fromTier) return;

        setTiers((prev) => {
          const source = [...(prev[fromTier] || [])];
          const animeIdx = source.findIndex((a) => a.id === id);
          if (animeIdx === -1) return prev;

          const [anime] = source.splice(animeIdx, 1);
          const target = [...(prev[toTier] || [])];
          target.push(anime);

          return { ...prev, [fromTier]: source, [toTier]: target };
        });
      } catch {
        // ignore
      }
      setDraggedItem(null);
    },
    []
  );

  const handleTouchStart = useCallback((e: React.TouchEvent, anime: TierAnime, fromTier: string) => {
    setDraggedItem({ anime, fromTier });
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, anime: TierAnime, fromTier: string) => {
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const tierRow = element?.closest("[data-tier-label]");
      const toTier = tierRow?.getAttribute("data-tier-label");

      if (toTier && toTier !== fromTier) {
        setTiers((prev) => {
          const source = [...(prev[fromTier] || [])];
          const idx = source.findIndex((a) => a.id === anime.id);
          if (idx === -1) return prev;
          const [item] = source.splice(idx, 1);
          const target = [...(prev[toTier] || [])];
          target.push(item);
          return { ...prev, [fromTier]: source, [toTier]: target };
        });
      }
      setDraggedItem(null);
      setDragOverTier(null);
    },
    []
  );

  const handleReset = useCallback(() => {
    setTiers(distributeByScore(initialAnime));
  }, [initialAnime]);

  const handleShare = useCallback(() => {
    const lines = TIERS.map((t) => {
      const names = tiers[t.label].map((a) => a.titleEnglish || a.title);
      return `${t.label} Tier: ${names.length > 0 ? names.join(", ") : "(empty)"}`;
    }).join("\n");
    const text = `My Anime Tier List 🔥\n\n${lines}\n\nMade with AniYume`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert("Tier list copied to clipboard!"));
    }
  }, [tiers]);

  return (
    <div className="space-y-3">
      {TIERS.map((tier) => (
        <div
          key={tier.label}
          data-tier-label={tier.label}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => handleDragEnter(e, tier.label)}
          onDragLeave={(e) => handleDragLeave(e, tier.label)}
          onDrop={(e) => handleDrop(e, tier.label)}
          className={`flex rounded-xl border transition-all duration-200 min-h-[88px] ${
            dragOverTier === tier.label
              ? `${tier.bgClass} ${tier.borderClass} border-dashed shadow-lg`
              : "border-border/50 bg-card/50"
          }`}
        >
          {/* Tier Label */}
          <div
            className={`w-14 md:w-16 flex items-center justify-center rounded-l-xl font-extrabold text-2xl shrink-0 ${tier.bgClass} ${tier.textClass}`}
          >
            {tier.label}
          </div>

          {/* Anime Cards */}
          <div className="flex-1 flex flex-wrap gap-2 p-2 min-h-[64px] items-center">
            {tiers[tier.label].length === 0 && (
              <span className="text-muted-foreground/40 text-sm pl-1 select-none">
                Drop anime here
              </span>
            )}
            {tiers[tier.label].map((anime) => (
              <div
                key={anime.id}
                draggable
                onDragStart={(e) => handleDragStart(e, anime, tier.label)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, anime, tier.label)}
                onTouchEnd={(e) => handleTouchEnd(e, anime, tier.label)}
                className={`relative group cursor-grab active:cursor-grabbing rounded-lg overflow-hidden border border-border/50 bg-muted hover:border-primary/50 hover:shadow-md transition-all duration-200 select-none ${
                  draggedItem?.anime.id === anime.id ? "opacity-40 scale-95" : "opacity-100"
                }`}
                title={`${anime.titleEnglish || anime.title}${anime.averageScore ? ` (${anime.averageScore})` : ""}`}
              >
                <div className="relative w-12 h-16 md:w-14 md:h-20">
                  {anime.coverImage ? (
                    <Image
                      src={anime.coverImage}
                      alt={anime.titleEnglish || anime.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      🎬
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5">
                  <p className="text-[8px] md:text-[9px] text-white truncate leading-tight font-medium">
                    {anime.titleEnglish || anime.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-2.5 rounded-xl bg-muted border border-border text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg"
        >
          Share
        </button>
      </div>
    </div>
  );
}
