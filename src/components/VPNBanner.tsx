"use client";

import { useState } from "react";
import { VPN_BANNERS } from "@/lib/affiliate";

const DISMISS_KEY = "vpn-banner-dismissed";

export default function VPNBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(DISMISS_KEY) === "true";
  });

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  }

  if (dismissed) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-3 mb-8 flex flex-col sm:flex-row items-center gap-3 text-sm">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-foreground font-medium">
            Can&apos;t watch due to region restrictions?
          </p>
          <p className="text-muted-foreground text-xs">
            Try a VPN to access streaming services worldwide.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {VPN_BANNERS.map((v) => (
          <a
            key={v.name}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${v.gradient} text-white text-xs font-medium hover:brightness-110 transition-all duration-200`}
          >
            {v.cta}
          </a>
        ))}
        <button
          onClick={dismiss}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Dismiss VPN banner"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
