import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const genre = searchParams.get("genre") || undefined;
  const yearParam = searchParams.get("year") || undefined;
  const sort = searchParams.get("sort") || "popularity";

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (genre) {
    where.genres = { contains: genre };
  }
  if (yearParam) {
    where.seasonYear = parseInt(yearParam, 10);
  }

  // Build orderBy based on sort
  let orderBy: Record<string, string> | Record<string, string>[];
  switch (sort) {
    case "score":
      orderBy = { averageScore: "desc" };
      break;
    case "recent":
      orderBy = [{ seasonYear: "desc" }, { popularity: "desc" }];
      break;
    case "popularity":
    default:
      orderBy = { popularity: "desc" };
      break;
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
      },
    }),
    prisma.anime.count({ where }),
  ]);

  return Response.json({
    items,
    total,
    page,
    hasMore: skip + items.length < total,
  });
}
