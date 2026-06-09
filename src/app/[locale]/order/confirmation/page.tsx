"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle } from "@phosphor-icons/react";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";
  const email = params.get("email") || "";

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-8">
      <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" weight="light" />
      <h1 className="mt-6 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
        Order Confirmed
      </h1>
      <p className="mt-3 font-body text-sm text-text-secondary">
        Thank you for your order. We'll send a confirmation to {email || "your email"}.
      </p>

      {orderNumber && (
        <div className="mt-8 inline-block rounded-sm border border-border bg-brand-primary px-8 py-5">
          <p className="font-medium text-xs uppercase tracking-widest text-text-secondary">Order Number</p>
          <p className="mt-1 font-display text-2xl tracking-wider text-brand-gold">{orderNumber}</p>
        </div>
      )}

      <div className="mt-10 space-y-4">
        <Link
          href={`/en/order/tracking?email=${encodeURIComponent(email)}&order=${orderNumber}`}
          className="inline-block rounded bg-brand-dark px-10 py-4 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90"
        >
          Track Your Order
        </Link>
        <br />
        <Link href="/" className="inline-block font-body text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-body text-sm text-text-secondary">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
