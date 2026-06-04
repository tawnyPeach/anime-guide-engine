import prisma from "@/lib/prisma";
import { cached } from "@/lib/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  // Cap query length at 200 characters
  q = q.slice(0, 200);

  const results = await cached(
    `search:${q.toLowerCase()}`,
    async () => {
      // Fetch candidates with case-insensitive matching
      const candidates = await prisma.anime.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { titleEnglish: { contains: q, mode: "insensitive" } },
            { titleJapanese: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { popularity: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          titleEnglish: true,
          titleJapanese: true,
          slug: true,
          coverImage: true,
          genres: true,
          format: true,
          averageScore: true,
          popularity: true,
        },
      });

      // Score results by relevance
      const qLower = q.toLowerCase();
      const scored = candidates.map((anime) => {
        const titleLower = anime.title.toLowerCase();
        const englishLower = (anime.titleEnglish || "").toLowerCase();
        const japaneseLower = (anime.titleJapanese || "").toLowerCase();

        let score = 0;

        // Exact match (highest priority)
        if (
          titleLower === qLower ||
          englishLower === qLower ||
          japaneseLower === qLower
        ) {
          score = 100;
        }
        // Starts with query
        else if (
          titleLower.startsWith(qLower) ||
          englishLower.startsWith(qLower) ||
          japaneseLower.startsWith(qLower)
        ) {
          score = 50;
        }
        // Contains query
        else {
          score = 10;
        }

        // Tie-break by popularity
        const pop = anime.popularity || 0;
        const popBonus = Math.min(pop / 10000, 5);

        return { ...anime, _score: score + popBonus };
      });

      // Sort by relevance score descending, then popularity for ties
      scored.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return (b.popularity || 0) - (a.popularity || 0);
      });

      // Return top 10 without internal scoring fields
      return scored.slice(0, 10).map(({ _score, popularity, titleJapanese, ...rest }) => rest);
    },
    { ttl: 60, staleTtl: 300 }
  );

  return Response.json({ results });
}
