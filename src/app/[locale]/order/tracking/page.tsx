"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Package } from "lucide-react";

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Paid", color: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  REFUNDED: { label: "Refunded", color: "bg-red-100 text-red-600" },
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [autoTracking, setAutoTracking] = useState(false);

  // Auto-fill from URL params (after guest checkout)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const orderParam = searchParams.get("order");
    if (emailParam && orderParam) {
      setEmail(emailParam);
      setOrderNumber(orderParam);
      setAutoTracking(true);
    }
  }, [searchParams]);

  // Auto-track when coming from checkout
  useEffect(() => {
    if (autoTracking && email && orderNumber) {
      setAutoTracking(false);
      handleTrackSubmit(email, orderNumber);
    }
  }, [autoTracking, email, orderNumber]);

  const handleTrackSubmit = async (trackEmail: string, trackOrder: string) => {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(
        `/api/track-order?email=${encodeURIComponent(trackEmail.trim())}&orderNumber=${encodeURIComponent(trackOrder.trim().toUpperCase())}`
      );
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !orderNumber.trim()) return;
    handleTrackSubmit(email, orderNumber);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary text-center">
        Track Your Order
      </h1>
      {order && orderNumber && (
        <div className="mt-4 rounded border border-brand-gold/30 bg-brand-gold/5 p-4 text-center">
          <p className="font-body text-sm text-text-primary">
            Your order <span className="font-mono font-bold text-brand-gold">{orderNumber}</span> has been placed!
          </p>
          <p className="mt-1 font-body text-xs text-text-secondary">
            Save this order number to track your delivery status anytime.
          </p>
        </div>
      )}
      <p className="mt-2 text-center font-body text-sm text-text-secondary">
        Enter your email and order number to check your order status.
      </p>

      <form onSubmit={handleTrack} className="mt-8 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="flex-1 rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          placeholder="Order number (e.g. NC-XXXXXX-XXX)"
          required
          className="flex-1 rounded-sm border border-border bg-transparent px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-sm bg-brand-dark px-8 py-3 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 disabled:opacity-50 transition-colors"
        >
          <Search className="h-4 w-4" />
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded border border-brand-burgundy/30 bg-brand-burgundy/5 p-6 text-center">
          <p className="font-body text-sm text-brand-burgundy">{error}</p>
          <p className="mt-2 font-body text-xs text-text-secondary">
            Make sure your email matches the one used at checkout.
          </p>
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          {/* Status card */}
          <div className="rounded border border-border bg-brand-primary p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-accent text-xs tracking-wider text-text-secondary">
                  ORDER #{order.orderNumber}
                </p>
                <p className="mt-1 font-body text-xs text-text-secondary/60">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <span className={cn(
                "rounded-full px-3 py-1 font-body text-xs font-medium",
                STATUS[order.status]?.color || "bg-gray-100 text-gray-600"
              )}>
                {STATUS[order.status]?.label || order.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {["PENDING", "PAID", "SHIPPED", "DELIVERED"].map((s, i) => {
                  const statusOrder = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
                  const currentIdx = statusOrder.indexOf(order.status);
                  const isDone = i <= currentIdx && order.status !== "CANCELLED" && order.status !== "REFUNDED";
                  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
                  return (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        "h-2 w-full",
                        i === 0 ? "rounded-l-full" : "",
                        i === 3 ? "rounded-r-full" : "",
                        isDone && !isCancelled ? "bg-brand-gold" : "bg-border"
                      )} />
                      <span className={cn(
                        "mt-2 font-body text-[10px]",
                        isDone && !isCancelled ? "text-brand-gold" : "text-text-secondary/40"
                      )}>
                        {STATUS[s]?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded border border-border bg-brand-primary p-6">
            <h3 className="font-accent text-xs uppercase tracking-widest text-text-secondary mb-4">Items</h3>
            <div className="divide-y divide-border/50">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-body text-sm text-text-primary">{item.productName}</p>
                    {item.variantSku && <p className="text-xs text-text-secondary/60">{item.variantSku}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm text-text-secondary">Qty: {item.quantity}</p>
                    <p className="font-body text-sm text-text-primary">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4 flex justify-between">
              <span className="font-body text-sm font-medium text-text-primary">Total</span>
              <span className="font-display text-lg text-text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Timeline */}
          {order.events && order.events.length > 0 && (
            <div className="rounded border border-border bg-brand-primary p-6">
              <h3 className="font-accent text-xs uppercase tracking-widest text-text-secondary mb-4">Order Timeline</h3>
              <div className="space-y-3">
                {order.events.map((e: any) => (
                  <div key={e.id} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-brand-gold shrink-0" />
                    <div>
                      <p className="font-body text-sm text-text-primary">{e.eventType.replace(/_/g, " ")}</p>
                      {e.note && <p className="text-xs text-text-secondary">{e.note}</p>}
                      <p className="text-xs text-text-secondary/60">
                        {new Date(e.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking info */}
          {order.trackingNumber && (
            <div className="rounded border border-border bg-brand-primary p-6">
              <h3 className="font-accent text-xs uppercase tracking-widest text-text-secondary mb-2">Tracking</h3>
              <p className="font-mono text-sm text-text-primary">{order.trackingNumber}</p>
              {order.trackingCompany && <p className="text-xs text-text-secondary mt-0.5">via {order.trackingCompany}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
