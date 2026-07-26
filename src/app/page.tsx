import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import AdBanner from "@/components/AdBanner";
import LoadMore from "@/components/LoadMore";
import FillerCarousel from "@/components/FillerCarousel";
import AiringTimeDisplay from "@/components/AiringTimeDisplay";
import TrackerWidget from "@/components/TrackerWidget";
import RecentReviewsWidget from "@/components/RecentReviewsWidget";
import { fetchTodaySchedule, AiringEntry } from "@/lib/calendar";

export const dynamic = "force-dynamic";

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
      include: { fillerMapping: { select: { fillerPercent: true, fillerEpisodes: true, mixedEpisodes: true } } },
      orderBy: { popularity: "desc" },
    });

    fillerAnime = fillerRaw.map((anime) => {
      let episodeCount = anime.totalEpisodes;
      if (episodeCount === 0 && anime.fillerMapping) {
        const filler: number[] = JSON.parse(anime.fillerMapping.fillerEpisodes || '[]');
        const mixed: number[] = JSON.parse(anime.fillerMapping.mixedEpisodes || '[]');
        const allEps = [...filler, ...mixed];
        episodeCount = allEps.length > 0 ? Math.max(...allEps) : 0;
      }
      return {
        id: anime.id,
        title: anime.title,
        titleEnglish: anime.titleEnglish,
        slug: anime.slug,
        coverImage: anime.coverImage,
        totalEpisodes: episodeCount,
        fillerPercent: anime.fillerMapping?.fillerPercent || 0,
      };
    });

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
    // eslint-disable-next-line react-hooks/purity -- Date.now is deterministic per server-render request
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

      {/* Tracker Widget */}
      <TrackerWidget />

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

      {/* Quiz Promotion */}
      <section className="mb-12">
        <div className="relative bg-gradient-to-br from-primary/10 via-brand-orange/5 to-transparent border border-border rounded-2xl p-6 md:p-10 text-center overflow-hidden">
          <div className="absolute top-0 left-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="text-4xl mb-3">🎮</div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Not Sure What to Watch?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-5">
              Take our fun personality quiz and discover which legendary anime
              character matches your vibe — we&apos;ll suggest similar shows
              you&apos;ll love!
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-teal to-brand-orange text-white font-bold px-8 py-3 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg"
            >
              Take the Quiz
              <span className="text-xl">⚡</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Tier List & Random Picker Promo */}
      <section className="mb-12 grid md:grid-cols-2 gap-6">
        {/* Tier List Promo */}
        <div className="relative bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent border border-border rounded-2xl p-6 md:p-8 text-center overflow-hidden group hover:border-red-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="text-4xl mb-3">🏆</div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Anime Tier List
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              Rank your favorite anime from S to F tier. Drag and drop to create your ultimate tier list!
            </p>
            <Link
              href="/tier-list"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg"
            >
              Make a Tier List
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>

        {/* Random Picker Promo */}
        <div className="relative bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-border rounded-2xl p-6 md:p-8 text-center overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="text-4xl mb-3">🎰</div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Surprise Me!
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              Can&apos;t decide? Spin the slot machine and discover a random anime you might love!
            </p>
            <Link
              href="/random"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg"
            >
              Pick for Me
              <span className="text-lg">🎲</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Manga vs Anime Promo */}
      <section className="mb-12">
        <div className="relative bg-gradient-to-br from-blue-500/10 via-orange-500/5 to-transparent border border-border rounded-2xl p-6 md:p-10 text-center overflow-hidden">
          <div className="absolute top-0 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-3xl">📖</span>
              <span className="text-muted-foreground text-lg font-light">vs</span>
              <span className="text-3xl">🎬</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Manga vs Anime
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-5">
              Which version is better? Compare manga and anime adaptations side by side — story differences, animation quality, pacing, and our verdict.
            </p>
            <Link
              href="/manga-vs-anime"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg"
            >
              Explore Comparisons
              <span className="text-xl">⚡</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Compare & Quotes Promo */}
      <section className="mb-12 grid md:grid-cols-2 gap-6">
        {/* Compare Anime Promo */}
        <div className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-border rounded-2xl p-6 md:p-8 text-center overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="text-4xl mb-3">⚔️</div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Compare Anime
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              Pit two anime head-to-head. Compare scores, genres, episodes, studios and see which comes out on top!
            </p>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg"
            >
              Start Comparing
              <span className="text-lg">⚡</span>
            </Link>
          </div>
        </div>

        {/* Anime Quotes Promo */}
        <div className="relative bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-border rounded-2xl p-6 md:p-8 text-center overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="text-4xl mb-3">💬</div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Anime Quotes
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
              Iconic lines from legendary anime. Browse, filter, and share your favorite quotes from Naruto, One Piece, Death Note, and more!
            </p>
            <Link
              href="/quotes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg"
            >
              Explore Quotes
              <span className="text-lg">✨</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Reviews */}
      <RecentReviewsWidget />

      {/* Ending Explained Promo */}
      <section className="mb-12">
        <div className="relative bg-gradient-to-br from-brand-orange/10 via-red-500/5 to-transparent border border-border rounded-2xl p-6 md:p-10 text-center overflow-hidden">
          <div className="absolute top-0 right-1/4 w-24 h-24 bg-brand-orange/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="text-4xl mb-3">📖</div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Ending Explained
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-5">
              Confused by an anime ending? We break down the plot twists, character arcs, and
              hidden meanings so you can fully appreciate the story&apos;s conclusion.
            </p>
            <Link
              href="/ending-explained"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-orange to-red-500 text-white font-bold px-8 py-3 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg"
            >
              Explore Endings
              <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

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
