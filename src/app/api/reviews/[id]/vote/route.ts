import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const review = await prisma.review.update({
      where: { id },
      data: type === "up" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error voting on review:", error);
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
