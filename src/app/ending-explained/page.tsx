import { Metadata } from "next";
import prisma from "@/lib/prisma";
import EndingExplainedCard from "./EndingExplainedCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anime Ending Explained",
  description: "In-depth explanations of anime endings. Understand the plot twists, character arcs, and hidden meanings behind your favorite anime conclusions.",
  alternates: { canonical: "/ending-explained" },
  openGraph: {
    title: "Anime Ending Explained ",
    description: "In-depth explanations of anime endings. Understand plot twists, character arcs, and hidden meanings.",
    images: [{ url: "/api/og?title=Anime+Ending+Explained&subtitle=Understand+Your+Favorite+Anime+Endings" }],
  },
};

export default async function EndingExplainedPage() {
  let completedAnime: Awaited<ReturnType<typeof prisma.anime.findMany>> = [];

  try {
    completedAnime = await prisma.anime.findMany({
      where: { status: "FINISHED" },
      orderBy: { popularity: "desc" },
      take: 48,
    });
  } catch {
    // Database unavailable
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          <span className="text-brand-teal">Ending</span>{" "}
          <span className="text-brand-orange">Explained</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Confused by an anime ending? We break down the plot twists, character decisions, and hidden meanings
          so you can fully appreciate the story&apos;s conclusion.
        </p>
      </div>

      {completedAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {completedAnime.map((anime, idx) => (
            <EndingExplainedCard key={anime.id} anime={anime} index={idx} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-muted-foreground">Ending explanations are coming soon!</p>
        </div>
      )}
    </div>
  );
}
