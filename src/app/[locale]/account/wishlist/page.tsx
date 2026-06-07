"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag } from "lucide-react";

type WishlistItem = {
  productId: number;
  name: string;
  slug: string;
  price: number;
  image: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSessionChecked(true);
        if (data?.user?.id) {
          return fetch("/api/wishlist", { credentials: "include" });
        }
        return null;
      })
      .then((res) => (res ? res.json() : null))
      .then((data) => {
        if (data?.items) setItems(data.items);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setSessionChecked(true);
      });
  }, []);

  const removeItem = async (productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    fetch(`/api/wishlist?productId=${productId}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
        <p className="mt-4 font-body text-sm text-text-secondary">Loading wishlist…</p>
      </div>
    );
  }

  if (!sessionChecked || items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <Heart className="mx-auto h-12 w-12 text-text-secondary/40" />
        <h1 className="mt-6 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Your wishlist is empty
        </h1>
        <p className="mt-3 font-body text-sm text-text-secondary">
          Save your favorite pieces by clicking the heart icon on any product.
        </p>
        <Link
          href="/collections"
          className="mt-8 inline-block rounded bg-brand-gold px-10 py-4 font-accent text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-light tracking-[0.15em] text-text-primary">
        My Wishlist
        <span className="ml-3 font-body text-base text-text-secondary">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative rounded-sm border border-border bg-brand-primary transition-shadow hover:shadow-md"
          >
            {/* Image */}
            <Link href={`/products/${item.slug}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-sm bg-brand-secondary">
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
                    <ShoppingBag className="h-8 w-8 text-text-secondary/30" />
                  </div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="p-4">
              <Link href={`/products/${item.slug}`}>
                <h3 className="font-display text-base font-medium text-text-primary transition-colors hover:text-text-secondary">
                  {item.name}
                </h3>
              </Link>
              <p className="mt-1 font-body text-sm font-medium text-text-primary">
                {formatPrice(item.price)}
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeItem(item.productId)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark/60 text-text-light/80 opacity-0 transition-opacity hover:bg-brand-burgundy group-hover:opacity-100"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
