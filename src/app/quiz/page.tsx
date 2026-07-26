import { Metadata } from "next";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Which Anime Character Are You? | Fun Personality Quiz",
  description:
    "Discover which iconic anime character matches your personality! Take our fun quiz featuring Naruto, Luffy, Goku, Light Yagami, Gojo, and more legendary characters.",
  keywords: [
    "anime quiz",
    "which anime character are you",
    "anime personality quiz",
    "anime character match",
    "naruto quiz",
    "anime trivia",
  ],
  openGraph: {
    title: "Which Anime Character Are You? ",
    description:
      "Answer 10 personality questions and find out which legendary anime character matches your vibe!",
    images: [
      {
        url: "/api/og?title=Which+Anime+Character+Are+You%3F&subtitle=Take+the+Quiz+at+AniYume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Which Anime Character Are You? ",
    description:
      "Take our anime personality quiz and discover your match!",
  },
};

export default function QuizPage() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <QuizClient />
    </div>
  );
}
