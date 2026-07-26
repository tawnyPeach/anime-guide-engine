"use client";

import { useState } from "react";

interface AiringTimeDisplayProps {
  airingAt: number;
}

export default function AiringTimeDisplay({ airingAt }: AiringTimeDisplayProps) {
  const [timeString] = useState<string>(() => {
    const date = new Date(airingAt * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  return <span className="text-xs text-muted-foreground">{timeString}</span>;
}
