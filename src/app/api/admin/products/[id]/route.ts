import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOCALES = ["en", "fr", "de", "es", "it"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { translations, ...data } = body;
  const productId = parseInt(id);

  // Update base product
  await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      collectionId: data.collectionId || null,
      isActive: data.isActive ?? true,
    },
  });

  // Upsert translations
  if (translations) {
    for (const locale of LOCALES) {
      if (translations[locale]) {
        await prisma.productTranslation.upsert({
          where: { productId_locale: { productId, locale } },
          create: {
            productId,
            locale,
            name: translations[locale].name || "",
            description: translations[locale].description || null,
          },
          update: {
            name: translations[locale].name || "",
            description: translations[locale].description || null,
          },
        });
      }
    }
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      collection: { select: { id: true, name: true, slug: true } },
      translations: true,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
