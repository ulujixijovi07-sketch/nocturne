import productsData from "@/data/products.json";
import collectionsData from "@/data/collections.json";
import categoriesData from "@/data/categories.json";

// ─── Types ──────────────────────────────────────────────────────────────

type Image = { id: number; productId: number; url: string; alt: string | null; sortOrder: number; isPrimary: boolean };
type Variant = { id: number; productId: number; color: string; colorHex: string; size: string; cup: string | null; stock: number; sku: string };
type Review = { id: number; productId: number; authorName: string; rating: number; title: string | null; body: string | null; isVerified: boolean; isPinned: boolean; createdAt: string; isDeleted: boolean };
type Collection = { id: number; name: string; slug: string; description: string | null; heroImage: string | null; isActive: boolean; sortOrder: number };
type Category = { id: number; name: string; slug: string; description: string | null; image: string | null; parentId: number | null };

type Product = {
  id: number; name: string; slug: string; description: string | null;
  price: number; compareAtPrice: number | null; collectionId: number | null;
  isActive: boolean;
  images: Image[]; variants: Variant[]; reviews: Review[];
  collection: Collection | null;
};

const products = productsData as unknown as Product[];
const collections = collectionsData as unknown as Collection[];
const categories = categoriesData as unknown as Category[];

// ─── Product Queries ────────────────────────────────────────────────────

export function getProducts(limit?: number): Product[] {
  const active = products.filter((p) => p.isActive).sort((a, b) => b.id - a.id);
  return limit ? active.slice(0, limit) : active;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.isActive);
}

export function getRelatedProducts(collectionId: number, excludeId: number, limit = 4): Product[] {
  return products
    .filter((p) => p.collectionId === collectionId && p.id !== excludeId && p.isActive)
    .slice(0, limit);
}

// ─── Collection Queries ─────────────────────────────────────────────────

export function getCollections(limit?: number): Collection[] {
  const active = collections.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  return limit ? active.slice(0, limit) : active;
}

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

// ─── Category Queries ───────────────────────────────────────────────────

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string): Product[] {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  return products.filter((p) => {
    if (!p.isActive) return false;
    // Products with matching collection slugs or categories via category links are hard without join table
    // For the static JSON approach, map category slug to plausible product name matches
    // Since we don't have ProductCategory join table in JSON, use simple name-based matching
    const nameLower = p.name.toLowerCase();
    const catName = cat.name.toLowerCase();
    const catSlug = cat.slug.toLowerCase();
    if (catSlug === "lingerie-sets") return nameLower.includes("set") || nameLower.includes("lingerie");
    if (catSlug === "bodysuits-teddies") return nameLower.includes("bodysuit") || nameLower.includes("teddy");
    if (catSlug === "bras") return nameLower.includes("bra") || nameLower.includes("balconette") || nameLower.includes("plunge") || nameLower.includes("bralette");
    if (catSlug === "briefs-thongs") return nameLower.includes("brief") || nameLower.includes("thong");
    if (catSlug === "suspender-belts") return nameLower.includes("suspender") || nameLower.includes("garter");
    if (catSlug === "hosiery") return nameLower.includes("stocking") || nameLower.includes("hosiery");
    if (catSlug === "chemises-slips") return nameLower.includes("chemise") || nameLower.includes("slip") || nameLower.includes("babydoll");
    if (catSlug === "corsets-bustiers") return nameLower.includes("corset") || nameLower.includes("bustier");
    if (catSlug === "robes-kimonos") return nameLower.includes("robe") || nameLower.includes("kimono");
    if (catSlug === "harnesses-body-chains") return nameLower.includes("harness") || nameLower.includes("body chain") || nameLower.includes("cuff") || nameLower.includes("collar");
    if (catSlug === "bridal-lingerie") return nameLower.includes("bridal") || nameLower.includes("elara") || nameLower.includes("aurora");
    if (catSlug === "self-love") return p.collection?.slug === "seraphina" || nameLower.includes("self");
    if (catSlug === "accessories") return nameLower.includes("choker") || nameLower.includes("glove") || nameLower.includes("chain");
    return true;
  });
}
