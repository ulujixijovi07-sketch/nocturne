"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "@phosphor-icons/react";

type ViewedProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
};

const STORAGE_KEY = "nocturne-viewed";
const MAX_ITEMS = 6;

function loadViewed(): ViewedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveViewed(products: ViewedProduct[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

// Track current product view
export function trackProductView(product: ViewedProduct) {
  const viewed = loadViewed();
  const filtered = viewed.filter((p) => p.id !== product.id);
  filtered.unshift(product);
  saveViewed(filtered.slice(0, MAX_ITEMS));
}

// Display component — shows recently viewed products
export function RecentlyViewed() {
  const [products, setProducts] = useState<ViewedProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setProducts(loadViewed());
    setHydrated(true);
  }, []);

  if (!hydrated || products.length === 0) return null;

  return (
    <section className="border-t border-border pt-12 mt-16">
      <h2 className="mb-6 text-center font-display text-xl font-light tracking-[0.1em] text-text-primary">
        Recently Viewed
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group flex-shrink-0 w-36 snap-start"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-brand-secondary">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="144px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-secondary/30">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
            </div>
            <p className="mt-2 truncate font-body text-xs font-medium text-text-primary group-hover:text-brand-gold transition-colors">
              {p.name}
            </p>
            <p className="font-body text-xs text-text-secondary">
              ${p.price}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
