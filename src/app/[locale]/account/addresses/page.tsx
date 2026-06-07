"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  PencilSimple,
  Trash,
  Star,
  X,
  Check,
  Spinner,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────

type Address = {
  id: number;
  userId: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
};

const EMPTY_FORM: Omit<Address, "id" | "userId" | "createdAt"> & {
  id?: number;
} = {
  label: "Home",
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  isDefault: false,
};

const LABELS = ["Home", "Office", "Other"] as const;
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
];

// ─── Page ──────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Check session
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setIsLoggedIn(!!data?.user);
        setSessionLoading(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setSessionLoading(false);
      });
  }, []);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchAddresses();
  }, [isLoggedIn, fetchAddresses]);

  // Open add modal
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setError(null);
    setModalOpen(true);
  };

  // Open edit modal
  const openEdit = (addr: Address) => {
    setForm({
      id: addr.id,
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setError(null);
    setModalOpen(true);
  };

  // Save (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const method = form.id ? "PUT" : "POST";
    try {
      const res = await fetch("/api/account/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchAddresses();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save address");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/account/addresses?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        fetchAddresses();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  // Set default
  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch("/api/account/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch {
      // silently fail
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-5 w-5 animate-spin text-text-secondary/50" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-8">
        <MapPin className="mx-auto h-12 w-12 text-text-secondary/40" />
        <h1 className="mt-6 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Sign in to manage addresses
        </h1>
        <p className="mt-3 font-body text-sm text-text-secondary">
          Save your shipping addresses for faster checkout.
        </p>
        <Link
          href="/auth/signin"
          className="mt-8 inline-block rounded bg-brand-gold px-10 py-4 font-medium text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">
            My Addresses
          </h1>
          <p className="mt-1 font-body text-sm text-text-secondary">
            Manage your shipping and billing addresses.
          </p>
        </div>
        {addresses.length > 0 && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2 font-medium text-xs uppercase tracking-widest text-text-primary transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-12 flex justify-center">
          <Spinner className="h-5 w-5 animate-spin text-text-secondary/50" />
        </div>
      )}

      {/* Address list */}
      {!loading && addresses.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "relative rounded border bg-brand-primary p-5 transition-colors",
                addr.isDefault
                  ? "border-brand-gold/60"
                  : "border-border hover:border-brand-gold/30"
              )}
            >
              {/* Default badge */}
              {addr.isDefault && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-brand-gold/10 px-2 py-0.5 font-medium text-[9px] uppercase tracking-wider text-brand-gold">
                  <Star className="h-2.5 w-2.5 fill-brand-gold" />
                  Default
                </span>
              )}

              {/* Label */}
              <p className="font-medium text-xs uppercase tracking-widest text-text-secondary">
                {addr.label}
              </p>

              {/* Details */}
              <p className="mt-2 font-body text-sm font-medium text-text-primary">
                {addr.name}
              </p>
              <p className="font-body text-sm text-text-secondary">
                {addr.street}
              </p>
              <p className="font-body text-sm text-text-secondary">
                {addr.city}, {addr.state} {addr.zip}
              </p>
              <p className="font-body text-sm text-text-secondary">
                {addr.country}
              </p>
              {addr.phone && (
                <p className="mt-1 font-body text-xs text-text-secondary">
                  {addr.phone}
                </p>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <button
                  onClick={() => openEdit(addr)}
                  className="inline-flex items-center gap-1 font-body text-xs text-text-secondary transition-colors hover:text-text-primary"
                >
                  <PencilSimple className="h-3 w-3" />
                  Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="inline-flex items-center gap-1 font-body text-xs text-text-secondary transition-colors hover:text-brand-gold"
                  >
                    <Star className="h-3 w-3" />
                    Default
                  </button>
                )}
                <button
                  onClick={() => setDeleteId(addr.id)}
                  className="ml-auto inline-flex items-center gap-1 font-body text-xs text-text-secondary/60 transition-colors hover:text-brand-burgundy"
                >
                  <Trash className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && addresses.length === 0 && (
        <div className="mt-16 text-center">
          <MapPin className="mx-auto h-12 w-12 text-text-secondary/40" />
          <h2 className="mt-4 font-display text-xl font-light tracking-[0.1em] text-text-primary">
            No addresses saved
          </h2>
          <p className="mt-2 font-body text-sm text-text-secondary">
            Add a shipping or billing address to speed up checkout.
          </p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 rounded bg-brand-gold px-8 py-3.5 font-medium text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>
      )}

      {/* ── Modal: Add / Edit ──────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded border border-border bg-brand-primary p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-light tracking-[0.08em] text-text-primary">
                {form.id ? "Edit Address" : "New Address"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-text-secondary transition-colors hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Label */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Label
                </label>
                <div className="flex gap-2">
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setForm({ ...form, label: l })}
                      className={cn(
                        "rounded border px-3 py-1.5 font-body text-xs transition-colors",
                        form.label === l
                          ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                          : "border-border text-text-secondary hover:border-brand-gold/40"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="Jane Doe"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Street */}
              <div>
                <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) =>
                    setForm({ ...form, street: e.target.value })
                  }
                  className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="123 Main St, Apt 4B"
                />
              </div>

              {/* City / State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
              </div>

              {/* ZIP / Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    ZIP / Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-[10px] uppercase tracking-widest text-text-secondary">
                    Country
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border text-brand-gold"
                />
                <span className="font-body text-xs text-text-secondary">
                  Set as default address
                </span>
              </label>

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
                {saving ? "Saving…" : form.id ? "Save Changes" : "Add Address"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation dialog ─────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative w-full max-w-sm rounded border border-border bg-brand-primary p-6 shadow-2xl text-center">
            <Trash className="mx-auto h-8 w-8 text-brand-burgundy/60" />
            <h3 className="mt-4 font-display text-lg font-light text-text-primary">
              Delete Address?
            </h3>
            <p className="mt-2 font-body text-sm text-text-secondary">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded border border-border py-2.5 font-medium text-xs uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 rounded bg-brand-burgundy py-2.5 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-brand-burgundy/90 disabled:opacity-50"
              >
                {saving ? "…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
