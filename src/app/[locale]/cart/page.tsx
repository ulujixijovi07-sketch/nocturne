"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash, ShoppingBag } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

// ─── Cross-sell component ─────────────────────────────────────────────

type UpsellProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
};

function CartUpsell({ currentCartIds }: { currentCartIds: number[] }) {
  const [products, setProducts] = useState<UpsellProduct[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data: any[]) => {
        const upsells = data
          .filter((p: any) => p.isActive && p.status === "ACTIVE" && !currentCartIds.includes(p.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 4)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            image: p.images?.[0]?.url || "",
          }));
        setProducts(upsells);
      })
      .catch(() => {});
  }, [currentCartIds]);

  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="mb-6 text-center font-display text-xl font-light tracking-[0.1em] text-text-primary">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="group rounded-sm border border-border bg-brand-primary p-3 transition-shadow hover:shadow-md">
            <Link href={`/products/${p.slug}`}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-brand-secondary">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-secondary/30">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}
              </div>
            </Link>
            <div className="mt-2">
              <Link
                href={`/products/${p.slug}`}
                className="block truncate font-body text-xs font-medium text-text-primary transition-colors hover:text-brand-gold"
              >
                {p.name}
              </Link>
              <p className="mt-0.5 font-body text-xs text-text-secondary">
                {formatPrice(p.price)}
              </p>
            </div>
            <button
              onClick={() => {
                // Find first available variant for this product
                fetch(`/api/admin/products`)
                  .then((r) => r.json())
                  .then((data: any[]) => {
                    const prod = data.find((x: any) => x.id === p.id);
                    const variant = prod?.variants?.find((v: any) => v.stock > 0);
                    if (variant) {
                      addToCart({
                        variantId: variant.id,
                        productId: p.id,
                        name: p.name,
                        slug: p.slug,
                        image: p.image,
                        color: variant.color,
                        colorHex: variant.colorHex,
                        size: variant.size,
                        price: p.price,
                      });
                    }
                  })
                  .catch(() => {});
              }}
              className="mt-2 w-full rounded-sm bg-brand-dark py-1.5 font-medium text-[10px] uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/80"
            >
              + Add
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

const FREE_SHIPPING_THRESHOLD = 99;

// ─── Page ─────────────────────────────────────────────────────────────

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotal,
    clearCart,
    promoCode,
    promoError,
    promoLoading,
    applyPromoCode,
    removePromoCode,
    discount,
    total,
  } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [savedCards, setSavedCards] = useState<{code:string;type:string;value:number}[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nocturne-giftcards");
      if (raw) setSavedCards(JSON.parse(raw));
    } catch {}
  }, []);

  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const shippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  // ── Empty state ────────────────────────────────────────────────────

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <ShoppingBag className="mx-auto h-12 w-12 text-text-secondary/40" />
        <h1 className="mt-6 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Your bag is empty
        </h1>
        <p className="mt-3 font-body text-sm text-text-secondary">
          Discover pieces made for the night.
        </p>
        <Link
          href="/collections"
          className="mt-8 inline-block rounded bg-brand-gold px-10 py-4 font-medium text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  // ── Cart with items ───────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* Heading */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Shopping Bag
          <span className="ml-3 font-body text-base text-text-secondary">
            ({totalItems} {totalItems === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="font-body text-xs text-text-secondary underline transition-colors hover:text-text-primary"
        >
          Clear bag
        </button>
      </div>

      <div className="lg:flex lg:gap-10">
        {/* ── Cart items ────────────────────────────────────────────── */}
        <div className="flex-1 divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 py-5"
            >
              {/* Image */}
              <Link
                href={`/products/${item.slug}`}
                className="relative h-28 w-20 shrink-0 overflow-hidden rounded-sm bg-brand-secondary"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-text-secondary/30" />
                  </div>
                )}
              </Link>

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-display text-lg font-medium text-text-primary transition-colors hover:text-text-secondary"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 font-body text-sm text-text-secondary">
                    {item.color} / {item.size}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body text-sm font-medium text-text-primary">
                    {formatPrice(item.price)}
                  </span>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border border-border text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="flex h-8 w-10 items-center justify-center font-body text-sm text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border border-border text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="ml-2 flex h-8 w-8 items-center justify-center text-text-secondary/50 transition-colors hover:text-brand-burgundy"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <p className="text-right font-body text-xs text-text-secondary">
                  Line total: {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary sidebar ──────────────────────────────────── */}
        <aside className="mt-10 lg:mt-0 lg:w-80 lg:shrink-0">
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h2 className="font-display text-xl font-medium text-text-primary">
              Order Summary
            </h2>

            {/* Subtotal */}
            <div className="mt-4 flex justify-between font-body text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary">{formatPrice(subtotal)}</span>
            </div>

            {/* Shipping progress */}
            <div className="mt-4">
              {shippingRemaining > 0 ? (
                <>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-secondary">
                    <div
                      className="h-full rounded-full bg-brand-gold transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 font-body text-xs text-text-secondary">
                    {formatPrice(shippingRemaining)} away from free shipping
                  </p>
                </>
              ) : (
                <p className="font-body text-xs font-medium text-brand-gold">
                  ✓ Free shipping unlocked
                </p>
              )}
            </div>

            {/* Gift Card */}
            {promoCode ? (
              <div className="mt-5 rounded border border-brand-gold/30 bg-gradient-to-br from-brand-dark/80 to-brand-dark/40 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-brand-gold/10 rounded-bl-full" />
                <p className="font-medium text-[10px] uppercase tracking-widest text-brand-gold/60">Gift Card Applied</p>
                <p className="mt-1 font-display text-base text-brand-gold tracking-wider">{promoCode.code}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-body text-xs text-text-secondary">
                    {promoCode.type === "percentage" ? `${promoCode.value}% off` : `$${promoCode.value} off`}
                  </span>
                  <button onClick={removePromoCode} className="font-body text-xs text-text-secondary underline hover:text-brand-burgundy transition-colors">Remove</button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {/* Saved cards dropdown */}
                {savedCards.length > 0 && (
                  <select
                    onChange={(e) => { if (e.target.value) applyPromoCode(e.target.value); }}
                    className="w-full rounded-sm border border-border bg-transparent px-3 py-2 font-body text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a saved gift card…</option>
                    {savedCards.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</option>
                    ))}
                  </select>
                )}
                {/* Manual input */}
                <form onSubmit={(e) => { e.preventDefault(); if (promoInput.trim()) { applyPromoCode(promoInput.trim()); setPromoInput(""); } }} className="flex gap-2">
                  <input type="text" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Or enter code manually" className="flex-1 rounded-sm border border-border bg-transparent px-3 py-2 font-body text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                  <button type="submit" disabled={promoLoading || !promoInput.trim()} className="rounded-sm border border-border px-4 py-2 font-medium text-[10px] uppercase tracking-widest text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50">{promoLoading ? "…" : "Apply"}</button>
                </form>
                {promoError && <p className="mt-1.5 font-body text-xs text-brand-burgundy">{promoError}</p>}
              </div>
            )}

            {/* Discount line */}
            {discount > 0 && (
              <div className="mt-4 flex justify-between font-body text-sm">
                <span className="text-brand-gold">Discount</span>
                <span className="text-brand-gold">
                  −{formatPrice(discount)}
                </span>
              </div>
            )}

            {/* Estimated total */}
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex justify-between font-body">
                <span className="text-sm font-medium text-text-primary">
                  Estimated Total
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mt-1 font-body text-[11px] text-text-secondary">
                Tax calculated at checkout
              </p>
            </div>

            {/* Checkout button */}
            <Link
              href="/checkout"
              className="mt-5 flex w-full items-center justify-center rounded bg-brand-dark py-4 font-medium text-xs font-medium uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90"
            >
              Proceed to Checkout
            </Link>
          </div>
        </aside>
      </div>

      {/* Cross-sell — You Might Also Like */}
      <CartUpsell currentCartIds={items.map((i) => i.productId)} />

    </div>
  );
}
