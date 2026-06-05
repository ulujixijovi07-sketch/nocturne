import type { MetadataRoute } from "next";
import { getProducts, getCollections, getCategories } from "@/lib/data";

const BASE_URL = "https://nocturne.com";

const STATIC_PAGES = [
  "", "/about", "/size-guide", "/shipping", "/returns", "/faq",
  "/contact", "/privacy", "/terms", "/gift-guide", "/cart",
  "/categories/all",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${BASE_URL}/en${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const collections = getCollections();
  const collectionEntries: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${BASE_URL}/en/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categories = getCategories();
  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/en/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const products = getProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/en/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticEntries, ...collectionEntries, ...categoryEntries, ...productEntries];
}
