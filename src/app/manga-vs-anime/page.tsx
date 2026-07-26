import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import MangaVsAnimeCard from "./MangaVsAnimeCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manga vs Anime - Which Version is Better? | AniYume",
  description:
    "Compare manga and anime versions of popular series. Find out which adaptation is better for story, animation, characters, and pacing.",
  alternates: { canonical: "/manga-vs-anime" },
  openGraph: {
    title: "Manga vs Anime - Which Version is Better?",
    description:
      "Compare manga and anime versions of popular series side by side. Story differences, art quality, pacing, and more.",
    images: [
      {
        url: "/api/og?title=Manga+vs+Anime&subtitle=Which+Version+is+Better%3F&type=manga-vs-anime",
      },
    ],
  },
};

const CATEGORIES = ["Better in Manga", "Better in Anime", "Both are Great", "Major Differences"] as const;

type Category = (typeof CATEGORIES)[number];

function assignCategory(anime: {
  averageScore: number | null;
  popularity: number | null;
  source: string | null;
}): Category {
  if (anime.source === "ORIGINAL") return "Both are Great";
  const score = anime.averageScore || 0;
  if (score >= 80) return "Both are Great";
  if (anime.popularity && anime.popularity > 500000) return "Major Differences";
  if (score >= 70) return "Better in Anime";
  return "Better in Manga";
}

function buildComparisonSummary(anime: {
  title: string;
  titleEnglish: string | null;
  genres: string;
  totalEpisodes: number;
  averageScore: number | null;
  source: string | null;
}): string {
  const name = anime.titleEnglish || anime.title;
  const genres: string[] = JSON.parse(anime.genres || "[]");
  const genreText = genres.length > 0 ? genres.slice(0, 2).join(" and ").toLowerCase() : "storytelling";
  const sourceType = anime.source === "ORIGINAL" ? "original" : "manga-adapted";
  return `${name} is a ${sourceType} ${genreText} series${anime.totalEpisodes ? ` with ${anime.totalEpisodes} episodes` : ""} where the manga and anime each offer unique strengths and differences worth exploring.`;
}

export default async function MangaVsAnimeHubPage() {
  let animeList: Awaited<ReturnType<typeof prisma.anime.findMany>> = [];

  try {
    animeList = await prisma.anime.findMany({
      where: {
        source: { not: "ORIGINAL" },
        popularity: { not: null },
      },
      orderBy: { popularity: "desc" },
      take: 40,
    });
  } catch {
    // Database unavailable
  }

  const items = animeList.map((a, idx) => ({
    id: a.id,
    title: a.title,
    titleEnglish: a.titleEnglish,
    slug: a.slug,
    coverImage: a.coverImage,
    averageScore: a.averageScore,
    category: assignCategory(a),
    description: buildComparisonSummary(a),
    index: idx,
  }));

  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: items.filter((i) => i.category === cat).length,
  }));

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs items={[{ label: "Manga vs Anime" }]} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Manga vs Anime - Which Version is Better?",
            description:
              "Compare manga and anime versions of popular series. Find out which adaptation is better for story, animation, characters, and pacing.",
          }),
        }}
      />

      {/* Hero */}
      <section className="relative text-center mb-12 py-10 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 rounded-xl" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">📖</span>
            <span className="text-muted-foreground text-xl font-light">vs</span>
            <span className="text-3xl">🎬</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-blue-400">Manga</span>{" "}
            <span className="text-muted-foreground">vs</span>{" "}
            <span className="text-orange-400">Anime</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Which version should you experience? Compare manga and anime adaptations side by side across story, art, pacing, and more.
          </p>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="mb-8 flex flex-wrap gap-3 justify-center">
        <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          All ({items.length})
        </div>
        {categoryCounts.map((cat) => (
          <div
            key={cat.name}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              cat.count > 0
                ? "bg-card border-border text-foreground hover:border-primary/40 transition-colors cursor-default"
                : "bg-muted/30 border-border/50 text-muted-foreground/50"
            }`}
          >
            {cat.name} ({cat.count})
          </div>
        ))}
      </section>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <MangaVsAnimeCard
              key={item.id}
              title={item.title}
              titleEnglish={item.titleEnglish}
              slug={item.slug}
              coverImage={item.coverImage}
              averageScore={item.averageScore}
              category={item.category}
              description={item.description}
              index={item.index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No comparisons available yet. Check back soon!</p>
        </div>
      )}

      {/* SEO Internal Links */}
      <section className="mt-16 mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Explore Manga vs Anime Comparisons
        </h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground leading-relaxed mb-4">
            When a popular manga gets adapted into an anime, fans always wonder: <strong className="text-foreground">which version is better?</strong> Our manga vs anime comparison guides break down every aspect — from story fidelity and art quality to pacing, filler content, character development, and the overall experience.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Some anime transcend their source material with breathtaking animation and stellar soundtracks, while others struggle to capture the nuance and depth of the original manga panels. Our guides help you decide where to start and what to expect from each version.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Browse our {items.length} manga vs anime comparisons above, or visit individual anime pages for filler guides, watch orders, and episode lists. Whether you prefer reading the manga first or watching the anime, we have you covered.
          </p>
        </div>
      </section>
    </div>
  );
}
