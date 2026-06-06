"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Star, LayoutGrid, CheckCircle, Plus, FileText, ExternalLink, Loader2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  isActive: boolean;
  collection?: { id: number; name: string } | null;
}

interface Stat {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, reviewRes, colRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/reviews"),
          fetch("/api/collections"),
        ]);
        const prods: Product[] = prodRes.ok ? await prodRes.json() : [];
        const reviews: unknown[] = reviewRes.ok ? await reviewRes.json() : [];
        const cols: unknown[] = colRes.ok ? await colRes.json() : [];

        setProducts(Array.isArray(prods) ? prods : []);
        setReviewCount(Array.isArray(reviews) ? reviews.length : 0);
        setCollectionCount(Array.isArray(cols) ? cols.length : 0);
      } catch {
        // API errors — leave counts at 0
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeCount = products.filter((p) => p.isActive).length;

  const stats: Stat[] = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-brand-gold" },
    { label: "Total Reviews", value: reviewCount, icon: Star, color: "text-brand-burgundy" },
    { label: "Collections", value: collectionCount, icon: LayoutGrid, color: "text-brand-blush" },
    { label: "Active", value: `${activeCount} / ${products.length}`, icon: CheckCircle, color: "text-emerald-500" },
  ];

  const recentProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">Dashboard</h1>
        <p className="mt-1 font-body text-sm text-text-secondary">Overview of your store</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-border bg-brand-dark p-5">
            <div className="flex items-center justify-between">
              <p className="font-accent text-[11px] uppercase tracking-widest text-text-light/50">{s.label}</p>
              <s.icon className={`${s.color} h-[18px] w-[18px]`} />
            </div>
            <p className="mt-2 font-display text-3xl font-light text-text-light">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 font-display text-lg font-light tracking-[0.05em] text-text-primary">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded bg-brand-dark px-5 py-2.5 font-accent text-xs uppercase tracking-wider text-text-light transition-colors hover:bg-brand-dark/90"
          >
            <Plus size={14} /> Add Product
          </Link>
          <Link
            href="/admin/reviews"
            className="inline-flex items-center gap-2 rounded bg-brand-dark px-5 py-2.5 font-accent text-xs uppercase tracking-wider text-text-light transition-colors hover:bg-brand-dark/90"
          >
            <FileText size={14} /> Write Review
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded border border-border bg-brand-primary px-5 py-2.5 font-accent text-xs uppercase tracking-wider text-text-primary transition-colors hover:bg-brand-secondary"
          >
            <ExternalLink size={14} /> View Store
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div>
        <h2 className="mb-3 font-display text-lg font-light tracking-[0.05em] text-text-primary">Recent Products</h2>
        {recentProducts.length > 0 ? (
          <div className="overflow-x-auto rounded-sm border border-border">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-secondary">
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">Product</th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">Collection</th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">Price</th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="bg-brand-primary hover:bg-brand-secondary transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.collection?.name || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-accent text-[10px] uppercase tracking-wider ${
                          p.isActive
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-text-secondary/10 text-text-secondary"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-sm border border-border bg-brand-primary px-4 py-8 text-center font-body text-sm text-text-secondary">
            No products yet.
          </p>
        )}
      </div>

      {/* Revenue placeholder */}
      <div className="rounded-sm border border-border bg-brand-primary px-6 py-12 text-center">
        <p className="font-body text-sm text-text-secondary">Revenue chart coming soon</p>
      </div>
    </div>
  );
}
