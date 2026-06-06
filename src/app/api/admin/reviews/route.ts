import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  const reviews = await prisma.review.findMany({
    where: {
      isDeleted: false,
      ...(productId ? { productId: parseInt(productId) } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json(reviews);
}
