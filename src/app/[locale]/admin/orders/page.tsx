"use client";

import { ShoppingBag } from "lucide-react";

const COLUMNS = ["Order #", "Customer", "Items", "Total", "Status", "Date", "Actions"];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">Orders</h1>
        <p className="mt-1 font-body text-sm text-text-secondary">Manage customer orders</p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center rounded-sm border border-border bg-brand-primary px-6 py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-secondary">
          <ShoppingBag className="h-7 w-7 text-brand-gold" />
        </div>
        <h2 className="font-display text-xl font-light text-text-primary">
          No Orders Yet
        </h2>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-text-secondary">
          Orders will appear here once customers start purchasing. Your store is ready to accept orders.
        </p>
      </div>

      {/* Placeholder table */}
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-border bg-brand-secondary">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-accent text-[11px] uppercase tracking-wider text-text-secondary"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td colSpan={COLUMNS.length} className="px-4 py-6">
                <p className="text-center font-body text-sm text-text-secondary/60">
                  No orders to display
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
