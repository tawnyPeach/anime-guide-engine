import prisma from "@/lib/prisma";
import { cached } from "@/lib/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().slice(0, 200) || "";
  const genre = searchParams.get("genre") || "";
  const yearMin = searchParams.get("yearMin") || "";
  const yearMax = searchParams.get("yearMax") || "";
  const scoreMin = searchParams.get("scoreMin") || "";
  const format = searchParams.get("format") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  const skip = (page - 1) * limit;

  const cacheKey = `adv-search:${q}:${genre}:${yearMin}:${yearMax}:${scoreMin}:${format}:${status}:${page}:${limit}`;

  const result = await cached(
    cacheKey,
    async () => {
      const where: Record<string, unknown> = {};
      const conditions: Record<string, unknown>[] = [];

      // Text search
      if (q.length >= 2) {
        conditions.push({
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { titleEnglish: { contains: q, mode: "insensitive" } },
            { titleJapanese: { contains: q, mode: "insensitive" } },
          ],
        });
      }

      // Genre filter
      if (genre) {
        conditions.push({ genres: { contains: genre, mode: "insensitive" } });
      }

      // Year range
      if (yearMin) {
        conditions.push({ seasonYear: { gte: parseInt(yearMin, 10) } });
      }
      if (yearMax) {
        conditions.push({ seasonYear: { lte: parseInt(yearMax, 10) } });
      }

      // Minimum score
      if (scoreMin) {
        conditions.push({ averageScore: { gte: parseFloat(scoreMin) * 10 } });
      }

      // Format filter
      if (format) {
        conditions.push({ format: format });
      }

      // Status filter
      if (status) {
        conditions.push({ status: status });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      const [items, total] = await Promise.all([
        prisma.anime.findMany({
          where,
          orderBy: q.length >= 2 ? { popularity: "desc" } : { popularity: "desc" },
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
            fillerMapping: {
              select: {
                totalFiller: true,
                fillerPercent: true,
              },
            },
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
