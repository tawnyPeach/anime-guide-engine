import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aniyume.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/calendar`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  let allAnime: { slug: string; updatedAt: Date; fillerMapping: { id: number } | null; watchOrder: { id: number } | null; totalEpisodes: number; studios: string | null }[] = [];
  try {
    allAnime = await prisma.anime.findMany({
      select: {
        slug: true,
        updatedAt: true,
        fillerMapping: { select: { id: true } },
        watchOrder: { select: { id: true } },
        totalEpisodes: true,
        studios: true,
      },
      orderBy: { popularity: "desc" },
    });
  } catch {
    return staticPages;
  }

  // Anime pages
  const animePages: MetadataRoute.Sitemap = allAnime.map((anime) => ({
    url: `${SITE_URL}/anime/${anime.slug}`,
    lastModified: anime.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Filler list pages
  const fillerPages: MetadataRoute.Sitemap = allAnime
    .filter((a) => a.fillerMapping)
    .map((anime) => ({
      url: `${SITE_URL}/anime/${anime.slug}/filler-list`,
      lastModified: anime.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  // Episode guide pages
  const episodePages: MetadataRoute.Sitemap = allAnime
    .filter((a) => a.totalEpisodes > 0)
    .map((anime) => ({
      url: `${SITE_URL}/anime/${anime.slug}/episodes`,
      lastModified: anime.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Watch order pages
  const watchOrderPages: MetadataRoute.Sitemap = allAnime
    .filter((a) => a.watchOrder)
    .map((anime) => ({
      url: `${SITE_URL}/anime/${anime.slug}/watch-order`,
      lastModified: anime.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  // Anime-like pages
  const animeLikePages: MetadataRoute.Sitemap = allAnime
    .slice(0, 100)
    .map((anime) => ({
      url: `${SITE_URL}/anime-like/${anime.slug}`,
      lastModified: anime.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Genre pages
  const genres = [
    "action", "adventure", "comedy", "drama", "fantasy",
    "horror", "mystery", "romance", "sci-fi", "thriller",
    "sports", "supernatural", "slice-of-life", "mecha",
  ];
  const genrePages: MetadataRoute.Sitemap = genres.map((genre) => ({
    url: `${SITE_URL}/genre/${genre}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Year pages
  const currentYear = new Date().getFullYear();
  const yearPages: MetadataRoute.Sitemap = Array.from(
    { length: 25 },
    (_, i) => ({
      url: `${SITE_URL}/year/${currentYear - i}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  );

  // Studio pages
  const studioSet = new Set<string>();
  for (const anime of allAnime) {
    try {
      const studios: string[] = JSON.parse(anime.studios || "[]");
      studios.forEach((s) => studioSet.add(s));
    } catch {
      // skip
    }
  }
  const studioPages: MetadataRoute.Sitemap = Array.from(studioSet)
    .slice(0, 50)
    .map((studio) => ({
      url: `${SITE_URL}/studio/${studio.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Season pages
  const seasons = ["winter", "spring", "summer", "fall"];
  const seasonPages: MetadataRoute.Sitemap = [];
  for (let y = currentYear; y >= currentYear - 2; y--) {
    for (const s of seasons) {
      seasonPages.push({
        url: `${SITE_URL}/season/${s}-${y}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }
  }

  // Top pages
  const topPages: MetadataRoute.Sitemap = [
    "highest-rated",
    "most-popular",
    "longest-running",
    "currently-airing",
    "most-filler",
    "least-filler",
  ].map((type) => ({
    url: `${SITE_URL}/top/${type}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Compare pages (top 20 anime paired)
  const comparePages: MetadataRoute.Sitemap = [];
  const topForCompare = allAnime.slice(0, 20);
  for (let i = 0; i < topForCompare.length - 1 && comparePages.length < 30; i++) {
    const next = topForCompare[i + 1];
    if (next) {
      comparePages.push({
        url: `${SITE_URL}/compare/${topForCompare[i].slug}-vs-${next.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      });
    }
  }

  // After pages (What to Watch After) - anime with at least one relation
  let afterPages: MetadataRoute.Sitemap = [];
  try {
    const animeWithRelations = await prisma.anime.findMany({
      where: {
        OR: [
          { relationsFrom: { some: {} } },
          { relationsTo: { some: {} } },
        ],
      },
      select: { slug: true, updatedAt: true },
      orderBy: { popularity: "desc" },
      take: 200,
    });
    afterPages = animeWithRelations.map((anime) => ({
      url: `${SITE_URL}/after/${anime.slug}`,
      lastModified: anime.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // skip if query fails
  }

  return [
    ...staticPages,
    ...animePages,
    ...fillerPages,
    ...episodePages,
    ...watchOrderPages,
    ...animeLikePages,
    ...genrePages,
    ...yearPages,
    ...studioPages,
    ...seasonPages,
    ...topPages,
    ...comparePages,
    ...afterPages,
  ];
}
