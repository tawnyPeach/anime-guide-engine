"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const BLUR_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbElEQVQoz2NkYPj/n4EBCxg1atR/BgYGRnwKGRgYGP7//8+Irhgbmx4dNWrUf0ZsLiTCRkYmBgYGhv+MDAzYXPgfi04kVY3EYxI+P+BQiO4mYhXi9AMxCsnlB7I4Aas7cQXBf1xuxJcwAHq0RckiXeZJAAAAAElFTkSuQmCC";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Better in Manga": { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  "Better in Anime": { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  "Both are Great": { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  "Major Differences": { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
};

interface MangaVsAnimeCardProps {
  title: string;
  titleEnglish?: string | null;
  slug: string;
  coverImage?: string | null;
  averageScore?: number | null;
  category: string;
  description: string;
  index?: number;
}

export default function MangaVsAnimeCard({
  title,
  titleEnglish,
  slug,
  coverImage,
  averageScore,
  category,
  description,
  index = 0,
}: MangaVsAnimeCardProps) {
  const [hovered, setHovered] = useState(false);
  const displayTitle = titleEnglish || title;
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES["Both are Great"];

  return (
    <article
      className="animate-card-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/manga-vs-anime/${slug}`} className="block group">
        <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-[16/10] bg-muted overflow-hidden">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`${displayTitle} manga vs anime`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-4xl">📖</span>
              </div>
            )}

            {/* Category badge */}
            <span className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
              {category}
            </span>

            {/* Score badge */}
            {averageScore && (
              <span className="absolute top-2 right-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-orange/90 text-white">
                <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {(averageScore / 10).toFixed(1)}
              </span>
            )}

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* VS badge */}
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white">
                MANGA vs ANIME
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={displayTitle}>
              {displayTitle}
            </h3>
            <p className={`text-[11px] mt-1 line-clamp-2 transition-all duration-300 ${hovered ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
              {hovered ? description : description.slice(0, 80) + (description.length > 80 ? "..." : "")}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
