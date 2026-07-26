"use client";

import { useState, useRef, useEffect } from "react";
import { getStreamingLinks, type StreamingLink } from "@/lib/affiliate";

interface WatchNowButtonProps {
  anime: {
    title: string;
    titleEnglish?: string | null;
    slug: string;
    externalLinks?: string | null;
  };
}

export default function WatchNowButton({ anime }: WatchNowButtonProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const links = getStreamingLinks(anime);
  const primaryLinks = links.slice(0, 4);
  const secondaryLinks = links.slice(4);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-lg hover:scale-105 transition-transform duration-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Watch Now
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-border">
            <p className="text-xs text-muted-foreground px-2 py-1">Stream on</p>
          </div>
          <div className="p-2 space-y-1">
            {primaryLinks.map((link) => (
              <StreamingLinkItem key={link.name} link={link} />
            ))}
          </div>

          {secondaryLinks.length > 0 && (
            <>
              <div className="px-4 py-2 border-t border-border border-b">
                <p className="text-xs text-muted-foreground">More options</p>
              </div>
              <div className="p-2 space-y-1">
                {secondaryLinks.map((link) => (
                  <StreamingLinkItem key={link.name} link={link} />
                ))}
              </div>
            </>
          )}

          <div className="p-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center px-2">
              Links may be affiliate links. We may earn a commission at no cost to you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StreamingLinkItem({ link }: { link: StreamingLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r ${link.gradient} ${link.textColor} hover:brightness-110 transition-all duration-200 group`}
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold">
        {link.icon}
      </span>
      <span className="font-medium text-sm flex-1">{link.name}</span>
      <svg
        className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
