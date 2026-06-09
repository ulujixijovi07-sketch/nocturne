import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOCALES = ["en", "fr", "de", "es", "it"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { translations, images, variants, ...data } = body;
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
      discountPercent: data.discountPercent ?? 0,
      collectionId: data.collectionId || null,
      isActive: data.isActive ?? true,
      status: data.status || "ACTIVE",
    },
  });

  // Update images
  if (images !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId } });
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img: { url: string; isPrimary: boolean; sortOrder: number }) => ({
          productId,
          url: img.url,
          alt: data.name,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      });
    }
  }

  // Update categories
  if (data.categories !== undefined) {
    await prisma.productCategory.deleteMany({ where: { productId } });
    if (data.categories.length > 0) {
      await prisma.productCategory.createMany({
        data: data.categories.map((c: { categoryId: number }) => ({
          productId,
          categoryId: c.categoryId,
        })),
      });
    }
  }

  // Upsert translations (including seoTitle / seoDesc)
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
            seoTitle: translations[locale].seoTitle || null,
            seoDesc: translations[locale].seoDesc || null,
          },
          update: {
            name: translations[locale].name || "",
            description: translations[locale].description || null,
            seoTitle: translations[locale].seoTitle || null,
            seoDesc: translations[locale].seoDesc || null,
          },
        });
      }
    }
  }

  // Handle variants — delete all existing, then create new ones
  if (variants !== undefined) {
    await prisma.productVariant.deleteMany({ where: { productId } });
    if (variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v: { color: string; colorHex: string; size: string; cup?: string | null; stock: number; sku: string }) => ({
          productId,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          cup: v.cup || null,
          stock: v.stock,
          sku: v.sku,
        })),
      });
    }
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      collection: { select: { id: true, name: true, slug: true } },
      translations: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
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
