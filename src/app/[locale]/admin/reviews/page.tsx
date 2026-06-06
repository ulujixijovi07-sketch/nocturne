"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

type Review = {
  id: number; productId: number; authorName: string; rating: number;
  title: string | null; body: string | null; isVerified: boolean; createdAt: string;
  product: { name: string };
};

type Product = { id: number; name: string };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Review | null>(null);
  const [bulk, setBulk] = useState(false);

  const [productId, setProductId] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isVerified, setIsVerified] = useState(true);

  const [bulkProductId, setBulkProductId] = useState(0);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkBias, setBulkBias] = useState("high");

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

  const openAdd = () => {
    setEdit(null); setProductId(0); setAuthorName(""); setRating(5); setTitle(""); setBody(""); setIsVerified(true);
    setModal(true);
  };
  const openEdit = (r: Review) => {
    setEdit(r); setProductId(r.productId); setAuthorName(r.authorName); setRating(r.rating);
    setTitle(r.title ?? ""); setBody(r.body ?? ""); setIsVerified(r.isVerified);
    setModal(true);
  };
  const close = () => { setModal(false); setEdit(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (edit) {
      await fetch(`/api/admin/reviews/${edit.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, authorName, rating, title, body, isVerified }),
      });
    } else {
      await fetch("/api/admin/reviews/bulk-generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, count: 1, ratingBias: "high" }),
      });
    }
    close(); fetchData();
  };

  const del = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchData();
  };

  const bulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/reviews/bulk-generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: bulkProductId, count: bulkCount, ratingBias: bulkBias }),
    });
    setBulk(false); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-text-primary">Reviews</h1>
        <div className="flex gap-2">
          <button onClick={openAdd} className="rounded bg-brand-dark px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light">Add</button>
          <button onClick={() => setBulk(true)} className="rounded border border-border px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-secondary">Bulk Gen</button>
        </div>
      </div>

      {loading ? <p className="mt-4 font-body text-sm text-text-secondary">Loading…</p> : (
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
                  <td className="py-2 pr-4 text-text-secondary">{r.authorName} {r.isVerified && <span className="text-brand-gold">✓</span>}</td>
                  <td className="py-2 pr-4 text-brand-gold">{"♥".repeat(r.rating)}{"♡".repeat(5 - r.rating)}</td>
                  <td className="py-2 pr-4 text-text-secondary text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 space-x-2">
                    <button onClick={() => openEdit(r)} className="text-text-secondary underline hover:text-text-primary">Edit</button>
                    <button onClick={() => del(r.id)} className="text-text-secondary underline hover:text-brand-burgundy">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50" onClick={close}>
          <form onSubmit={submit} className="w-full max-w-md rounded border border-border bg-brand-primary p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-text-primary">{edit ? "Edit" : "Add"} Review</h2>
            <select value={productId || ""} onChange={(e) => setProductId(Number(e.target.value))} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm" required>
              <option value="">Product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author" className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm" required />
            <div className="flex gap-1">{ [1,2,3,4,5].map((n) => <button key={n} type="button" onClick={() => setRating(n)} className={cn("text-xl", n <= rating ? "text-brand-gold" : "text-text-secondary/30")}>♥</button>)}</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" rows={4} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm resize-none" required />
            <label className="flex items-center gap-2 font-body text-sm text-text-secondary"><input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} />Verified</label>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 rounded bg-brand-dark py-2 font-accent text-xs uppercase tracking-widest text-text-light">{edit ? "Save" : "Create"}</button>
              <button type="button" onClick={close} className="rounded border border-border px-4 py-2 font-accent text-xs text-text-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Modal */}
      {bulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50" onClick={() => setBulk(false)}>
          <form onSubmit={bulkSubmit} className="w-full max-w-md rounded border border-border bg-brand-primary p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-text-primary">Bulk Generate</h2>
            <select value={bulkProductId || ""} onChange={(e) => setBulkProductId(Number(e.target.value))} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm" required>
              <option value="">Product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex items-center gap-4">
              <label className="font-body text-sm text-text-secondary">Count</label>
              <input type="range" min={5} max={20} value={bulkCount} onChange={(e) => setBulkCount(Number(e.target.value))} className="flex-1" />
              <span className="font-body text-sm text-text-primary">{bulkCount}</span>
            </div>
            <select value={bulkBias} onChange={(e) => setBulkBias(e.target.value)} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm">
              <option value="high">70% 5★ / 30% 4★</option>
              <option value="balanced">Mixed 3-5★</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 rounded bg-brand-dark py-2 font-accent text-xs uppercase tracking-widest text-text-light">Generate {bulkCount}</button>
              <button type="button" onClick={() => setBulk(false)} className="rounded border border-border px-4 py-2 font-accent text-xs text-text-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export const dynamic = 'force-dynamic';
