import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db-pool";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { type } = body;

    if (type !== "up" && type !== "down") {
      return NextResponse.json({ error: "Vote type must be 'up' or 'down'" }, { status: 400 });
    }

    const pool = getPool();
    const col = type === "up" ? "upvotes" : "downvotes";
    const result = await pool.query(
      `UPDATE "Review" SET ${col} = ${col} + 1, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error voting on review:", error);
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
