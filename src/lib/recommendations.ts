import prisma from "@/lib/prisma";

interface RecommendationResult {
  anime: {
    id: number;
    title: string;
    titleEnglish: string | null;
    slug: string;
    coverImage: string | null;
    genres: string;
    totalEpisodes: number;
    averageScore: number | null;
    popularity: number | null;
    format: string | null;
    status: string | null;
    seasonYear: number | null;
    studios: string | null;
    description: string | null;
  };
  score: number;
  reasons: string[];
}

export async function getRecommendations(
  animeId: number,
  limit: number = 20
): Promise<RecommendationResult[]> {
  // Fetch the source anime
  const source = await prisma.anime.findUnique({ where: { id: animeId } });
  if (!source) return [];

  const sourceGenres: string[] = JSON.parse(source.genres || "[]");
  const sourceStudios: string[] = JSON.parse(source.studios || "[]");

  if (sourceGenres.length === 0) return [];

  // Fetch candidate anime that share at least one genre
  const candidates = await prisma.anime.findMany({
    where: {
      id: { not: animeId },
      OR: sourceGenres.map((genre) => ({ genres: { contains: genre } })),
    },
    orderBy: { popularity: "desc" },
    take: 200,
  });

  if (candidates.length === 0) return [];

  // Find max popularity for normalization
  const maxPopularity = Math.max(
    ...candidates.map((c) => c.popularity || 0),
    1
  );

  // Score each candidate
  const scored: RecommendationResult[] = candidates.map((candidate) => {
    const candidateGenres: string[] = JSON.parse(candidate.genres || "[]");
    const candidateStudios: string[] = JSON.parse(candidate.studios || "[]");
    const reasons: string[] = [];
    let score = 0;

    // Genre overlap: (shared genres / total unique genres) * 30 points
    const sharedGenres = sourceGenres.filter((g) => candidateGenres.includes(g));
    const totalGenres = new Set([...sourceGenres, ...candidateGenres]).size;
    const genreScore = totalGenres > 0 ? (sharedGenres.length / totalGenres) * 30 : 0;
    score += genreScore;
    if (sharedGenres.length > 0) {
      reasons.push(`${sharedGenres.length} shared genre${sharedGenres.length > 1 ? "s" : ""}: ${sharedGenres.join(", ")}`);
    }

    // Same format bonus: +10 points
    if (source.format && candidate.format && source.format === candidate.format) {
      score += 10;
      reasons.push(`Same format (${candidate.format})`);
    }

    // Same studio bonus: +15 points
    const sharedStudios = sourceStudios.filter((s) => candidateStudios.includes(s));
    if (sharedStudios.length > 0) {
      score += 15;
      reasons.push(`Same studio: ${sharedStudios.join(", ")}`);
    }

    // Year proximity: max(0, 10 - abs(yearDiff)) points
    if (source.seasonYear && candidate.seasonYear) {
      const yearDiff = Math.abs(source.seasonYear - candidate.seasonYear);
      const yearScore = Math.max(0, 10 - yearDiff);
      score += yearScore;
      if (yearScore > 5) {
        reasons.push(`Similar era (${candidate.seasonYear})`);
      }
    }

    // Popularity normalization: (candidate_popularity / max_popularity) * 10 points
    if (candidate.popularity) {
      const popScore = (candidate.popularity / maxPopularity) * 10;
      score += popScore;
    }

    return {
      anime: candidate,
      score,
      reasons,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
