"use client";

import { useState, useEffect } from "react";

interface AiringTimeDisplayProps {
  airingAt: number;
}

export default function AiringTimeDisplay({ airingAt }: AiringTimeDisplayProps) {
  const [timeString, setTimeString] = useState<string | null>(null);

  useEffect(() => {
    const date = new Date(airingAt * 1000);
    setTimeString(
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }, [airingAt]);

  if (!timeString) {
    return <span className="text-xs text-muted-foreground">&nbsp;</span>;
  }

  return <span className="text-xs text-muted-foreground">{timeString}</span>;
}
