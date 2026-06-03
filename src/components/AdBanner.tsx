"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export default function AdBanner({
  slot = "",
  format = "auto",
  className = "",
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (clientId && typeof window !== "undefined") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        // AdSense not loaded
      }
    }
  }, [clientId]);

  if (!clientId) {
    // Placeholder for development
    return (
      <div
        className={`bg-gray-800 border border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 text-sm ${className}`}
        style={{ minHeight: "90px" }}
      >
        <span>Ad Space</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
