"use client";

import { useState } from "react";
import { Copy, Check, Gift, Truck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Promo cards ────────────────────────────────────────────────────────

const PROMOS = [
  {
    icon: Gift,
    title: "Welcome 10% Off",
    description: "New here? Enjoy 10% off your first order with code.",
    code: "WELCOME10",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on your entire order with code.",
    code: "FREESHIP79",
  },
  {
    icon: Package,
    title: "Bundle & Save",
    description: "Choose 3 or more items and save 20% with code.",
    code: "BUNDLE3",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <h1 className="text-center font-display text-3xl font-light tracking-[0.15em] text-text-primary">
        Exclusive Deals
      </h1>
      <p className="mt-3 text-center font-body text-sm text-text-secondary">
        Member-only offers and savings.
      </p>

      <div className="mt-10 space-y-4">
        {PROMOS.map((promo) => (
          <PromoCard key={promo.title} {...promo} />
        ))}
      </div>
    </div>
  );
}

// ─── Promo card component ──────────────────────────────────────────────

function PromoCard({
  icon: Icon,
  title,
  description,
  code,
}: {
  icon: typeof Gift;
  title: string;
  description: string;
  code: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-brand-primary p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-secondary">
          <Icon className="h-5 w-5 text-brand-gold" />
        </div>
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary">
            {title}
          </h3>
          <p className="mt-0.5 font-body text-sm text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      {code && (
        <button
          onClick={handleCopy}
          className={cn(
            "flex shrink-0 items-center gap-2 self-start rounded-sm px-5 py-2.5 font-accent text-xs uppercase tracking-widest transition-colors sm:self-center",
            copied
              ? "bg-brand-gold text-brand-dark"
              : "border border-dashed border-brand-gold/50 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              {code}
            </>
          )}
        </button>
      )}
    </div>
  );
}
