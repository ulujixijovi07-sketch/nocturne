"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  X,
  Gift,
  Percent,
  CurrencyDollar,
  Spinner,
  Trash,
  Power,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────

type PromoCode = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  recipientEmail: string | null;
  senderName: string | null;
  message: string | null;
  isGiftCard: boolean;
  createdAt: string;
};

type PromoForm = {
  code: string;
  type: string;
  value: string;
  minOrderAmount: string;
  maxUses: string;
  expiresAt: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  isGiftCard: boolean;
};

const EMPTY_FORM: PromoForm = {
  code: "",
  type: "percentage",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  expiresAt: "",
  recipientEmail: "",
  senderName: "",
  message: "",
  isGiftCard: false,
};

// ─── Helpers ────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function AdminPromosPage() {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PromoForm>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos");
      if (res.ok) {
        const data = await res.json();
        setPromos(data.promos || []);
      }
    } catch {
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  // Copy code to clipboard
  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied!");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Toggle active/inactive
  const handleToggle = async (promo: PromoCode) => {
    try {
      const res = await fetch("/api/admin/promos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promo.id, isActive: !promo.isActive }),
      });
      if (res.ok) {
        toast.success(
          promo.isActive ? "Promo deactivated" : "Promo activated"
        );
        fetchPromos();
      } else {
        toast.error("Failed to update promo");
      }
    } catch {
      toast.error("Failed to update promo");
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/promos?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Promo deleted");
        fetchPromos();
      } else {
        toast.error("Failed to delete promo");
      }
    } catch {
      toast.error("Failed to delete promo");
    }
  };

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        type: form.type,
        value: parseFloat(form.value),
        isGiftCard: form.isGiftCard,
      };

      if (form.minOrderAmount)
        body.minOrderAmount = parseFloat(form.minOrderAmount);
      if (form.maxUses) body.maxUses = parseInt(form.maxUses);
      if (form.expiresAt) body.expiresAt = form.expiresAt;
      if (form.recipientEmail) body.recipientEmail = form.recipientEmail;
      if (form.senderName) body.senderName = form.senderName;
      if (form.message) body.message = form.message;
      if (form.code && !form.isGiftCard) body.code = form.code;

      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(
          form.isGiftCard
            ? `Gift card ${data.promo.code} created!`
            : `Promo ${data.promo.code} created!`
        );
        setModalOpen(false);
        setForm({ ...EMPTY_FORM });
        fetchPromos();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create promo");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">
            Promotions & Gift Cards
          </h1>
          <p className="mt-1 font-body text-sm text-text-secondary">
            Manage discount codes and gift cards.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ ...EMPTY_FORM });
            setError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-medium text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-border bg-brand-primary p-4">
            <p className="font-medium text-[10px] uppercase tracking-widest text-text-secondary">
              Total
            </p>
            <p className="mt-1 font-display text-2xl font-light text-text-primary">
              {promos.length}
            </p>
          </div>
          <div className="rounded border border-border bg-brand-primary p-4">
            <p className="font-medium text-[10px] uppercase tracking-widest text-text-secondary">
              Active
            </p>
            <p className="mt-1 font-display text-2xl font-light text-brand-gold">
              {promos.filter((p) => p.isActive && !isExpired(p.expiresAt))
                .length}
            </p>
          </div>
          <div className="rounded border border-border bg-brand-primary p-4">
            <p className="font-medium text-[10px] uppercase tracking-widest text-text-secondary">
              Gift Cards
            </p>
            <p className="mt-1 font-display text-2xl font-light text-text-primary">
              {promos.filter((p) => p.isGiftCard).length}
            </p>
          </div>
          <div className="rounded border border-border bg-brand-primary p-4">
            <p className="font-medium text-[10px] uppercase tracking-widest text-text-secondary">
              Used
            </p>
            <p className="mt-1 font-display text-2xl font-light text-text-primary">
              {promos.reduce((sum, p) => sum + p.usedCount, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded border border-border">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-5 w-5 animate-spin text-text-secondary/50" />
          </div>
        ) : promos.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="mx-auto h-10 w-10 text-text-secondary/30" />
            <p className="mt-4 font-body text-sm text-text-secondary">
              No promotions yet. Create your first promo or gift card.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded border border-border px-4 py-2 font-medium text-xs uppercase tracking-widest text-text-secondary transition-colors hover:border-brand-gold hover:text-brand-gold"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Promo
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-brand-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Code
                </th>
                <th className="px-4 py-3 text-left font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Value
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-[10px] uppercase tracking-widest text-text-secondary sm:table-cell">
                  Min Order
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-[10px] uppercase tracking-widest text-text-secondary md:table-cell">
                  Used
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-[10px] uppercase tracking-widest text-text-secondary sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promos.map((promo) => {
                const expired = isExpired(promo.expiresAt);
                const active = promo.isActive && !expired;

                return (
                  <tr
                    key={promo.id}
                    className={cn(
                      "transition-colors hover:bg-brand-secondary/30",
                      !active && "opacity-50"
                    )}
                  >
                    {/* Code */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {promo.isGiftCard ? (
                          <Gift className="h-3.5 w-3.5 text-brand-gold" />
                        ) : promo.type === "percentage" ? (
                          <Percent className="h-3.5 w-3.5 text-text-secondary" />
                        ) : (
                          <CurrencyDollar className="h-3.5 w-3.5 text-text-secondary" />
                        )}
                        <span className="font-mono text-sm font-medium text-text-primary">
                          {promo.code}
                        </span>
                        <button
                          onClick={() => handleCopy(promo.code)}
                          className="text-text-secondary/40 transition-colors hover:text-brand-gold"
                          title="Copy code"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="h-3 w-3 text-brand-gold" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      {promo.isGiftCard && promo.recipientEmail && (
                        <p className="mt-0.5 font-body text-[10px] text-text-secondary/60">
                          To: {promo.recipientEmail}
                        </p>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium text-[9px] uppercase tracking-wider",
                          promo.isGiftCard
                            ? "bg-brand-gold/10 text-brand-gold"
                            : promo.type === "percentage"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        )}
                      >
                        {promo.isGiftCard
                          ? "Gift Card"
                          : promo.type === "percentage"
                            ? "% Off"
                            : "Fixed"}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3 font-mono text-sm text-text-primary">
                      {promo.type === "percentage"
                        ? `${promo.value}%`
                        : `$${promo.value.toFixed(2)}`}
                    </td>

                    {/* Min Order */}
                    <td className="hidden px-4 py-3 font-mono text-sm text-text-secondary sm:table-cell">
                      {promo.minOrderAmount
                        ? `$${promo.minOrderAmount.toFixed(2)}`
                        : "—"}
                    </td>

                    {/* Used */}
                    <td className="hidden px-4 py-3 font-mono text-sm text-text-secondary md:table-cell">
                      {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                    </td>

                    {/* Status */}
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium text-[9px] uppercase tracking-wider",
                          active
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-brand-burgundy/10 text-brand-burgundy"
                        )}
                      >
                        {active ? "Active" : expired ? "Expired" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(promo)}
                          className="rounded p-1.5 text-text-secondary/60 transition-colors hover:text-text-primary"
                          title={active ? "Deactivate" : "Activate"}
                        >
                          {active ? (
                            <Power className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="rounded p-1.5 text-text-secondary/60 transition-colors hover:text-brand-burgundy"
                          title="Delete"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create Modal ────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg rounded border border-border bg-brand-primary p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-light tracking-[0.08em] text-text-primary">
                Create Promotion
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-text-secondary transition-colors hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Gift Card toggle */}
              <label className="flex items-center gap-3 rounded border border-border bg-brand-secondary/30 p-3 cursor-pointer">
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-text-primary">
                    Gift Card
                  </p>
                  <p className="font-body text-xs text-text-secondary">
                    Auto-generates code and enables recipient fields
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.isGiftCard}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      isGiftCard: e.target.checked,
                      code: e.target.checked ? "" : form.code,
                      type: e.target.checked ? "fixed" : form.type,
                    });
                  }}
                  className="h-4 w-4 rounded border-border text-brand-gold"
                />
              </label>

              {/* Type */}
              {!form.isGiftCard && (
                <div>
                  <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    Discount Type *
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "percentage", label: "Percentage" },
                      { value: "fixed", label: "Fixed Amount" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        className={cn(
                          "flex-1 rounded border px-3 py-2 font-body text-sm transition-colors",
                          form.type === t.value
                            ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                            : "border-border text-text-secondary hover:border-brand-gold/40"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Code (manual for promos, auto-generate hint for gift cards) */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  {form.isGiftCard ? "Code (auto-generated)" : "Code *"}
                </label>
                <input
                  type="text"
                  required={!form.isGiftCard}
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  disabled={form.isGiftCard}
                  className={cn(
                    "w-full rounded border border-border bg-transparent px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold",
                    form.isGiftCard && "bg-brand-secondary/50 text-text-secondary"
                  )}
                  placeholder={
                    form.isGiftCard ? "NC-GIFT-XXXX" : "e.g. SUMMER20"
                  }
                />
              </div>

              {/* Value */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Value *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-secondary">
                    {form.type === "fixed" || form.isGiftCard ? "$" : ""}
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                    className={cn(
                      "w-full rounded border border-border bg-transparent py-2.5 font-mono text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold",
                      (form.type === "fixed" || form.isGiftCard)
                        ? "pl-7 pr-3"
                        : "px-3"
                    )}
                    placeholder="0"
                  />
                  {form.type === "percentage" && !form.isGiftCard && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-secondary">
                      %
                    </span>
                  )}
                </div>
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Min Order Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm({ ...form, minOrderAmount: e.target.value })
                  }
                  className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="No minimum"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Max Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: e.target.value })
                  }
                  className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="Unlimited"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-mono text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
              </div>

              {/* Gift Card specific fields */}
              {form.isGiftCard && (
                <>
                  <div className="border-t border-border pt-4">
                    <p className="font-medium text-[10px] uppercase tracking-widest text-text-secondary mb-3">
                      Recipient Details
                    </p>
                  </div>

                  {/* Recipient Email */}
                  <div>
                    <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={form.recipientEmail}
                      onChange={(e) =>
                        setForm({ ...form, recipientEmail: e.target.value })
                      }
                      className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      placeholder="recipient@example.com"
                    />
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={form.senderName}
                      onChange={(e) =>
                        setForm({ ...form, senderName: e.target.value })
                      }
                      className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                      Gift Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none"
                      placeholder="Enjoy your gift!"
                    />
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <p className="font-body text-xs text-brand-burgundy">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  "w-full rounded py-3 font-medium text-xs font-medium uppercase tracking-widest transition-colors",
                  saving
                    ? "cursor-not-allowed bg-brand-secondary text-text-secondary"
                    : "bg-brand-dark text-text-light hover:bg-brand-dark/90"
                )}
              >
                {saving
                  ? "Creating…"
                  : form.isGiftCard
                    ? "Create Gift Card"
                    : "Create Promo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
