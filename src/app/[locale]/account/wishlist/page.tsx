"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-8">
        <Heart className="mx-auto h-12 w-12 text-text-secondary/40" />
        <h1 className="mt-6 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Your wishlist is empty
        </h1>
        <p className="mt-3 font-body text-sm text-text-secondary">
          Save your favorite pieces here by clicking the heart on any product.
        </p>
        <Link
          href="/collections"
          className="mt-8 inline-block rounded bg-brand-gold px-10 py-4 font-accent text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          Discover Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          My Wishlist
          <span className="ml-3 font-body text-base text-text-secondary">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.productId} className="group relative">
            <Link
              href={`/products/${item.slug}`}
              className="block aspect-[3/4] overflow-hidden rounded-sm bg-brand-secondary"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Heart className="h-8 w-8 text-text-secondary/30" />
                </div>
              )}
            </Link>
            <button
              onClick={() => removeItem(item.productId)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-burgundy text-text-light opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove from wishlist"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="mt-3">
              <Link
                href={`/products/${item.slug}`}
                className="font-display text-sm font-medium text-text-primary hover:text-text-secondary"
              >
                {item.name}
              </Link>
              <p className="mt-1 font-body text-sm text-text-secondary">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
