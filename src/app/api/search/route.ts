import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      name: { contains: q, mode: "insensitive" },
    },
    take: 8,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
      collection: { select: { name: true } },
    },
  });

  return NextResponse.json(products);
}
