import Link from "next/link";
import { Package } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-8">
      <Package className="mx-auto h-12 w-12 text-text-secondary/40" />
      <h1 className="mt-6 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
        No orders yet
      </h1>
      <p className="mt-3 font-body text-sm text-text-secondary">
        Your order history will appear here once you make your first purchase.
      </p>
      <Link
        href="/collections"
        className="mt-8 inline-block rounded bg-brand-gold px-10 py-4 font-accent text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
      >
        Start Shopping
      </Link>
    </div>
  );
}
