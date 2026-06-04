import prisma from "@/lib/prisma";
import { cached } from "@/lib/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "most-popular";
  const page = Math.max(1, Math.min(parseInt(searchParams.get("page") || "1", 10), 500));
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const genre = searchParams.get("genre")?.slice(0, 100) || undefined;
  const yearParam = searchParams.get("year") || undefined;
  const format = searchParams.get("format")?.slice(0, 100) || undefined;
  const sort = searchParams.get("sort") || undefined;

  const skip = (page - 1) * limit;

  const cacheKey = `top:${type}:${page}:${limit}:${genre || ""}:${yearParam || ""}:${format || ""}:${sort || ""}`;

  const result = await cached(
    cacheKey,
    async () => {
      // For filler-related types, query FillerMapping directly
      if (type === "most-filler" || type === "least-filler") {
        return queryFillerType(type, skip, limit, genre, yearParam, format);
      }

      // For standard types, query Anime directly
      return queryAnimeType(type, skip, limit, genre, yearParam, format, sort);
    },
    { ttl: 60, staleTtl: 300 }
  );

  return Response.json(result);
}

async function queryFillerType(
  type: string,
  skip: number,
  limit: number,
  genre?: string,
  yearParam?: string,
  format?: string
) {
  const animeWhere: Record<string, unknown> = {};
  if (genre) animeWhere.genres = { contains: genre };
  if (yearParam) animeWhere.seasonYear = parseInt(yearParam, 10);
  if (format) animeWhere.format = format;

  const fillerWhere: Record<string, unknown> = {
    anime: animeWhere,
  };

  if (type === "least-filler") {
    fillerWhere.fillerPercent = { gt: 0 };
  }

  const orderDirection = type === "most-filler" ? "desc" : "asc";

  const [items, total] = await Promise.all([
    prisma.fillerMapping.findMany({
      where: fillerWhere,
      orderBy: { fillerPercent: orderDirection },
      skip,
      take: limit,
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            slug: true,
            coverImage: true,
            genres: true,
            totalEpisodes: true,
            averageScore: true,
            status: true,
            seasonYear: true,
            format: true,
          },
        },
      },
    }),
    prisma.fillerMapping.count({ where: fillerWhere }),
  ]);

  // Transform to match expected API shape
  const transformedItems = items.map((fm) => ({
    ...fm.anime,
    fillerMapping: {
      totalFiller: fm.totalFiller,
      fillerPercent: fm.fillerPercent,
    },
  }));

  return {
    items: transformedItems,
    total,
    page: Math.floor(skip / limit) + 1,
    hasMore: skip + items.length < total,
  };
}

async function queryAnimeType(
  type: string,
  skip: number,
  limit: number,
  genre?: string,
  yearParam?: string,
  format?: string,
  sort?: string
) {
  const where: Record<string, unknown> = {};
  if (genre) where.genres = { contains: genre };
  if (yearParam) where.seasonYear = parseInt(yearParam, 10);
  if (format) where.format = format;

  // Type-specific filters
  switch (type) {
    case "highest-rated":
      where.averageScore = { not: null };
      break;
    case "currently-airing":
      where.status = "RELEASING";
      break;
    case "longest-running":
      where.totalEpisodes = { gt: 0 };
      break;
  }

  // Determine orderBy
  let orderBy: Record<string, string> | Record<string, string>[];
  if (sort) {
    switch (sort) {
      case "score":
        orderBy = { averageScore: "desc" };
        break;
      case "year":
        orderBy = [{ seasonYear: "desc" }, { popularity: "desc" }];
        break;
      case "episodes":
        orderBy = { totalEpisodes: "desc" };
        break;
      case "popularity":
      default:
        orderBy = { popularity: "desc" };
        break;
    }
  } else {
    // Default order per type
    switch (type) {
      case "highest-rated":
        orderBy = { averageScore: "desc" };
        break;
      case "longest-running":
        orderBy = { totalEpisodes: "desc" };
        break;
      case "currently-airing":
        orderBy = { popularity: "desc" };
        break;
      case "most-popular":
      default:
        orderBy = { popularity: "desc" };
        break;
    }
  }

  const [items, total] = await Promise.all([
    prisma.anime.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        titleEnglish: true,
        slug: true,
        coverImage: true,
        genres: true,
        totalEpisodes: true,
        averageScore: true,
        status: true,
        seasonYear: true,
        format: true,
        fillerMapping: { select: { totalFiller: true, fillerPercent: true } },
      },
    }),
    prisma.anime.count({ where }),
  ]);

  return {
    items,
    total,
    page: Math.floor(skip / limit) + 1,
    hasMore: skip + items.length < total,
  };
}
