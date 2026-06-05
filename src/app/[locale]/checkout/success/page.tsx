"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";

// ─── Inner component (uses useSearchParams) ───────────────────────────

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "NOCT-000000";

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center lg:px-8">
      <CheckCircle className="mx-auto h-14 w-14 text-brand-gold" />

      <h1 className="mt-6 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
        Order Confirmed
      </h1>

      <p className="mt-3 font-body text-sm text-text-secondary">
        Thank you for your order. You&apos;ll receive a confirmation email
        shortly.
      </p>

      {/* Order number */}
      <div className="mt-8 rounded-sm border border-border bg-brand-primary px-6 py-4">
        <p className="font-accent text-xs uppercase tracking-widest text-text-secondary">
          Order Number
        </p>
        <p className="mt-1 font-body text-xl font-medium text-text-primary">
          {orderNumber}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/collections"
          className="inline-flex items-center justify-center gap-2 rounded bg-brand-gold px-8 py-3.5 font-accent text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// ─── Page (wraps in Suspense) ─────────────────────────────────────────

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="font-body text-sm text-text-secondary">Loading…</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
