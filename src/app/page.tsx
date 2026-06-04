import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import AdBanner from "@/components/AdBanner";
import LoadMore from "@/components/LoadMore";
import FillerCarousel from "@/components/FillerCarousel";
import AiringTimeDisplay from "@/components/AiringTimeDisplay";
import { fetchTodaySchedule, AiringEntry } from "@/lib/calendar";

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    images: [{ url: '/api/og?title=AniYume&subtitle=Anime+Filler+Lists,+Watch+Orders+%26+Episode+Guides' }],
  },
};

export default async function HomePage() {
  let popularAnime: Awaited<ReturnType<typeof prisma.anime.findMany>> = [];
  let fillerAnime: { id: number; title: string; titleEnglish: string | null; slug: string; coverImage: string | null; totalEpisodes: number; fillerPercent: number }[] = [];
  let recentAnime: Awaited<ReturnType<typeof prisma.anime.findMany>> = [];
  let totalAnime = 0;
  let todayAiring: AiringEntry[] = [];

  try {
    popularAnime = await prisma.anime.findMany({
      orderBy: { popularity: "desc" },
      take: 20,
    });

    const fillerRaw = await prisma.anime.findMany({
      where: { fillerMapping: { isNot: null } },
      include: { fillerMapping: { select: { fillerPercent: true } } },
      orderBy: { popularity: "desc" },
    });

    fillerAnime = fillerRaw.map((anime) => ({
      id: anime.id,
      title: anime.title,
      titleEnglish: anime.titleEnglish,
      slug: anime.slug,
      coverImage: anime.coverImage,
      totalEpisodes: anime.totalEpisodes,
      fillerPercent: anime.fillerMapping?.fillerPercent || 0,
    }));

    recentAnime = await prisma.anime.findMany({
      where: { seasonYear: { gte: 2023 } },
      orderBy: [{ seasonYear: "desc" }, { popularity: "desc" }],
      take: 10,
    });

    totalAnime = await prisma.anime.count();
  } catch {
    // Database unavailable - render with empty data
  }

  try {
    const airingData = await fetchTodaySchedule();
    // Sort by airing time and take next 5
    const now = Math.floor(Date.now() / 1000);
    todayAiring = airingData
      .sort((a, b) => a.airingAt - b.airingAt)
      .filter((entry) => entry.airingAt >= now - 7200) // Include recently aired (last 2h)
      .slice(0, 5);
  } catch {
    // AniList unavailable - skip section
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      {/* Hero Section */}
      <section className="relative text-center mb-16 py-12 rounded-xl overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand-orange/5 rounded-xl" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-brand-teal">Ani</span><span className="text-brand-orange">Yume</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Your ultimate resource for anime filler guides, watch orders, and
            episode lists. Skip the filler, watch what matters.
          </p>
          <p className="text-sm text-muted-foreground/60">
            Showing {totalAnime} anime in our database
          </p>
        </div>
      </section>

      {/* Currently Airing Today */}
      {todayAiring.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-primary rounded-full mr-3" />
              <h2 className="text-2xl font-bold text-foreground">Currently Airing</h2>
            </div>
            <Link
              href="/calendar"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View full calendar &rarr;
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {todayAiring.map((entry, idx) => (
              <div
                key={`${entry.media.id}-${entry.episode}-${idx}`}
                className="flex-shrink-0 w-64 bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="relative h-40 w-full">
                  {entry.media.coverImage?.large ? (
                    <Image
                      src={entry.media.coverImage.large}
                      alt={entry.media.title.english || entry.media.title.romaji}
                      width={256}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-xs text-primary font-medium">
                      Ep {entry.episode}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-base font-medium text-foreground truncate">
                    {entry.media.title.english || entry.media.title.romaji}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    <AiringTimeDisplay airingAt={entry.airingAt} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AdBanner className="mb-8" format="horizontal" />

      {/* Popular Filler Guides */}
      {fillerAnime.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-brand-orange rounded-full mr-3" />
            <h2 className="text-2xl font-bold text-foreground">
              Popular Filler Guides
            </h2>
            <span className="ml-3 text-sm text-muted-foreground">
              {fillerAnime.length} guides
            </span>
          </div>
          <FillerCarousel items={fillerAnime} />
        </section>
      )}

      {/* Most Popular Anime */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-primary rounded-full mr-3" />
          <h2 className="text-2xl font-bold text-foreground">Most Popular Anime</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularAnime.map((anime, idx) => (
            <AnimeCard
              key={anime.id}
              title={anime.title}
              titleEnglish={anime.titleEnglish}
              slug={anime.slug}
              coverImage={anime.coverImage}
              genres={JSON.parse(anime.genres || "[]")}
              totalEpisodes={anime.totalEpisodes}
              averageScore={anime.averageScore}
              status={anime.status}
              seasonYear={anime.seasonYear}
              index={idx}
            />
          ))}
        </div>
        <div className="mt-8">
          <LoadMore initialCount={20} total={totalAnime} sort="popularity" />
        </div>
      </section>

      <AdBanner className="mb-8" format="horizontal" />

      {/* Recent Anime */}
      {recentAnime.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-brand-orange rounded-full mr-3" />
            <h2 className="text-2xl font-bold text-foreground">Recent Anime</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentAnime.map((anime, idx) => (
              <AnimeCard
                key={anime.id}
                title={anime.title}
                titleEnglish={anime.titleEnglish}
                slug={anime.slug}
                coverImage={anime.coverImage}
                genres={JSON.parse(anime.genres || "[]")}
                totalEpisodes={anime.totalEpisodes}
                averageScore={anime.averageScore}
                status={anime.status}
                seasonYear={anime.seasonYear}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {/* SEO Internal Links - Genre Browse */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-primary rounded-full mr-3" />
          <h2 className="text-2xl font-bold text-foreground">
            Browse Anime Guides
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/genre/action"
            className="bg-card border border-border p-4 rounded-xl text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-2xl block mb-2">⚔️</span>
            <span className="text-foreground font-medium">Action Anime</span>
          </Link>
          <Link
            href="/genre/romance"
            className="bg-card border border-border p-4 rounded-xl text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-2xl block mb-2">💕</span>
            <span className="text-foreground font-medium">Romance Anime</span>
          </Link>
          <Link
            href="/genre/fantasy"
            className="bg-card border border-border p-4 rounded-xl text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-2xl block mb-2">🧙</span>
            <span className="text-foreground font-medium">Fantasy Anime</span>
          </Link>
          <Link
            href="/genre/comedy"
            className="bg-card border border-border p-4 rounded-xl text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-2xl block mb-2">😂</span>
            <span className="text-foreground font-medium">Comedy Anime</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
