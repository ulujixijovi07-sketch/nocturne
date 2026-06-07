"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OrderItem = { id: number; productId: number; productName: string; unitPrice: number; quantity: number; subtotal: number; variantSku: string | null };
type Order = { id: number; orderNumber: string; status: string; total: number; createdAt: string; items: OrderItem[] };

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Paid", color: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  REFUNDED: { label: "Refunded", color: "bg-red-100 text-red-600" },
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/orders", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load orders");
        return r.json();
      })
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">My Orders</h1>

      {loading ? (
        <p className="mt-8 text-center font-body text-sm text-text-secondary">Loading…</p>
      ) : error ? (
        <p className="mt-8 text-center font-body text-sm text-text-secondary">{error}</p>
      ) : orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="font-display text-lg text-text-primary">No orders yet</p>
          <p className="mt-2 font-body text-sm text-text-secondary">Start shopping to see your orders here.</p>
          <Link href="/en" className="mt-6 inline-block rounded bg-brand-dark px-6 py-2.5 font-medium text-xs uppercase tracking-widest text-text-light">Shop Now</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded border border-border bg-brand-primary p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-xs tracking-wider text-text-secondary">ORDER #{order.orderNumber}</p>
                  <p className="mt-0.5 font-body text-xs text-text-secondary/60">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <span className={cn("rounded-full px-3 py-0.5 font-body text-xs font-medium", STATUS[order.status]?.color || "bg-gray-100 text-gray-600")}>
                  {STATUS[order.status]?.label || order.status}
                </span>
              </div>

              <div className="mt-4 divide-y divide-border/50">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3">
                    <div className="flex-1">
                      <Link href={`/en/products/${item.productId}`} className="font-body text-sm text-text-primary hover:text-brand-gold transition-colors">
                        {item.productName}
                      </Link>
                      {item.variantSku && <p className="mt-0.5 font-body text-xs text-text-secondary/60">{item.variantSku}</p>}
                    </div>
                    <p className="font-body text-sm text-text-secondary">Qty: {item.quantity}</p>
                    <p className="font-body text-sm text-text-primary">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center border-t border-border pt-4">
                <p className="font-body text-sm text-text-secondary">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                <p className="font-display text-lg text-text-primary">${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
