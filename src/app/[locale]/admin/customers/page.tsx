"use client";

import { useState, useEffect } from "react";
import { Users } from "@phosphor-icons/react";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { wishlistItems: number; addresses: number };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then(r => r.json())
      .then(data => { setCustomers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="font-body text-sm text-text-secondary">Loading...</p>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">
          Customers ({customers.length})
        </h1>
      </div>

      {customers.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-text-secondary">No customers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-secondary">
                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Name</th>
                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Email</th>
                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Role</th>
                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Wishlist</th>
                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Addresses</th>
                <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-text-secondary">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {customers.map((c) => (
                <tr key={c.id} className="bg-brand-primary">
                  <td className="px-4 py-3 font-medium text-text-primary">{c.name || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${c.role === "ADMIN" ? "bg-brand-gold/20 text-brand-gold" : "bg-brand-secondary text-text-secondary"}`}>
                      {c.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c._count.wishlistItems}</td>
                  <td className="px-4 py-3 text-text-secondary">{c._count.addresses}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary/60">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
