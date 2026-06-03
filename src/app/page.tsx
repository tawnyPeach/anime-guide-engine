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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Anime Guide Engine
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Your ultimate resource for anime filler guides, watch orders, and
          episode lists. Skip the filler, watch what matters.
        </p>
      </section>

      <AdBanner className="mb-8" format="horizontal" />

      {/* Popular Filler Guides */}
      {fillerAnime.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
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
                  className="bg-gray-800 rounded-lg p-4 hover:ring-2 hover:ring-blue-500 transition-all"
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
                  <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Most Popular Anime</h2>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Anime</h2>
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

      {/* SEO Internal Links */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Browse Anime Guides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/genre/action"
            className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl block mb-2">⚔️</span>
            <span className="text-white font-medium">Action Anime</span>
          </Link>
          <Link
            href="/genre/romance"
            className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl block mb-2">💕</span>
            <span className="text-white font-medium">Romance Anime</span>
          </Link>
          <Link
            href="/genre/fantasy"
            className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl block mb-2">🧙</span>
            <span className="text-white font-medium">Fantasy Anime</span>
          </Link>
          <Link
            href="/genre/comedy"
            className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl block mb-2">😂</span>
            <span className="text-white font-medium">Comedy Anime</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
