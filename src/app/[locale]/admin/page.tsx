"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Star, SquaresFour, CheckCircle, Plus, FileText, ArrowSquareOut, Spinner } from "@phosphor-icons/react";

interface Product {
  id: number; name: string; slug: string; price: number; isActive: boolean;
  collection?: { id: number; name: string } | null;
}

interface OrderSummary {
  id: number; orderNumber: string; status: string; total: number; createdAt: string;
  items: { productId: number; productName: string; quantity: number }[];
}

interface Stat {
  label: string; value: number | string;
  icon: React.ComponentType<{ className?: string }>; color: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, reviewRes, colRes, orderRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/reviews"),
          fetch("/api/collections"),
          fetch("/api/admin/orders?limit=100"),
        ]);
        const prods: Product[] = prodRes.ok ? await prodRes.json() : [];
        const reviews: unknown[] = reviewRes.ok ? await reviewRes.json() : [];
        const cols: unknown[] = colRes.ok ? await colRes.json() : [];
        const orderData = orderRes.ok ? await orderRes.json() : { orders: [] };

        setProducts(Array.isArray(prods) ? prods : []);
        setReviewCount(Array.isArray(reviews) ? reviews.length : 0);
        setCollectionCount(Array.isArray(cols) ? cols.length : 0);
        setOrders(orderData.orders || []);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const activeCount = products.filter((p) => p.isActive).length;

  const stats: Stat[] = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-brand-gold" },
    { label: "Total Reviews", value: reviewCount, icon: Star, color: "text-brand-burgundy" },
    { label: "Total Orders", value: orders.length, icon: SquaresFour, color: "text-brand-blush" },
    { label: "Active", value: `${activeCount} / ${products.length}`, icon: CheckCircle, color: "text-emerald-500" },
  ];

  // ── 7-day revenue ──────────────────────────────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
    return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), ts: d.getTime(), total: 0, count: 0 };
  });

  orders.forEach((o) => {
    if (o.status === "CANCELLED" || o.status === "REFUNDED") return;
    const ot = new Date(o.createdAt).getTime();
    const day = last7Days.find((d) => ot >= d.ts && ot < d.ts + 86400000);
    if (day) { day.total += o.total; day.count++; }
  });

  const maxRevenue = Math.max(...last7Days.map((d) => d.total), 1);

  // ── Top 5 products ─────────────────────────────────────────────────
  const productSales = new Map<number, { name: string; qty: number; revenue: number }>();
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const existing = productSales.get(item.productId) || { name: item.productName, qty: 0, revenue: 0 };
      existing.qty += item.quantity || 1;
      existing.revenue += item.quantity || 1;
      productSales.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productSales.entries())
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  const recentProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 5);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner className="h-6 w-6 animate-spin text-brand-gold" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">Dashboard</h1>
        <p className="mt-1 font-body text-sm text-text-secondary">Overview of your store</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-border bg-brand-dark p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[11px] uppercase tracking-widest text-text-light/50">{s.label}</p>
              <s.icon className={`${s.color} h-[18px] w-[18px]`} />
            </div>
            <p className="mt-2 font-display text-3xl font-light text-text-light">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart + Top products row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 7-day revenue bar chart */}
        <div className="rounded-sm border border-border bg-brand-dark p-6">
          <h2 className="font-display text-lg font-light tracking-[0.05em] text-text-primary mb-4">Revenue (7 Days)</h2>
          {orders.length === 0 ? (
            <p className="py-10 text-center font-body text-sm text-text-secondary">No order data yet</p>
          ) : (
            <div className="space-y-3">
              {last7Days.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="w-12 text-right font-body text-xs text-text-secondary/60">{d.date}</span>
                  <div className="flex-1 h-6 bg-brand-secondary/30 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-brand-gold/80 rounded-sm transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((d.total / maxRevenue) * 100, 2)}%` }}
                    >
                      {d.total > 0 && <span className="font-body text-[10px] text-brand-dark font-medium">${d.total.toFixed(0)}</span>}
                    </div>
                  </div>
                  <span className="w-8 text-left font-body text-[10px] text-text-secondary/40">{d.count} ord</span>
                </div>
              ))}
              <div className="pt-2 text-right font-body text-xs text-text-secondary">
                Total: ${last7Days.reduce((s, d) => s + d.total, 0).toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Top 5 products */}
        <div className="rounded-sm border border-border bg-brand-dark p-6">
          <h2 className="font-display text-lg font-light tracking-[0.05em] text-text-primary mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="py-10 text-center font-body text-sm text-text-secondary">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map(([pid, data], i) => (
                <div key={pid} className="flex items-center gap-3">
                  <span className={i === 0 ? "text-brand-gold font-bold" : i === 1 ? "text-text-secondary/60" : i === 2 ? "text-text-secondary/40" : "text-text-secondary/30"}>
                    #{i + 1}
                  </span>
                  <span className="flex-1 font-body text-sm text-text-light truncate">{data.name}</span>
                  <span className="font-body text-xs text-text-secondary">{data.qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 font-display text-lg font-light tracking-[0.05em] text-text-primary">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/en/admin/products" className="inline-flex items-center gap-2 rounded bg-brand-dark px-5 py-2.5 font-medium text-xs uppercase tracking-wider text-text-light transition-colors hover:bg-brand-dark/90">
            <Plus size={14} /> Add Product
          </Link>
          <Link href="/en/admin/reviews" className="inline-flex items-center gap-2 rounded bg-brand-dark px-5 py-2.5 font-medium text-xs uppercase tracking-wider text-text-light transition-colors hover:bg-brand-dark/90">
            <FileText size={14} /> Write Review
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded border border-border bg-brand-primary px-5 py-2.5 font-medium text-xs uppercase tracking-wider text-text-primary transition-colors hover:bg-brand-secondary">
            <ArrowSquareOut size={14} /> View Store
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
                  <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Product</th>
                  <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Collection</th>
                  <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Price</th>
                  <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="bg-brand-primary hover:bg-brand-secondary transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.collection?.name || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 font-medium text-[10px] uppercase tracking-wider ${p.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-text-secondary/10 text-text-secondary"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-sm border border-border bg-brand-primary px-4 py-8 text-center font-body text-sm text-text-secondary">No products yet.</p>
        )}
      </div>
    </div>
  );
}
