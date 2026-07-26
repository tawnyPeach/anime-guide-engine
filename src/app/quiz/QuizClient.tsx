"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  questions,
  characters,
  type CharacterResult,
  type Trait,
} from "@/lib/quiz-data";

type Screen = "intro" | "quiz" | "result";

export default function QuizClient() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [scoreTransition, setScoreTransition] = useState(false);
  const [result, setResult] = useState<CharacterResult | null>(null);
  const [copied, setCopied] = useState(false);

  const progress = (current / questions.length) * 100;

  const calculateResult = useCallback(
    (allAnswers: number[]) => {
      const totals: Partial<Record<Trait, number>> = {};

      allAnswers.forEach((answerIdx, qIdx) => {
        const answer = questions[qIdx].answers[answerIdx];
        Object.entries(answer.traits).forEach(([trait, score]) => {
          totals[trait as Trait] = (totals[trait as Trait] || 0) + score;
        });
      });

      let best = characters[0];
      let bestScore = -1;

      characters.forEach((char) => {
        let score = 0;
        Object.entries(char.traits).forEach(([trait, weight]) => {
          score += (totals[trait as Trait] || 0) * weight;
        });
        if (score > bestScore) {
          bestScore = score;
          best = char;
        }
      });

      return best;
    },
    [],
  );

  const handleStart = () => {
    setScreen("quiz");
    setCurrent(0);
    setAnswers([]);
    setResult(null);
  };

  const handleAnswer = (answerIdx: number) => {
    const newAnswers = [...answers, answerIdx];
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setScoreTransition(true);
      setTimeout(() => {
        setCurrent((prev) => prev + 1);
        setScoreTransition(false);
      }, 300);
    } else {
      const finalResult = calculateResult(newAnswers);
      setResult(finalResult);
      setScreen("result");
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `I'm ${result.name} from ${result.anime}! ${result.description} — Find out which anime character you are at AniYume! https://aniyume.net/quiz`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const traitScores = useMemo(() => {
    if (!result) return [];
    const totals: Partial<Record<Trait, number>> = {};
    answers.forEach((answerIdx, qIdx) => {
      const answer = questions[qIdx].answers[answerIdx];
      Object.entries(answer.traits).forEach(([trait, score]) => {
        totals[trait as Trait] = (totals[trait as Trait] || 0) + score;
      });
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([trait, score]) => ({ trait: trait as Trait, score }));
  }, [result, answers]);

  if (screen === "intro") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="text-6xl mb-6">🎌</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-brand-teal">Which</span>{" "}
            <span className="text-brand-orange">Anime Character</span>{" "}
            <span className="text-foreground">Are You?</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-3">
            Answer {questions.length} fun personality questions and discover
            which iconic anime character matches your vibe!
          </p>
          <p className="text-muted-foreground/60 text-sm mb-8">
            Featuring 20 legendary characters from Naruto to Attack on Titan
          </p>
          <button
            onClick={handleStart}
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-brand-teal to-brand-orange text-white font-bold text-lg px-10 py-4 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg hover:shadow-xl"
          >
            Start the Quiz
            <span className="text-xl">⚡</span>
          </button>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground/60">
            <span className="bg-muted/60 px-3 py-1 rounded-full">
              ⏱ ~2 minutes
            </span>
            <span className="bg-muted/60 px-3 py-1 rounded-full">
              📊 {questions.length} questions
            </span>
            <span className="bg-muted/60 px-3 py-1 rounded-full">
              🏆 {characters.length} characters
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "result" && result) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full animate-fade-in">
          <div className="text-center mb-8">
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">
              You are...
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative h-48 md:h-56 bg-gradient-to-br from-primary/20 to-brand-orange/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {result.name}
                  </h2>
                  <p className="text-brand-orange font-medium">
                    {result.anime}
                  </p>
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                {Math.round((traitScores[0]?.score || 0) / questions.length * 10)}% match
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-muted-foreground leading-relaxed mb-6">
                {result.description}
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Your Top Traits
                </h3>
                <div className="space-y-2">
                  {traitScores.map(({ trait, score }) => {
                    const maxScore = questions.length * 3;
                    const pct = Math.round((score / maxScore) * 100);
                    return (
                      <div key={trait} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-24 capitalize">
                          {trait}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-teal to-brand-orange rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {result.similarAnime.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                    Similar Anime You&apos;d Love
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.similarAnime.map((anime) => (
                      <Link
                        key={anime.slug}
                        href={`/anime/${anime.slug}`}
                        className="inline-flex items-center gap-1 bg-muted/60 hover:bg-primary/10 border border-border hover:border-primary/30 text-sm text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg transition-all duration-200"
                      >
                        🎬 {anime.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-teal to-brand-orange text-white font-semibold px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                >
                  {copied ? (
                    <>
                      ✓ Copied!
                    </>
                  ) : (
                    <>
                      📋 Share Result
                    </>
                  )}
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {current + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-teal to-brand-orange rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div
          className={`transition-all duration-300 ${
            scoreTransition
              ? "opacity-0 translate-x-8"
              : "opacity-100 translate-x-0"
          }`}
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{q.emoji}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {q.question}
            </h2>
          </div>

          <div className="grid gap-3">
            {q.answers.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="group flex items-center gap-4 bg-card border border-border rounded-xl p-4 md:p-5 text-left hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] transition-all duration-200"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {answer.emoji}
                </span>
                <span className="text-foreground font-medium">
                  {answer.text}
                </span>
                <span className="ml-auto text-muted-foreground/40 group-hover:text-primary transition-colors">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
