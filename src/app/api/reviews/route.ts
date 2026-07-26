import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db-pool";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const sort = searchParams.get("sort") || "recent";
  const minRating = parseInt(searchParams.get("minRating") || "0", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const pool = getPool();
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (slug) {
      conditions.push(`slug = $${idx++}`);
      params.push(slug);
    }
    if (minRating > 0) {
      conditions.push(`rating >= $${idx++}`);
      params.push(minRating);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderCol =
      sort === "highest"
        ? "rating DESC"
        : sort === "lowest"
          ? "rating ASC"
          : `"createdAt" DESC`;

    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM "Review" ${where}`, params);
    const total = countResult.rows[0].count;

    const offset = (page - 1) * limit;
    const reviewsResult = await pool.query(
      `SELECT * FROM "Review" ${where} ORDER BY ${orderCol} LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      reviews: reviewsResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ reviews: [], total: 0, page, totalPages: 0 });
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

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO "Review" (id, slug, rating, title, content, author, upvotes, downvotes, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, 0, 0, NOW(), NOW())
       RETURNING *`,
      [slug, rating, title, content, author || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
