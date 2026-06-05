import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://nocturne.com";

const STATIC_PAGES = [
  "",
  "/about",
  "/size-guide",
  "/shipping",
  "/returns",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/gift-guide",
  "/cart",
  "/collections",
  "/lingerie",
  "/bridal",
  "/self-love",
  "/sale",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages (EN locale base)
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${BASE_URL}/en${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  // Collections
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  const collectionEntries: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${BASE_URL}/en/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Categories
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/en/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/en/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...collectionEntries, ...categoryEntries, ...productEntries];
}
