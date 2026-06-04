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
    images: [{ url: '/api/og?title=Anime+Guide+Engine&subtitle=Filler+Lists,+Watch+Orders+%26+Episode+Guides' }],
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="relative text-center mb-16 py-12 rounded-2xl overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 hero-gradient rounded-2xl" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
            Anime Guide Engine
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Your ultimate resource for anime filler guides, watch orders, and
            episode lists. Skip the filler, watch what matters.
          </p>
          <p className="text-sm text-gray-500">
            Showing {totalAnime} anime in our database
          </p>
        </div>
      </section>

      {/* Currently Airing Today */}
      {todayAiring.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full mr-3" />
              <h2 className="text-2xl font-bold gradient-text">Currently Airing</h2>
            </div>
            <Link
              href="/calendar"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View full calendar &rarr;
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {todayAiring.map((entry, idx) => (
              <div
                key={`${entry.media.id}-${entry.episode}-${idx}`}
                className="flex-shrink-0 w-56 bg-anime-card border border-anime-border rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="relative h-32 w-full">
                  {entry.media.coverImage?.large ? (
                    <Image
                      src={entry.media.coverImage.large}
                      alt={entry.media.title.english || entry.media.title.romaji}
                      width={224}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-600">No image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-xs text-emerald-400 font-medium">
                      Ep {entry.episode}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white truncate">
                    {entry.media.title.english || entry.media.title.romaji}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
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
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-3" />
            <h2 className="text-2xl font-bold gradient-text">
              Popular Filler Guides
            </h2>
            <span className="ml-3 text-sm text-gray-400">
              {fillerAnime.length} guides
            </span>
          </div>
          <FillerCarousel items={fillerAnime} />
        </section>
      )}

      {/* Most Popular Anime */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3" />
          <h2 className="text-2xl font-bold gradient-text-alt">Most Popular Anime</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularAnime.map((anime) => (
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
            <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full mr-3" />
            <h2 className="text-2xl font-bold gradient-text">Recent Anime</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentAnime.map((anime) => (
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
              />
            ))}
          </div>
        </section>
      )}

      {/* SEO Internal Links - Genre Browse */}
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full mr-3" />
          <h2 className="text-2xl font-bold gradient-text-alt">
            Browse Anime Guides
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/genre/action"
            className="bg-gradient-to-br from-red-900/30 to-anime-card border border-red-800/30 p-4 rounded-xl text-center hover:border-red-600/50 hover:glow-card-hover transition-all duration-300"
          >
            <span className="text-2xl block mb-2">⚔️</span>
            <span className="text-white font-medium">Action Anime</span>
          </Link>
          <Link
            href="/genre/romance"
            className="bg-gradient-to-br from-pink-900/30 to-anime-card border border-pink-800/30 p-4 rounded-xl text-center hover:border-pink-600/50 hover:glow-card-hover transition-all duration-300"
          >
            <span className="text-2xl block mb-2">💕</span>
            <span className="text-white font-medium">Romance Anime</span>
          </Link>
          <Link
            href="/genre/fantasy"
            className="bg-gradient-to-br from-purple-900/30 to-anime-card border border-purple-800/30 p-4 rounded-xl text-center hover:border-purple-600/50 hover:glow-card-hover transition-all duration-300"
          >
            <span className="text-2xl block mb-2">🧙</span>
            <span className="text-white font-medium">Fantasy Anime</span>
          </Link>
          <Link
            href="/genre/comedy"
            className="bg-gradient-to-br from-yellow-900/30 to-anime-card border border-yellow-800/30 p-4 rounded-xl text-center hover:border-yellow-600/50 hover:glow-card-hover transition-all duration-300"
          >
            <span className="text-2xl block mb-2">😂</span>
            <span className="text-white font-medium">Comedy Anime</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
