import prisma from "@/lib/prisma";
import { cached } from "@/lib/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") || "";
  const subGenre = searchParams.get("subGenre") || undefined;
  const yearMin = searchParams.get("yearMin")
    ? parseInt(searchParams.get("yearMin")!, 10)
    : undefined;
  const yearMax = searchParams.get("yearMax")
    ? parseInt(searchParams.get("yearMax")!, 10)
    : undefined;
  const scoreMin = searchParams.get("scoreMin")
    ? parseInt(searchParams.get("scoreMin")!, 10)
    : undefined;
  const format = searchParams.get("format") || undefined;
  const sort = searchParams.get("sort") || "popularity";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {};

  // Main genre filter - must contain the genre
  if (genre) {
    where.genres = { contains: genre };
  }

  // Sub-genre filter - must also contain the sub-genre
  // Since genres is a JSON string, we add an AND condition
  if (subGenre) {
    where.AND = [
      { genres: { contains: genre } },
      { genres: { contains: subGenre } },
    ];
    // Remove the top-level genres filter since it's in AND now
    delete where.genres;
  }

  // Year range filter
  if (yearMin || yearMax) {
    const yearFilter: Record<string, number> = {};
    if (yearMin) yearFilter.gte = yearMin;
    if (yearMax) yearFilter.lte = yearMax;
    where.seasonYear = yearFilter;
  }

  // Score filter
  if (scoreMin) {
    where.averageScore = { gte: scoreMin };
  }

  // Format filter
  if (format) {
    where.format = format;
  }

  // Build orderBy
  let orderBy: Record<string, string> | Record<string, string>[];
  switch (sort) {
    case "score":
      orderBy = { averageScore: "desc" };
      break;
    case "year":
      orderBy = [{ seasonYear: "desc" }, { popularity: "desc" }];
      break;
    case "popularity":
    default:
      orderBy = { popularity: "desc" };
      break;
  }

  const cacheKey = `genre-filter:${genre}:${subGenre || ""}:${yearMin || ""}:${yearMax || ""}:${scoreMin || ""}:${format || ""}:${sort}:${page}:${limit}`;

  const result = await cached(
    cacheKey,
    async () => {
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
          },
        }),
        prisma.anime.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        hasMore: skip + items.length < total,
      };
    },
    { ttl: 60, staleTtl: 300 }
  );

  return Response.json(result);
}
