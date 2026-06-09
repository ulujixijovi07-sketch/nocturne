import type { MetadataRoute } from "next";
import { getProducts, getCollections, getCategories } from "@/lib/db";

const BASE_URL = "https://nocturne.com";
const LOCALES = ["en", "fr", "de", "es", "it"];

const STATIC_PAGES = [
  "", "/about", "/size-guide", "/shipping", "/returns", "/faq",
  "/contact", "/privacy", "/terms", "/gift-guide", "/cart",
  "/categories/all",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages × all locales
  for (const locale of LOCALES) {
    for (const path of STATIC_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : ("monthly" as const),
        priority: path === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
          ),
        },
      });
      // Only add once for static pages (alternates cover the rest)
    }
    break; // Static pages with alternates — only need one set
  }

  const collections = await getCollections();
  for (const c of collections) {
    entries.push({
      url: `${BASE_URL}/en/collections/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/collections/${c.slug}`])
        ),
      },
    });
  }

  const categories = await getCategories();
  for (const cat of categories) {
    entries.push({
      url: `${BASE_URL}/en/categories/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/categories/${cat.slug}`])
        ),
      },
    });
  }

  const products = await getProducts();
  for (const p of products) {
    entries.push({
      url: `${BASE_URL}/en/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/products/${p.slug}`])
        ),
      },
    });
  }

  return entries;
}
