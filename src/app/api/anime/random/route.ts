import prisma from "@/lib/prisma";

export async function GET() {
  const count = await prisma.anime.count();
  const skip = Math.floor(Math.random() * count);
  const anime = await prisma.anime.findMany({
    skip,
    take: 1,
    select: {
      id: true,
      title: true,
      titleEnglish: true,
      slug: true,
      coverImage: true,
      averageScore: true,
      totalEpisodes: true,
      status: true,
      format: true,
      season: true,
      seasonYear: true,
      genres: true,
      studios: true,
      popularity: true,
    },
  });

  if (anime.length === 0) {
    return Response.json({ error: "No anime found" }, { status: 404 });
  }

  return Response.json(anime[0]);
}
