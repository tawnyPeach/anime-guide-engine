import Link from "next/link";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import AdBanner from "@/components/AdBanner";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const popularAnime = await prisma.anime.findMany({
    orderBy: { popularity: "desc" },
    take: 20,
  });

  const fillerAnime = await prisma.anime.findMany({
    where: { fillerMapping: { isNot: null } },
    include: { fillerMapping: true },
    orderBy: { popularity: "desc" },
    take: 10,
  });

  const recentAnime = await prisma.anime.findMany({
    where: { seasonYear: { gte: 2023 } },
    orderBy: [{ seasonYear: "desc" }, { popularity: "desc" }],
    take: 10,
  });

  const totalAnime = await prisma.anime.count();

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

      <AdBanner className="mb-8" format="horizontal" />

      {/* Popular Filler Guides */}
      {fillerAnime.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-3" />
            <h2 className="text-2xl font-bold gradient-text">
              Popular Filler Guides
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fillerAnime.map((anime) => {
              const fillerPercent = anime.fillerMapping?.fillerPercent || 0;
              return (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.slug}/filler-list`}
                  className="bg-anime-card rounded-xl p-4 border border-anime-border hover:border-purple-700/50 hover:glow-card-hover transition-all duration-300"
                >
                  <h3 className="text-white font-semibold mb-2">
                    {anime.titleEnglish || anime.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {anime.totalEpisodes} episodes
                    </span>
                    <span
                      className={`font-bold ${
                        fillerPercent > 30
                          ? "text-red-400"
                          : fillerPercent > 15
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {Math.round(fillerPercent)}% filler
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-full rounded-full"
                      style={{ width: `${fillerPercent}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
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
