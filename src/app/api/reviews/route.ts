import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const sort = searchParams.get("sort") || "recent";
  const minRating = parseInt(searchParams.get("minRating") || "0", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const where: Record<string, unknown> = {};
    if (slug) where.slug = slug;
    if (minRating > 0) where.rating = { gte: minRating };

    const orderBy: Record<string, string> =
      sort === "highest"
        ? { rating: "desc" }
        : sort === "lowest"
          ? { rating: "asc" }
          : { createdAt: "desc" };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, rating, title, content, author } = body;

    if (!slug || !rating || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 10) {
      return NextResponse.json({ error: "Rating must be 1-10" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: { slug, rating, title, content, author: author || null },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
