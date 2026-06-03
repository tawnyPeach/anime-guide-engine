import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://animeguideengine.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allAnime = await prisma.anime.findMany({
    select: {
      slug: true,
      updatedAt: true,
      fillerMapping: { select: { id: true } },
      watchOrder: { select: { id: true } },
      totalEpisodes: true,
    },
    orderBy: { popularity: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

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

  return [
    ...staticPages,
    ...animePages,
    ...fillerPages,
    ...episodePages,
    ...watchOrderPages,
    ...animeLikePages,
    ...genrePages,
    ...yearPages,
  ];
}
