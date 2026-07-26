import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { rating, title, content, author } = body;

    const data: Record<string, unknown> = {};
    if (rating !== undefined) data.rating = rating;
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (author !== undefined) data.author = author || null;

    const review = await prisma.review.update({
      where: { id },
      data,
    });

    return NextResponse.json(review);
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
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
