import { prisma } from "./prisma";

const include = {
  images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
  variants: true,
  collection: true,
  reviews: { where: { isDeleted: false } },
};

export async function getProducts(limit?: number) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include,
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
  return products;
}

export async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include });
}

export async function getCollections() {
  return prisma.collection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
}

export async function getCollection(slug: string) {
  return prisma.collection.findUnique({ where: { slug } });
}

export async function getCategories() {
  return prisma.category.findMany();
}

export async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getRelatedProducts(collectionId: number, excludeId: number, limit = 4) {
  return prisma.product.findMany({
    where: { collectionId, id: { not: excludeId }, isActive: true },
    include,
    take: limit,
  });
}

export async function getProductsByCategory(categorySlug: string) {
  const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!cat) return [];
  return prisma.product.findMany({
    where: {
      isActive: true,
      categories: { some: { categoryId: cat.id } },
    },
    include,
  });
}
