import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { authorName, rating, title, body: bodyText, isVerified, isPinned } = body;

    const review = await prisma.review.update({
      where: { id },
      data: { authorName, rating, title, body: bodyText, isVerified, isPinned },
      include: { product: { select: { name: true } } },
    });

    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.review.update({
      where: { id },
      data: { isDeleted: true },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
