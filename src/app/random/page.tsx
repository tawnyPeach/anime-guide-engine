import { Metadata } from "next";
import prisma from "@/lib/prisma";
import RandomPickerClient from "./RandomPickerClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Random Anime Picker - Discover Something New | AniYume",
  description:
    "Can't decide what to watch? Let fate choose! Spin the slot machine and discover a random anime from our curated database of 1000+ titles.",
  keywords: ["random anime", "anime picker", "what to watch", "anime recommendation", "surprise me"],
  openGraph: {
    title: "Random Anime Picker - Discover Something New | AniYume",
    description: "Can't decide what to watch? Let fate choose with our anime slot machine!",
    images: [{ url: "/api/og?title=Random+Anime+Picker&subtitle=Discover+Something+New" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Anime Picker | AniYume",
    description: "Spin the wheel and discover your next favorite anime!",
  },
};

export default async function RandomPage() {
  let animeList: {
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
  }[] = [];

  try {
    animeList = await prisma.anime.findMany({
      where: {
        coverImage: { not: null },
        averageScore: { not: null },
      },
      select: {
        id: true,
        title: true,
        titleEnglish: true,
        slug: true,
        coverImage: true,
        averageScore: true,
        totalEpisodes: true,
        genres: true,
        description: true,
        externalLinks: true,
      },
      orderBy: { popularity: "desc" },
      take: 500,
    });
  } catch {
    // Database unavailable
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          🎰 Random Anime Picker
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Can&apos;t decide what to watch? Let fate choose for you!
          Spin the slot machine and discover something new.
        </p>
      </div>
      <RandomPickerClient animeList={animeList} />
    </div>
  );
}
