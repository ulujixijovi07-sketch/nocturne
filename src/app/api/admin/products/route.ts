import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOCALES = ["en", "fr", "de", "es", "it"];

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      collection: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      translations: true,
      categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { translations, images, categories, ...data } = body;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      discountPercent: data.discountPercent || 0,
      collectionId: data.collectionId || null,
      isActive: data.isActive ?? true,
      status: data.status || "ACTIVE",
      translations: translations
        ? {
            create: LOCALES.filter((l) => translations[l]).map((locale) => ({
              locale,
              name: translations[locale].name || "",
              description: translations[locale].description || null,
            })),
          }
        : undefined,
      images: images?.length
        ? {
            create: images.map((img: { url: string; isPrimary: boolean; sortOrder: number }) => ({
              url: img.url,
              alt: data.name,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
            })),
          }
        : undefined,
      categories: categories?.length
        ? {
            create: categories.map((c: { categoryId: number }) => ({
              categoryId: c.categoryId,
            })),
          }
        : undefined,
    },
    include: {
      collection: { select: { id: true, name: true, slug: true } },
      translations: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(product, { status: 201 });
}
