"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, ChevronLeft, ChevronRight, Download } from "lucide-react";

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
  itemsCount: number;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  REFUNDED: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("sort", "createdAt_desc");

      try {
        const res = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await res.json();
        setOrders(data.orders || []);
        setPagination(
          data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
        );
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleCreateTestOrder = async () => {
    await fetch("/api/admin/orders", { method: "POST" });
    fetchOrders(pagination.page);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("format", "csv");
    window.open(`/api/admin/orders?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">
            Orders
          </h1>
          <p className="mt-1 font-body text-sm text-text-secondary">
            {pagination.total} order{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="rounded border border-border bg-brand-primary px-5 py-2.5 font-accent text-xs uppercase tracking-widest text-text-secondary transition-colors hover:bg-brand-secondary hover:text-text-primary">
            <Download className="inline h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </button>
          <button onClick={handleCreateTestOrder} className="rounded bg-brand-dark px-5 py-2.5 font-accent text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90">
            + Test Order
          </button>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name or email..."
            className="w-full rounded border border-border bg-brand-primary py-2.5 pl-10 pr-4 font-body text-sm text-text-primary placeholder:text-text-secondary/50 outline-none transition-colors focus:border-brand-gold"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-w-[160px] rounded border border-border bg-brand-primary px-3 py-2.5 font-body text-sm text-text-primary outline-none transition-colors focus:border-brand-gold"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-sm border border-border bg-brand-primary px-6 py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-secondary">
            <ShoppingBag className="h-7 w-7 text-brand-gold" />
          </div>
          <h2 className="font-display text-xl font-light text-text-primary">
            No Orders Yet
          </h2>
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-text-secondary">
            Orders will appear here once customers start purchasing. Create a
            test order to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-sm border border-border">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-secondary">
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                    Order #
                  </th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                    Customer
                  </th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                    Items
                  </th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                    Total
                  </th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-3 font-accent text-[11px] uppercase tracking-wider text-text-secondary">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() =>
                      router.push(`/en/admin/orders/${order.id}`)
                    }
                    className="cursor-pointer bg-brand-primary transition-colors hover:bg-brand-secondary"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-medium text-brand-gold">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-text-primary">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-center text-text-secondary">
                      {order.itemsCount}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-text-primary">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 font-accent text-[10px] uppercase tracking-wider ${
                          STATUS_BADGE[order.status] ||
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-text-secondary">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded border border-border bg-brand-primary p-2 text-text-secondary transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchOrders(p)}
                    className={`rounded px-3 py-1.5 font-body text-xs transition-colors ${
                      p === pagination.page
                        ? "bg-brand-dark text-text-light"
                        : "border border-border bg-brand-primary text-text-secondary hover:bg-brand-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded border border-border bg-brand-primary p-2 text-text-secondary transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
