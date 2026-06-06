import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, getCategory, getProductsByCategory, getCollection } from "@/lib/data";
import { ProductFilters } from "@/components/product/product-filters";
import type { ProductCardProduct } from "@/components/product/product-card";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { collection: collectionSlug } = await searchParams;

  let categoryName = "All Products";
  let products: ProductCardProduct[] = [];

  if (slug === "all") {
    products = getProducts() as unknown as ProductCardProduct[];
    
    // Filter by collection if query param present
    if (collectionSlug) {
      const collection = getCollection(collectionSlug);
      if (collection) {
        categoryName = collection.name;
        products = products.filter(
          (p: any) => p.collectionId === collection.id
        ) as unknown as ProductCardProduct[];
      }
    }
  } else {
    const category = getCategory(slug);
    if (!category) notFound();
    categoryName = category.name;
    products = getProductsByCategory(slug) as unknown as ProductCardProduct[];
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 font-body text-sm text-text-secondary">
        <Link href="/" className="transition-colors hover:text-text-primary">
          Home
        </Link>
        <span className="text-brand-gold">/</span>
        <span className="text-text-primary">{categoryName}</span>
      </nav>

      <h1 className="mb-8 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
        {categoryName}
      </h1>

      <ProductFilters products={products} />
    </div>
  );
}
