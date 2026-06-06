"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Review = {
  id: number; productId: number; authorName: string; rating: number;
  title: string | null; body: string | null; isVerified: boolean; createdAt: string;
  product: { name: string };
};

type Product = { id: number; name: string };

// ─── Helpers ───────────────────────────────────────────────────────────

const formatDate = (d: Date): string => d.toISOString().split("T")[0];

const today = new Date();
const ninetyDaysAgo = new Date(today);
ninetyDaysAgo.setDate(today.getDate() - 90);

// ─── Star rendering (supports half stars) ──────────────────────────────

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <>
      {"♥".repeat(full)}
      {half && <span className="text-brand-gold/60">♥</span>}
      {"♡".repeat(empty)}
    </>
  );
}

// ─── Toggle switch sub-component ───────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        on ? "bg-[#C9A96E]" : "bg-border"
      )}
      style={{ accentColor: "transparent" }}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
          on ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// ─── Page component ────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Review | null>(null);
  const [bulk, setBulk] = useState(false);

  // Add / Edit form state
  const [productId, setProductId] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isVerified, setIsVerified] = useState(true);

  // Bulk form state
  const [bulkProductId, setBulkProductId] = useState(0);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkFiveStarPercent, setBulkFiveStarPercent] = useState(75);
  const [bulkDateFrom, setBulkDateFrom] = useState(formatDate(ninetyDaysAgo));
  const [bulkDateTo, setBulkDateTo] = useState(formatDate(today));
  const [bulkVerifiedPercent, setBulkVerifiedPercent] = useState(100);
  const [bulkRandomNames, setBulkRandomNames] = useState(true);
  const [bulkMentionSize, setBulkMentionSize] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    const [revs, prods] = await Promise.all([
      fetch("/api/admin/reviews").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ]);
    setReviews(Array.isArray(revs) ? revs : []);
    setProducts(Array.isArray(prods) ? prods : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Add / Edit modal ────────────────────────────────────────────────

  const openAdd = () => {
    setEdit(null);
    setProductId(0);
    setAuthorName("");
    setRating(5);
    setTitle("");
    setBody("");
    setIsVerified(true);
    setModal(true);
  };

  const openEdit = (r: Review) => {
    setEdit(r);
    setProductId(r.productId);
    setAuthorName(r.authorName);
    setRating(r.rating);
    setTitle(r.title ?? "");
    setBody(r.body ?? "");
    setIsVerified(r.isVerified);
    setModal(true);
  };

  const close = () => { setModal(false); setEdit(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (edit) {
      await fetch(`/api/admin/reviews/${edit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, authorName, rating, title, body, isVerified }),
      });
    } else {
      // Single add — always 5-star, verified, no random name
      await fetch("/api/admin/reviews/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          count: 1,
          fiveStarPercent: 100,
          verifiedPercent: 100,
          randomNames: false,
          mentionSize: false,
        }),
      });
    }
    close();
    fetchData();
  };

  const del = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchData();
  };

  // ── Bulk submit ─────────────────────────────────────────────────────

  const bulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/reviews/bulk-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: bulkProductId,
        count: bulkCount,
        fiveStarPercent: bulkFiveStarPercent,
        dateFrom: new Date(bulkDateFrom).toISOString(),
        dateTo: new Date(bulkDateTo + "T23:59:59").toISOString(),
        verifiedPercent: bulkVerifiedPercent,
        randomNames: bulkRandomNames,
        mentionSize: bulkMentionSize,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Generated ${data.created} reviews`);
    } else {
      toast.error(data.error || "Failed to generate reviews");
    }
    setBulk(false);
    fetchData();
  };

  // ── Calculated display values for bulk ──────────────────────────────

  const fiveStarCountDisplay = Math.round((bulkFiveStarPercent / 100) * bulkCount);
  const fourStarCountDisplay = bulkCount - fiveStarCountDisplay;

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div>
      {/* Slider accent-color override */}
      <style>{`input[type="range"] { accent-color: #C9A96E; }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-text-primary">Reviews</h1>
        <div className="flex gap-2">
          <button
            onClick={openAdd}
            className="rounded bg-brand-dark px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light"
          >
            Add
          </button>
          <button
            onClick={() => setBulk(true)}
            className="rounded border border-border px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-secondary"
          >
            Bulk Gen
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="mt-4 font-body text-sm text-text-secondary">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Product</th>
                <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Author</th>
                <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Rating</th>
                <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Date</th>
                <th className="py-2 font-accent text-xs text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="py-2 pr-4 text-text-primary">{r.product.name}</td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {r.authorName}{" "}
                    {r.isVerified && <span className="text-brand-gold">✓</span>}
                  </td>
                  <td className="py-2 pr-4 text-brand-gold">
                    {renderStars(r.rating)}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 space-x-2">
                    <button
                      onClick={() => openEdit(r)}
                      className="text-text-secondary underline hover:text-text-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => del(r.id)}
                      className="text-text-secondary underline hover:text-brand-burgundy"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50"
          onClick={close}
        >
          <form
            onSubmit={submit}
            className="w-full max-w-md rounded border border-border bg-brand-primary p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-text-primary">
              {edit ? "Edit" : "Add"} Review
            </h2>

            <select
              value={productId || ""}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm"
              required
            >
              <option value="">Product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author"
              className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm"
              required
            />

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={cn(
                    "text-xl",
                    n <= rating ? "text-brand-gold" : "text-text-secondary/30"
                  )}
                >
                  ♥
                </button>
              ))}
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm"
            />

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Body"
              rows={4}
              className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm resize-none"
              required
            />

            <label className="flex items-center gap-2 font-body text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
              />
              Verified
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded bg-brand-dark py-2 font-accent text-xs uppercase tracking-widest text-text-light"
              >
                {edit ? "Save" : "Create"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded border border-border px-4 py-2 font-accent text-xs text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Bulk Generate Modal ──────────────────────────────────── */}
      {bulk && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50"
          onClick={() => setBulk(false)}
        >
          <form
            onSubmit={bulkSubmit}
            className="w-full max-w-md rounded border border-border bg-brand-primary p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-text-primary">
              Bulk Generate Reviews
            </h2>

            {/* Product dropdown */}
            <div>
              <label className="block font-body text-xs text-text-secondary mb-1">
                Product
              </label>
              <select
                value={bulkProductId || ""}
                onChange={(e) => setBulkProductId(Number(e.target.value))}
                className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm"
                required
              >
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Count slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-body text-xs text-text-secondary">Count</label>
                <span className="font-body text-sm font-medium text-text-primary">{bulkCount}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-0.5">
                <span className="font-body text-[10px] text-text-secondary/50">1</span>
                <span className="font-body text-[10px] text-text-secondary/50">20</span>
              </div>
            </div>

            {/* Five-star percentage slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-body text-xs text-text-secondary">
                  Five-star percentage
                </label>
                <span className="font-body text-sm font-medium text-text-primary">
                  {bulkFiveStarPercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={bulkFiveStarPercent}
                onChange={(e) => setBulkFiveStarPercent(Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-0.5 font-body text-xs text-text-secondary">
                {fiveStarCountDisplay} five-star / {fourStarCountDisplay} four-star
                {bulkFiveStarPercent < 100 && bulkFiveStarPercent > 0
                  ? " (some may get 4.5★)"
                  : ""}
              </p>
            </div>

            {/* Date range */}
            <div>
              <label className="block font-body text-xs text-text-secondary mb-1">
                Date range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={bulkDateFrom}
                  onChange={(e) => setBulkDateFrom(e.target.value)}
                  max={bulkDateTo}
                  className="flex-1 rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary [color-scheme:dark]"
                />
                <span className="text-text-secondary text-xs">to</span>
                <input
                  type="date"
                  value={bulkDateTo}
                  onChange={(e) => setBulkDateTo(e.target.value)}
                  min={bulkDateFrom}
                  className="flex-1 rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Verified percentage slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-body text-xs text-text-secondary">
                  Verified percentage
                </label>
                <span className="font-body text-sm font-medium text-text-primary">
                  {bulkVerifiedPercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={bulkVerifiedPercent}
                onChange={(e) => setBulkVerifiedPercent(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Random names toggle */}
            <div className="flex items-center justify-between">
              <label className="font-body text-xs text-text-secondary">
                Random names
              </label>
              <Toggle on={bulkRandomNames} onChange={setBulkRandomNames} />
            </div>

            {/* Mention size toggle */}
            <div className="flex items-center justify-between">
              <label className="font-body text-xs text-text-secondary">
                Mention size
              </label>
              <Toggle on={bulkMentionSize} onChange={setBulkMentionSize} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded bg-brand-dark py-2 font-accent text-xs uppercase tracking-widest text-text-light"
              >
                Generate {bulkCount} Review{bulkCount !== 1 ? "s" : ""}
              </button>
              <button
                type="button"
                onClick={() => setBulk(false)}
                className="rounded border border-border px-4 py-2 font-accent text-xs text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
