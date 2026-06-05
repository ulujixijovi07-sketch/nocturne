import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId query parameter required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: parseInt(productId),
        isDeleted: false,
      },
      select: {
        id: true,
        authorName: true,
        rating: true,
        title: true,
        body: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
