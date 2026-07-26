"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { getStreamingLinks } from "@/lib/affiliate";

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbElEQVQoz2NkYPj/n4EBCxg1atR/BgYGRnwKGRgYGP7//8+Irhgbmx4dNWrUf0ZsLiTCRkYmBgYGhv+MDAzYXPgfi04kVY3EYxI+P+BQiO4mYhXi9AMxCsnlB7I4Aas7cQXBf1xuxJcwAHq0QckiXeZJAAAAAElFTkSuQmCC";

const ANIME_FACTS = [
  "The first anime film, 'Katsudō Shashin', was made in 1907.",
  "Studio Ghibli's name comes from a WWII aircraft.",
  "Dragon Ball's Goku was inspired by Sun Wukong from Journey to the West.",
  "One Piece is the best-selling manga series of all time.",
  "Naruto's hand signs are based on Chinese zodiac animals.",
  "Attack on Titan's creator Hajime Isayama based Titans on drunk people.",
  "The word 'anime' comes from the English word 'animation'.",
  "Sailor Moon was the first magical girl anime to gain worldwide popularity.",
  "Cowboy Bebop was animated in just 6 months — incredibly fast for its quality.",
  "Your Name became the highest-grossing anime film in 2016.",
  "Studio Ghibli almost closed after Princess Mononoke lost money initially.",
  "Akira (1988) took 160,000 production hours and 327 colors in its palette.",
  "Studio Trigger was founded by former Gainax animators.",
  "The longest-running anime is Sazae-san, airing since 1969.",
  "Hayao Miyazaki came out of retirement for The Boy and the Heron.",
];

export interface RandomAnime {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  coverImage: string | null;
  averageScore: number | null;
  totalEpisodes: number;
  genres: string;
  description: string | null;
  externalLinks: string | null;
}

interface RandomPickerClientProps {
  animeList: RandomAnime[];
}

export default function RandomPickerClient({ animeList }: RandomPickerClientProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAnime, setCurrentAnime] = useState<RandomAnime | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<RandomAnime | null>(null);
  const [fact, setFact] = useState("");
  const [spinCount, setSpinCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getRandom = useCallback(() => {
    return animeList[Math.floor(Math.random() * animeList.length)];
  }, [animeList]);

  const pickRandom = useCallback(() => {
    if (isSpinning || animeList.length === 0) return;

    console.log("[RandomPicker] Sound effect placeholder: spin_start");
    setIsSpinning(true);
    setSelectedAnime(null);
    setFact(ANIME_FACTS[Math.floor(Math.random() * ANIME_FACTS.length)]);

    let count = 0;
    const totalSpins = 10 + Math.floor(Math.random() * 6);

    const spin = () => {
      const next = getRandom();
      setCurrentAnime(next);
      count++;
      setSpinCount(count);

      if (count < totalSpins) {
        const delay = 80 + count * 15;
        timerRef.current = setTimeout(spin, delay);
      } else {
        console.log("[RandomPicker] Sound effect placeholder: spin_stop");
        setSelectedAnime(next);
        setIsSpinning(false);
      }
    };

    spin();
  }, [isSpinning, animeList.length, getRandom]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const displayAnime = selectedAnime || currentAnime;
  const genres: string[] = displayAnime ? JSON.parse(displayAnime.genres || "[]") : [];
  const streamingLinks = displayAnime
    ? getStreamingLinks({
        title: displayAnime.title,
        titleEnglish: displayAnime.titleEnglish,
        slug: displayAnime.slug,
        externalLinks: displayAnime.externalLinks,
      })
    : [];

  return (
    <div className="flex flex-col items-center">
      {/* Slot Machine Display */}
      <div className="relative w-full max-w-md mb-8">
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 aspect-[3/4]">
          {displayAnime ? (
            <>
              {displayAnime.coverImage ? (
                <Image
                  src={displayAnime.coverImage}
                  alt={displayAnime.titleEnglish || displayAnime.title}
                  fill
                  className={`object-cover transition-all duration-300 ${
                    isSpinning ? "blur-sm scale-105 brightness-75" : "blur-0 scale-100"
                  }`}
                  sizes="(max-width: 768px) 80vw, 448px"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Spinning spinner */}
              {isSpinning && (
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {!isSpinning && (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {displayAnime.titleEnglish || displayAnime.title}
                    </h2>

                    {displayAnime.averageScore && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-brand-orange/90 text-white">
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {(displayAnime.averageScore / 10).toFixed(1)}
                        </span>
                        {displayAnime.totalEpisodes > 0 && (
                          <span className="text-xs text-white/70">
                            {displayAnime.totalEpisodes} episodes
                          </span>
                        )}
                      </div>
                    )}

                    {genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {genres.slice(0, 4).map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/80 backdrop-blur-sm"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {displayAnime.description && (
                      <p className="text-sm text-white/70 line-clamp-3 mb-3 leading-relaxed">
                        {displayAnime.description}
                      </p>
                    )}

                    {/* Streaming Links */}
                    <div className="flex flex-wrap gap-2">
                      {streamingLinks.slice(0, 4).map((link) => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${link.gradient} hover:scale-105 active:scale-95 transition-transform`}
                        >
                          Watch on {link.name}
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
              <span className="text-6xl mb-4">🎰</span>
              <p className="text-muted-foreground text-lg font-medium">
                Ready to discover something new?
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fun Fact during spin */}
      {isSpinning && fact && (
        <div className="mb-6 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl text-center max-w-md">
          <p className="text-sm text-primary font-medium">
            💡 Fun Fact: {fact}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={pickRandom}
          disabled={isSpinning || animeList.length === 0}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange text-white font-bold text-lg hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Spinning...
            </span>
          ) : selectedAnime ? (
            "Pick Another"
          ) : (
            "Pick Random"
          )}
        </button>
      </div>

      {/* Spin Counter */}
      {isSpinning && (
        <p className="mt-3 text-xs text-muted-foreground/60">
          Shuffling through {spinCount} anime...
        </p>
      )}
    </div>
  );
}
