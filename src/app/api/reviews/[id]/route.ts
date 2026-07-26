import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db-pool";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { rating, title, content, author } = body;

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (rating !== undefined) { setClauses.push(`rating = $${idx++}`); values.push(rating); }
    if (title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(title); }
    if (content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(content); }
    if (author !== undefined) { setClauses.push(`author = $${idx++}`); values.push(author || null); }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id);

    const pool = getPool();
    const result = await pool.query(
      `UPDATE "Review" SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pool = getPool();
    const result = await pool.query(`DELETE FROM "Review" WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
