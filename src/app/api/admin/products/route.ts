import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      collection: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      price: body.price,
      compareAtPrice: body.compareAtPrice || null,
      collectionId: body.collectionId || null,
      isActive: body.isActive ?? true,
    },
    include: { collection: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json(product, { status: 201 });
}
