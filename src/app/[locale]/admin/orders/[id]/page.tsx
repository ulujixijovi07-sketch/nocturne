"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, RefreshCw, Save, Clock } from "lucide-react";

type OrderItem = {
  id: number;
  productName: string;
  variantSku: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

type OrderEvent = {
  id: number;
  eventType: string;
  operatorName: string;
  note: string | null;
  createdAt: string;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: string | null;
  trackingNumber: string | null;
  trackingCompany: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  events: OrderEvent[];
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  REFUNDED: "bg-red-100 text-red-800 border-red-200",
};

const CARRIER_OPTIONS = [
  { value: "", label: "Select carrier..." },
  { value: "DHL", label: "DHL" },
  { value: "FedEx", label: "FedEx" },
  { value: "UPS", label: "UPS" },
  { value: "USPS", label: "USPS" },
  { value: "La Poste", label: "La Poste" },
  { value: "DPD", label: "DPD" },
  { value: "Chronopost", label: "Chronopost" },
];

const EVENT_LABELS: Record<string, string> = {
  STATUS_CHANGE: "Status Changed",
  NOTE_ADDED: "Note Added",
  REFUND_PROCESSED: "Refund Processed",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCompany, setTrackingCompany] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Modals
  const [trackingModal, setTrackingModal] = useState(false);
  const [refundModal, setRefundModal] = useState(false);
  const [tempTracking, setTempTracking] = useState("");
  const [tempCarrier, setTempCarrier] = useState("");

  // Track if notes are dirty
  const [notesDirty, setNotesDirty] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data: Order = await res.json();
      setOrder(data);
      setTrackingNumber(data.trackingNumber || "");
      setTrackingCompany(data.trackingCompany || "");
      setShippingAddress(data.shippingAddress || "");
      setInternalNotes(data.internalNotes || "");
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateOrder = async (fields: Record<string, unknown>) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, operatorName: "Admin" }),
      });
      const data: Order = await res.json();
      setOrder(data);
      setTrackingNumber(data.trackingNumber || "");
      setTrackingCompany(data.trackingCompany || "");
      setShippingAddress(data.shippingAddress || "");
      setInternalNotes(data.internalNotes || "");
    } finally {
      setSaving(false);
    }
  };

  // ─── Status Actions ──────────────────────────────────────────────────

  const markPaid = () => updateOrder({ status: "PAID" });

  const openTrackingModal = () => {
    setTempTracking(trackingNumber || "");
    setTempCarrier(trackingCompany || "DHL");
    setTrackingModal(true);
  };

  const markShipped = async () => {
    await updateOrder({
      status: "SHIPPED",
      trackingNumber: tempTracking,
      trackingCompany: tempCarrier,
    });
    setTrackingModal(false);
  };

  const markDelivered = () => updateOrder({ status: "DELIVERED" });

  const cancelOrder = () => {
    if (!confirm("Cancel this order?")) return;
    updateOrder({ status: "CANCELLED" });
  };

  const openRefundModal = () => setRefundModal(true);

  const refundOrder = async () => {
    await updateOrder({ status: "REFUNDED" });
    setRefundModal(false);
    // Also create a refund event
    await fetch(`/api/admin/orders/${order!.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "REFUND_PROCESSED",
        operatorName: "Admin",
        note: `Order refunded. Previous status: ${order!.status}`,
      }),
    });
    fetchOrder();
  };

  // ─── Save Notes ──────────────────────────────────────────────────────

  const saveNotes = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/orders/${order.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "NOTE_ADDED",
          operatorName: "Admin",
          note: "Internal notes updated",
        }),
      });
    } catch {
      // event creation is best-effort
    }
    await updateOrder({ internalNotes });
    setNotesDirty(false);
  };

  // ─── Helpers ─────────────────────────────────────────────────────────

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ─── Loading / Not Found ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="font-body text-lg text-text-primary">Order not found</p>
        <button
          onClick={() => router.push("/en/admin/orders")}
          className="mt-4 rounded bg-brand-dark px-5 py-2 font-accent text-xs uppercase tracking-widest text-text-light"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/en/admin/orders")}
            className="rounded border border-border bg-brand-primary p-2 text-text-secondary transition-colors hover:bg-brand-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">
              Order {order.orderNumber}
            </h1>
            <p className="mt-0.5 font-body text-xs text-text-secondary">
              Created {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`inline-block rounded-full border px-3 py-1 font-accent text-[11px] uppercase tracking-wider ${
            STATUS_BADGE[order.status] || "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Left Column (60% ≈ 2/3) ────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Overview Card */}
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h2 className="mb-4 font-display text-lg font-light tracking-[0.05em] text-text-primary">
              Order Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                  Order Number
                </p>
                <p className="mt-1 font-mono text-sm font-medium text-brand-gold">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                  Date
                </p>
                <p className="mt-1 font-body text-sm text-text-primary">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                  Customer
                </p>
                <p className="mt-1 font-body text-sm font-medium text-text-primary">
                  {order.customerName}
                </p>
                <p className="font-body text-xs text-text-secondary">
                  {order.customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-sm border border-border bg-brand-primary">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-light tracking-[0.05em] text-text-primary">
                Items ({order.items.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-secondary">
                    <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                      Product
                    </th>
                    <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-right font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-center font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                        {item.variantSku || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-center text-text-primary">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text-primary">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-border px-6 py-4">
              <div className="ml-auto w-full max-w-[240px] space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-text-primary">
                    {order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-brand-burgundy">Discount</span>
                    <span className="text-brand-burgundy">
                      −{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-body text-base font-semibold">
                  <span className="text-text-primary">Total</span>
                  <span className="text-text-primary">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info Card */}
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h2 className="mb-4 font-display text-lg font-light tracking-[0.05em] text-text-primary">
              Shipping Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                  Address
                </p>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    updateOrder({ shippingAddress: e.target.value });
                  }}
                  rows={3}
                  className="mt-1 w-full rounded border border-border bg-brand-secondary px-3 py-2 font-body text-sm text-text-primary outline-none transition-colors focus:border-brand-gold"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                    Tracking Number
                  </p>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => {
                      setTrackingNumber(e.target.value);
                      updateOrder({ trackingNumber: e.target.value });
                    }}
                    placeholder="Not set"
                    className="mt-1 w-full rounded border border-border bg-brand-secondary px-3 py-2 font-mono text-sm text-text-primary outline-none transition-colors focus:border-brand-gold placeholder:text-text-secondary/40"
                  />
                </div>
                <div>
                  <p className="font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                    Carrier
                  </p>
                  <select
                    value={trackingCompany}
                    onChange={(e) => {
                      setTrackingCompany(e.target.value);
                      updateOrder({ trackingCompany: e.target.value });
                    }}
                    className="mt-1 w-full rounded border border-border bg-brand-secondary px-3 py-2 font-body text-sm text-text-primary outline-none transition-colors focus:border-brand-gold"
                  >
                    {CARRIER_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column (40% ≈ 1/3) ───────────────────────────────── */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h2 className="mb-4 font-display text-lg font-light tracking-[0.05em] text-text-primary">
              Actions
            </h2>
            <div className="space-y-2">
              {/* PENDING → PAID */}
              {order.status === "PENDING" && (
                <button
                  onClick={markPaid}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-3 font-accent text-xs uppercase tracking-wider text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Paid
                </button>
              )}

              {/* PAID → SHIPPED */}
              {order.status === "PAID" && (
                <button
                  onClick={openTrackingModal}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded bg-purple-600 px-4 py-3 font-accent text-xs uppercase tracking-wider text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                  <Truck className="h-4 w-4" />
                  Mark as Shipped
                </button>
              )}

              {/* SHIPPED → DELIVERED */}
              {order.status === "SHIPPED" && (
                <button
                  onClick={markDelivered}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded bg-green-600 px-4 py-3 font-accent text-xs uppercase tracking-wider text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Delivered
                </button>
              )}

              {/* Cancel (any except already cancelled/refunded) */}
              {!["CANCELLED", "REFUNDED", "DELIVERED"].includes(
                order.status
              ) && (
                <button
                  onClick={cancelOrder}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 font-accent text-xs uppercase tracking-wider text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </button>
              )}

              {/* Refund (PAID or SHIPPED) */}
              {["PAID", "SHIPPED"].includes(order.status) && (
                <button
                  onClick={openRefundModal}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded border border-orange-200 bg-orange-50 px-4 py-3 font-accent text-xs uppercase tracking-wider text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refund Order
                </button>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-light tracking-[0.05em] text-text-primary">
                Internal Notes
              </h2>
              {notesDirty && (
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded bg-brand-dark px-3 py-1.5 font-accent text-[10px] uppercase tracking-wider text-text-light transition-colors hover:bg-brand-dark/90 disabled:opacity-50"
                >
                  <Save className="h-3 w-3" />
                  {saving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
            <textarea
              value={internalNotes}
              onChange={(e) => {
                setInternalNotes(e.target.value);
                setNotesDirty(true);
              }}
              rows={5}
              placeholder="Add internal notes..."
              className="w-full rounded border border-border bg-brand-secondary px-3 py-2 font-body text-sm text-text-primary outline-none transition-colors focus:border-brand-gold placeholder:text-text-secondary/40"
            />
          </div>

          {/* Event Timeline */}
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h2 className="mb-4 font-display text-lg font-light tracking-[0.05em] text-text-primary">
              Timeline
            </h2>
            {order.events.length === 0 ? (
              <p className="font-body text-xs text-text-secondary">
                No events yet. Status changes and notes will appear here.
              </p>
            ) : (
              <div className="relative space-y-0">
                {order.events.map((event, i) => (
                  <div
                    key={event.id}
                    className={`relative flex gap-3 pb-4 ${
                      i !== order.events.length - 1
                        ? "border-l-2 border-border/60 pl-4"
                        : "pl-4"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-[6px] rounded-full border-2 border-brand-gold bg-brand-primary" />

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-accent text-[10px] uppercase tracking-wider text-brand-gold">
                          {EVENT_LABELS[event.eventType] || event.eventType}
                        </p>
                        <div className="flex items-center gap-1 text-text-secondary/50">
                          <Clock className="h-3 w-3" />
                          <p className="font-body text-[10px]">
                            {formatDateTime(event.createdAt)}
                          </p>
                        </div>
                      </div>
                      {event.note && (
                        <p className="mt-1 font-body text-xs text-text-secondary">
                          {event.note}
                        </p>
                      )}
                      <p className="mt-0.5 font-body text-[10px] text-text-secondary/60">
                        by {event.operatorName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Tracking Modal ───────────────────────────────────────────── */}
      {trackingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50"
          onClick={() => setTrackingModal(false)}
        >
          <div
            className="w-full max-w-sm rounded border border-border bg-brand-primary p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 font-display text-lg font-light tracking-[0.05em] text-text-primary">
              Shipping Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={tempTracking}
                  onChange={(e) => setTempTracking(e.target.value)}
                  placeholder="e.g. 1Z999AA10123456784"
                  className="w-full rounded border border-border bg-brand-secondary px-3 py-2 font-mono text-sm text-text-primary outline-none transition-colors focus:border-brand-gold placeholder:text-text-secondary/40"
                />
              </div>
              <div>
                <label className="mb-1 block font-accent text-[10px] uppercase tracking-wider text-text-secondary">
                  Carrier
                </label>
                <select
                  value={tempCarrier}
                  onChange={(e) => setTempCarrier(e.target.value)}
                  className="w-full rounded border border-border bg-brand-secondary px-3 py-2 font-body text-sm text-text-primary outline-none transition-colors focus:border-brand-gold"
                >
                  {CARRIER_OPTIONS.filter((c) => c.value !== "").map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={markShipped}
                disabled={saving}
                className="flex-1 rounded bg-purple-600 py-3 font-accent text-xs uppercase tracking-widest text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm Shipment"}
              </button>
              <button
                onClick={() => setTrackingModal(false)}
                className="rounded border border-border px-4 py-3 font-accent text-xs text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Refund Modal ─────────────────────────────────────────────── */}
      {refundModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50"
          onClick={() => setRefundModal(false)}
        >
          <div
            className="w-full max-w-sm rounded border border-border bg-brand-primary p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 font-display text-lg font-light tracking-[0.05em] text-text-primary">
              Confirm Refund
            </h3>
            <p className="font-body text-sm text-text-secondary">
              This will mark order{" "}
              <span className="font-medium text-text-primary">
                {order.orderNumber}
              </span>{" "}
              as refunded. The total amount of{" "}
              <span className="font-medium text-text-primary">
                {formatCurrency(order.total)}
              </span>{" "}
              will be returned to the customer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={refundOrder}
                disabled={saving}
                className="flex-1 rounded bg-orange-600 py-3 font-accent text-xs uppercase tracking-widest text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? "Processing..." : "Confirm Refund"}
              </button>
              <button
                onClick={() => setRefundModal(false)}
                className="rounded border border-border px-4 py-3 font-accent text-xs text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
