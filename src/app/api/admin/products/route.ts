import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOCALES = ["en", "fr", "de", "es", "it"];

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      collection: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      translations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { translations, ...data } = body;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      collectionId: data.collectionId || null,
      isActive: data.isActive ?? true,
      translations: translations
        ? {
            create: LOCALES.filter((l) => translations[l]).map((locale) => ({
              locale,
              name: translations[locale].name || "",
              description: translations[locale].description || null,
            })),
          }
        : undefined,
    },
    include: {
      collection: { select: { id: true, name: true, slug: true } },
      translations: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
