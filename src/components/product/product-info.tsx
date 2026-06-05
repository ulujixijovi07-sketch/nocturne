"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

// ─── Types ──────────────────────────────────────────────────────────────

type Variant = {
  id: number;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  sku: string;
};

type ProductInfoProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  images: { url: string }[];
  variants: Variant[];
  collection: { name: string; slug: string } | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function getUniqueColors(variants: Variant[]) {
  const seen = new Set<string>();
  return variants.filter((v) => {
    if (seen.has(v.colorHex)) return false;
    seen.add(v.colorHex);
    return true;
  });
}

// ─── Component ──────────────────────────────────────────────────────────

type ProductInfoProps = {
  product: ProductInfoProduct;
};

export function ProductInfo({ product }: ProductInfoProps) {
  const uniqueColors = useMemo(
    () => getUniqueColors(product.variants),
    [product.variants]
  );

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addedFeedback, setAddedFeedback] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  const { addToCart } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();

  const wishlisted = isInWishlist(product.id);

  // Sizes available for the selected color (deduplicated)
  const availableSizes = useMemo(() => {
    const sizes = product.variants.filter(
      (v) => v.colorHex === selectedColor
    );
    const seen = new Set<string>();
    return sizes.filter((v) => {
      if (seen.has(v.size)) return false;
      seen.add(v.size);
      return true;
    });
  }, [product.variants, selectedColor]);

  // Stock for the selected variant
  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (v) => v.colorHex === selectedColor && v.size === selectedSize
      ),
    [product.variants, selectedColor, selectedSize]
  );

  const stock = selectedVariant?.stock ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Collection badge ────────────────────────────────────────── */}
      {product.collection && (
        <Link
          href={`/collections/${product.collection.slug}`}
          className="font-accent text-[11px] uppercase tracking-widest text-brand-gold transition-colors hover:text-brand-gold/80"
        >
          {product.collection.name}
        </Link>
      )}

      {/* ── Product name ────────────────────────────────────────────── */}
      <h1 className="font-display text-3xl font-medium leading-tight text-text-primary lg:text-4xl">
        {product.name}
      </h1>

      {/* ── Price ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="font-body text-xl font-medium text-text-primary">
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && (
          <span className="font-body text-lg font-light text-text-secondary line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      {/* ── Color selector ──────────────────────────────────────────── */}
      {uniqueColors.length > 0 && (
        <div>
          <p className="mb-3 font-accent text-xs uppercase tracking-widest text-text-secondary">
            Color —{" "}
            <span className="text-text-primary">
              {uniqueColors.find((c) => c.colorHex === selectedColor)?.color ??
                "Select"}
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((color) => {
              const isSelected = selectedColor === color.colorHex;
              return (
                <button
                  key={color.colorHex}
                  onClick={() => {
                    setSelectedColor(color.colorHex);
                    setSelectedSize("");
                  }}
                  title={color.color}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    isSelected
                      ? "border-brand-gold ring-1 ring-brand-gold ring-offset-1 ring-offset-brand-primary"
                      : "border-border hover:border-text-secondary"
                  )}
                  style={{ backgroundColor: color.colorHex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Size selector ───────────────────────────────────────────── */}
      {selectedColor ? (
        <div>
          <p className="mb-3 font-accent text-xs uppercase tracking-widest text-text-secondary">
            Size
          </p>
          {availableSizes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((v) => {
                const isSelected = selectedSize === v.size;
                const isOutOfStock = v.stock === 0;
                return (
                  <button
                    key={v.size}
                    onClick={() => !isOutOfStock && setSelectedSize(v.size)}
                    disabled={isOutOfStock}
                    className={cn(
                      "min-w-[3rem] rounded-sm border px-4 py-2.5 text-center font-body text-sm transition-all",
                      isSelected &&
                        "border-brand-dark bg-brand-dark text-text-light",
                      !isSelected &&
                        !isOutOfStock &&
                        "border-border text-text-primary hover:border-text-secondary",
                      isOutOfStock &&
                        "cursor-not-allowed border-border text-text-secondary/40 line-through"
                    )}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="font-body text-sm text-text-secondary">
              No sizes available for this color.
            </p>
          )}
        </div>
      ) : (
        <p className="font-body text-sm italic text-text-secondary">
          Select a color
        </p>
      )}

      {/* ── Stock status ────────────────────────────────────────────── */}
      {selectedColor && selectedSize && (
        <>
          {stock > 0 && stock < 5 && (
            <p className="font-body text-sm text-brand-burgundy">
              Low stock — only {stock} left
            </p>
          )}
          {stock === 0 && (
            <p className="font-body text-sm text-brand-burgundy">
              Out of stock
            </p>
          )}
        </>
      )}

      {/* ── Add to Bag + Wishlist ───────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          disabled={!selectedColor || !selectedSize || stock === 0}
          onClick={() => {
            if (!selectedVariant || stock === 0) return;
            const primaryImage = product.images[0]?.url ?? "";
            addToCart({
              variantId: selectedVariant.id,
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image: primaryImage,
              color: selectedVariant.color,
              colorHex: selectedColor,
              size: selectedSize,
              price: product.price,
            });
            setAddedFeedback(true);
            if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
            feedbackTimer.current = setTimeout(() => setAddedFeedback(false), 2000);
          }}
          className={cn(
            "relative flex-1 rounded py-4 font-accent text-xs font-medium uppercase tracking-widest transition-all",
            selectedColor && selectedSize && stock > 0
              ? addedFeedback
                ? "bg-brand-gold text-brand-dark"
                : "bg-brand-dark text-text-light hover:bg-brand-dark/90"
              : "cursor-not-allowed bg-brand-secondary text-text-secondary"
          )}
        >
          {addedFeedback
            ? "Added!"
            : !selectedColor
              ? "Select a color"
              : !selectedSize
                ? "Select a size"
                : "Add to Bag"}
        </button>

        <button
          onClick={() => {
            if (wishlisted) {
              removeFromWishlist(product.id);
            } else {
              addToWishlist({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images[0]?.url ?? "",
                price: product.price,
              });
            }
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded border transition-colors",
            wishlisted
              ? "border-brand-burgundy text-brand-burgundy"
              : "border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
          )}
        >
          <Heart
            className="h-5 w-5"
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>
    </div>
  );
}
