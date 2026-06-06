import { prisma } from "./prisma";

const include = {
  images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
  variants: true,
  collection: true,
  reviews: { where: { isDeleted: false } },
  categories: { include: { category: { select: { id: true, name: true } } } },
};

function flattenCategories(p: any) {
  return {
    ...p,
    categories: p.categories?.map((pc: any) => pc.category || pc) || [],
  };
}

export async function getProducts(limit?: number) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include,
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
  return products.map(flattenCategories);
}

export async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({ where: { slug, isActive: true }, include });
  if (!product) return null;
  return flattenCategories(product);
}

export async function getCollections(limit?: number) {
  return prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    ...(limit ? { take: limit } : {}),
  });
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
  const products = await prisma.product.findMany({
    where: {
      collectionId,
      isActive: true,
      ...(excludeId !== 0 ? { id: { not: excludeId } } : {}),
    },
    include,
    take: limit,
    orderBy: { id: "desc" },
  });
  return products.map(flattenCategories);
}

export async function getProductsByCategory(categorySlug: string) {
  const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!cat) return [];
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categories: { some: { categoryId: cat.id } },
    },
    include,
  });
  return products.map(flattenCategories);
}
