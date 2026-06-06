import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getProduct, getRelatedProducts } from "@/lib/data";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardProduct } from "@/components/product/product-card";
import { ProductJsonLd } from "@/components/seo/json-ld";
import { ProductReviews } from "@/components/product/product-reviews";

// ─── Page ───────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = getProduct(slug);

  if (!product) notFound();

  // ── Related products from the same collection ──────────────────────

  let relatedProducts: ProductCardProduct[] = [];

  if (product.collectionId) {
    const related = getRelatedProducts(product.collectionId, product.id, 4);
    relatedProducts = related as unknown as ProductCardProduct[];
  }

  // ── Accordion sections ─────────────────────────────────────────────

  const accordionSections = [
    {
      title: "Description",
      content: product.description ?? "No description available.",
    },
    {
      title: "Size & Fit",
      content:
        "Our pieces are designed to sculpt and support. Runs true to size. Model is 5'9\" wearing a 34B. Refer to our Size Guide for detailed measurements.",
    },
    {
      title: "Fabric & Care",
      content:
        "Crafted from 92% silk, 8% elastane with French leavers lace trim. Hand wash cold with pH-neutral detergent. Lay flat to dry. Do not bleach or tumble dry.",
    },
    {
      title: "Shipping & Returns",
      content:
        "Discreet packaging. Free shipping over $99. Easy 30-day returns on unworn items with original tags attached. See our Returns page for full policy.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav className="mb-8 flex items-center gap-2 font-body text-sm text-text-secondary">
        <Link href="/" className="transition-colors hover:text-text-primary">
          Home
        </Link>
        <span className="text-brand-gold">/</span>
        {product.collection && (
          <>
            <Link
              href={`/collections/${product.collection.slug}`}
              className="transition-colors hover:text-text-primary"
            >
              {product.collection.name}
            </Link>
            <span className="text-brand-gold">/</span>
          </>
        )}
        <span className="text-text-primary">{product.name}</span>
      </nav>

      {/* ── Main product layout ──────────────────────────────────────── */}
      <div className="lg:flex lg:gap-12">
        {/* Gallery */}
        <div className="lg:w-3/5">
          <ProductGallery images={product.images} />
        </div>

        {/* Product info */}
        <div className="mt-8 lg:mt-0 lg:w-2/5">
          <ProductInfo
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              description: product.description,
              images: product.images,
              variants: product.variants,
              collection: product.collection
                ? { name: product.collection.name, slug: product.collection.slug }
                : null,
            }}
          />

          {/* ── Accordion sections ──────────────────────────────────── */}
          <div className="mt-10 divide-y divide-border border-t border-b border-border">
            {accordionSections.map((section) => (
              <details key={section.title} className="group">
                <summary className="flex cursor-pointer items-center justify-between py-4 font-accent text-xs uppercase tracking-widest text-text-primary marker:hidden">
                  {section.title}
                  <ChevronDown className="h-4 w-4 text-text-secondary transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="pb-5 font-body text-sm leading-relaxed text-text-secondary">
                  {section.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────────────────── */}
      <ProductReviews productId={product.id} />

      {/* ── Complete the Look ────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-border pt-20">
          <h2 className="mb-10 text-center font-display text-3xl font-light tracking-[0.15em] text-text-primary">
            Complete the Look
          </h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export const dynamic = 'force-dynamic';
