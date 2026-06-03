import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  // Cap query length at 200 characters
  q = q.slice(0, 200);

  const results = await prisma.anime.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { titleEnglish: { contains: q } },
        { titleJapanese: { contains: q } },
      ],
    },
    orderBy: { popularity: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      titleEnglish: true,
      slug: true,
      coverImage: true,
      genres: true,
      format: true,
      averageScore: true,
    },
  });

  return Response.json({ results });
}
