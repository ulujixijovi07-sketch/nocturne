import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getRelatedProducts } from "@/lib/db";
import type { ProductCardProduct } from "@/components/product/product-card";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) return { title: "Not Found" };
  return { title: c.name + " | NOCTURNE", description: c.description || "" };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const products = getRelatedProducts(collection.id, 0, 50) as unknown as ProductCardProduct[];

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={collection.heroImage || `https://picsum.photos/seed/${slug}/1600/800`}
          alt={collection.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <h1 className="font-display text-4xl font-light tracking-[0.15em] text-text-light lg:text-6xl">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="mt-4 max-w-xl font-body text-base text-text-light/80">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <h2 className="mb-8 font-display text-2xl font-light tracking-[0.1em] text-text-primary">
          {products.length} Products
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group block overflow-hidden rounded-sm bg-brand-secondary"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={p.images?.[0]?.url || `https://picsum.photos/seed/${p.slug}/600/800`}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="truncate font-display text-sm font-medium text-text-primary">
                    {p.name}
                  </h3>
                  <p className="mt-1 font-body text-sm text-text-secondary">
                    ${p.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center font-body text-sm text-text-secondary">
            No products in this collection yet.
          </p>
        )}
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
