import { Metadata } from "next";
import prisma from "@/lib/prisma";
import TierList from "@/components/TierList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anime Tier List Maker | Rank Your Favorites | AniYume",
  description:
    "Create and share your own anime tier list! Drag and drop popular anime into S, A, B, C, D, and F tiers. Pre-ranked by community score.",
  keywords: ["anime tier list", "tier list maker", "rank anime", "anime ranking", "best anime"],
  openGraph: {
    title: "Anime Tier List Maker | AniYume",
    description: "Create and share your own anime tier list!",
    images: [{ url: "/api/og?title=Anime+Tier+List+Maker&subtitle=Rank+Your+Favorites" }],
  },
};

export default async function TierListPage() {
  let anime: {
    id: number;
    title: string;
    titleEnglish: string | null;
    slug: string;
    coverImage: string | null;
    averageScore: number | null;
  }[] = [];

  try {
    anime = await prisma.anime.findMany({
      select: {
        id: true,
        title: true,
        titleEnglish: true,
        slug: true,
        coverImage: true,
        averageScore: true,
      },
      orderBy: { averageScore: "desc" },
      take: 50,
    });
  } catch {
    // Database unavailable
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          <span className="text-brand-teal">Anime</span> Tier List Maker
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Drag and drop anime between tiers to rank your favorites.
          Pre-sorted by community score — make it your own!
        </p>
      </div>
      <TierList initialAnime={anime} />
    </div>
  );
}
