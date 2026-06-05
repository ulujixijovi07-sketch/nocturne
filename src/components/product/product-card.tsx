"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist-context";

// ─── Types ────────────────────────────────────────────────────────────────

export type ProductCardProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: {
    id: number;
    url: string;
    alt: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  variants: {
    id: number;
    color: string;
    colorHex: string;
    size: string;
    stock: number;
    sku: string;
  }[];
  collection: {
    name: string;
  } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg==";

function getUniqueColors(variants: ProductCardProduct["variants"]) {
  const seen = new Set<string>();
  return variants.filter((v) => {
    if (seen.has(v.colorHex)) return false;
    seen.add(v.colorHex);
    return true;
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

// ─── Component ────────────────────────────────────────────────────────────

type ProductCardProps = {
  product: ProductCardProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const uniqueColors = getUniqueColors(product.variants);
  const visibleColors = uniqueColors.slice(0, 4);
  const extraColorCount = uniqueColors.length - 4;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Container ──────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-secondary">
        {/* Primary Image */}
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              isHovered && secondaryImage ? "opacity-0" : "opacity-100"
            )}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            unoptimized
          />
        )}

        {/* Secondary Image (shown on hover) */}
        {secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            unoptimized
          />
        )}

        {/* ── Wishlist heart ────────────────────────────────────── */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (wishlisted) {
              removeItem(product.id);
            } else {
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: primaryImage?.url ?? "",
                price: product.price,
              });
            }
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            wishlisted
              ? "bg-brand-burgundy text-text-light"
              : "bg-brand-dark/30 text-text-light/80 hover:bg-brand-dark/50 hover:text-text-light"
          )}
        >
          <Heart
            className="h-4 w-4"
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* ── Hover Overlay ──────────────────────────────────────── */}
        <div
          className={cn(
            "absolute inset-0 flex items-end justify-center pb-6",
            "bg-gradient-to-t from-brand-dark/30 to-transparent",
            "transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            className={cn(
              "rounded bg-brand-gold px-8 py-2.5",
              "font-accent text-xs font-medium uppercase tracking-widest text-brand-dark",
              "hover:bg-brand-gold/90 transition-colors",
              "translate-y-0 transition-transform duration-300",
              isHovered ? "translate-y-0" : "translate-y-2"
            )}
            onClick={(e) => {
              e.preventDefault();
              // Quick-add logic here (future)
            }}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* ── Product Info ──────────────────────────────────────────────── */}
      <div className="mt-4 space-y-2">
        {/* Collection badge */}
        {product.collection && (
          <p className="font-accent text-[10px] uppercase tracking-widest text-text-secondary">
            {product.collection.name}
          </p>
        )}

        {/* Product name */}
        <h3 className="font-display text-lg font-medium text-text-primary leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-medium text-text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="font-body text-sm font-light text-text-secondary line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Color variant dots */}
        {visibleColors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {visibleColors.map((v) => (
              <span
                key={v.id}
                className="inline-block h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: v.colorHex }}
                title={v.color}
              />
            ))}
            {extraColorCount > 0 && (
              <span className="font-body text-[11px] text-text-secondary ml-0.5">
                +{extraColorCount} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
