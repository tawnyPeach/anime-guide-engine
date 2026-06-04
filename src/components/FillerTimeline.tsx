"use client";

import { useState, useMemo } from "react";

interface EpisodeData {
  episodeNumber: number;
  isFiller: boolean;
  isMixed: boolean;
  arcName: string | null;
}

interface FillerTimelineProps {
  episodes: EpisodeData[];
  totalCanon: number;
  totalFiller: number;
  totalMixed: number;
  shareUrl: string;
}

interface ArcGroup {
  arcName: string;
  episodes: EpisodeData[];
  startIndex: number;
  endIndex: number;
}

export default function FillerTimeline({
  episodes,
  totalCanon,
  totalFiller,
  totalMixed,
  shareUrl,
}: FillerTimelineProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const arcGroups = useMemo(() => {
    if (episodes.length === 0) return [];

    const groups: ArcGroup[] = [];
    let currentArc = episodes[0]?.arcName || null;
    let startIndex = 0;

    for (let i = 1; i <= episodes.length; i++) {
      const ep = episodes[i];
      const arc = ep?.arcName || null;

      if (arc !== currentArc || i === episodes.length) {
        groups.push({
          arcName: currentArc || "Unknown Arc",
          episodes: episodes.slice(startIndex, i),
          startIndex,
          endIndex: i - 1,
        });
        if (i < episodes.length) {
          currentArc = arc;
          startIndex = i;
        }
      }
    }

    return groups;
  }, [episodes]);

  const hasArcs = useMemo(() => {
    return episodes.some((ep) => ep.arcName !== null);
  }, [episodes]);

  if (episodes.length === 0) {
    return null;
  }

  const totalEpisodes = episodes.length;
  // Scale block width based on total episode count
  const blockWidth =
    totalEpisodes > 1000
      ? 1
      : totalEpisodes > 500
        ? 2
        : totalEpisodes > 200
          ? 3
          : totalEpisodes > 100
            ? 4
            : totalEpisodes > 50
              ? 6
              : 8;

  function getEpisodeType(ep: EpisodeData): string {
    if (ep.isFiller) return "Filler";
    if (ep.isMixed) return "Mixed";
    return "Canon";
  }

  function getBlockColor(ep: EpisodeData): string {
    if (ep.isFiller) return "bg-red-500";
    if (ep.isMixed) return "bg-yellow-500";
    return "bg-green-500";
  }

  function getBlockGlow(ep: EpisodeData): string {
    if (ep.isFiller) return "hover:shadow-[0_0_6px_rgba(239,68,68,0.6)]";
    if (ep.isMixed) return "hover:shadow-[0_0_6px_rgba(234,179,8,0.6)]";
    return "hover:shadow-[0_0_6px_rgba(34,197,94,0.6)]";
  }

  function handleMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    ep: EpisodeData
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect =
      e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
    const x = rect.left - (parentRect?.left || 0) + rect.width / 2;
    const y = -8;
    const type = getEpisodeType(ep);
    const arcInfo = ep.arcName ? ` (${ep.arcName})` : "";
    setTooltip({
      text: `Ep ${ep.episodeNumber} - ${type}${arcInfo}`,
      x,
      y,
    });
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-muted rounded-lg p-4 mb-8 glow-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-foreground">Episode Timeline</h3>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-200"
        >
          {copied ? (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share this timeline
            </>
          )}
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm mb-3">
        <span className="text-green-400 font-medium">
          {totalCanon} canon
        </span>
        <span className="text-muted-foreground/60">|</span>
        <span className="text-red-400 font-medium">
          {totalFiller} filler
        </span>
        <span className="text-muted-foreground/60">|</span>
        <span className="text-yellow-400 font-medium">
          {totalMixed} mixed
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative">
        {tooltip && (
          <div
            className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-background border border-border rounded shadow-lg whitespace-nowrap pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltip.text}
          </div>
        )}

        <div className="flex overflow-x-auto pb-1">
          <div className="flex gap-px min-w-0">
            {episodes.map((ep) => (
              <div
                key={ep.episodeNumber}
                className={`${getBlockColor(ep)} ${getBlockGlow(ep)} rounded-sm cursor-pointer transition-all duration-150 hover:scale-y-125 hover:brightness-125 flex-shrink-0`}
                style={{
                  width: `${blockWidth}px`,
                  height: "24px",
                }}
                onMouseEnter={(e) => handleMouseEnter(e, ep)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>
        </div>

        {/* Arc labels */}
        {hasArcs && arcGroups.length > 1 && (
          <div className="flex mt-2 overflow-x-auto">
            <div className="flex gap-px min-w-0">
              {arcGroups.map((group, idx) => {
                const groupWidth =
                  group.episodes.length * (blockWidth + 1) - 1;
                // Only show label if the group is wide enough
                const showLabel = groupWidth > 40;
                return (
                  <div
                    key={idx}
                    className="flex-shrink-0 border-t border-gray-600 pt-1"
                    style={{ width: `${groupWidth}px` }}
                  >
                    {showLabel && (
                      <span className="text-[10px] text-muted-foreground/60 truncate block leading-tight">
                        {group.arcName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
