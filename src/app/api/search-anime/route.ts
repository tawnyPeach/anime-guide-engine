import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return Response.json([]);
  }

  const results = await prisma.anime.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { titleEnglish: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { popularity: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      titleEnglish: true,
      slug: true,
      totalEpisodes: true,
      coverImage: true,
    },
  });

  return Response.json(results);
}
