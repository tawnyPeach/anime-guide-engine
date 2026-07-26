import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const anime = await prisma.anime.findUnique({
    where: { slug },
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

  if (!anime) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(anime);
}
