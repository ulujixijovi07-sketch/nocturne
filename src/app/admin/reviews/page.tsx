"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

type Review = {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  isPinned: boolean;
  createdAt: string;
  product: { name: string; slug: string };
};

type ProductSelect = { id: number; name: string };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<ProductSelect[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Form
  const [productId, setProductId] = useState<number>(0);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isVerified, setIsVerified] = useState(true);

  // Bulk form
  const [bulkProductId, setBulkProductId] = useState<number>(0);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkBias, setBulkBias] = useState("high");

  const fetchReviews = useCallback(async () => {
    const res = await fetch("/api/admin/reviews");
    setReviews(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
  }, [fetchReviews]);

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { productId, authorName, rating, title, body, isVerified };
    if (editingReview) {
      await fetch(`/api/admin/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // Create single review via bulk with count=1
      await fetch("/api/admin/reviews/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, count: 1, ratingBias: "high" }),
      });
    }
    closeModal();
    fetchReviews();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/reviews/bulk-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: bulkProductId, count: bulkCount, ratingBias: bulkBias }),
    });
    setBulkOpen(false);
    fetchReviews();
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setProductId(review.productId);
    setAuthorName(review.authorName);
    setRating(review.rating);
    setTitle(review.title ?? "");
    setBody(review.body ?? "");
    setIsVerified(review.isVerified);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingReview(null);
    setProductId(0);
    setAuthorName("");
    setRating(5);
    setTitle("");
    setBody("");
    setIsVerified(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-light text-text-primary">Reviews</h1>
        <div className="flex gap-2">
          <button onClick={() => { closeModal(); setModalOpen(true); }} className="rounded bg-brand-dark px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light">Add Review</button>
          <button onClick={() => setBulkOpen(true)} className="rounded border border-border px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-secondary hover:bg-brand-primary">Bulk Generate</button>
        </div>
      </div>

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
                <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Title</th>
                <th className="py-2 font-accent text-xs text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="py-2 pr-4 text-text-primary">{r.product.name}</td>
                  <td className="py-2 pr-4">{r.authorName} {r.isVerified && <span className="ml-1 text-brand-gold">✓</span>}</td>
                  <td className="py-2 pr-4 text-brand-gold">{"♥".repeat(r.rating)}{"♡".repeat(5 - r.rating)}</td>
                  <td className="py-2 pr-4 text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 pr-4 text-text-secondary max-w-[200px] truncate">{r.title ?? "—"}</td>
                  <td className="py-2 space-x-2">
                    <button onClick={() => openEditModal(r)} className="text-text-secondary hover:text-text-primary">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-text-secondary hover:text-brand-burgundy">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50" onClick={closeModal}>
          <form onSubmit={handleAddOrEdit} className="w-full max-w-md rounded border border-border bg-brand-primary p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-text-primary">{editingReview ? "Edit Review" : "Add Review"}</h2>
            <div className="mt-4 space-y-3">
              <select value={productId || ""} onChange={(e) => setProductId(parseInt(e.target.value))} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary" required>
                <option value="">Select product…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author name" className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary" required />
              <div className="flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} className={cn("text-xl", n <= rating ? "text-brand-gold" : "text-text-secondary/30")}>♥</button>
                ))}
              </div>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Review body" rows={4} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary resize-none" required />
              <label className="flex items-center gap-2 font-body text-sm text-text-secondary"><input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="rounded border-border text-brand-gold" />Verified purchase</label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="flex-1 rounded bg-brand-dark py-2 font-accent text-xs uppercase tracking-widest text-text-light">{editingReview ? "Save" : "Create"}</button>
              <button type="button" onClick={closeModal} className="rounded border border-border px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50" onClick={() => setBulkOpen(false)}>
          <form onSubmit={handleBulkGenerate} className="w-full max-w-md rounded border border-border bg-brand-primary p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl text-text-primary">Bulk Generate Reviews</h2>
            <div className="mt-4 space-y-3">
              <select value={bulkProductId || ""} onChange={(e) => setBulkProductId(parseInt(e.target.value))} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary" required>
                <option value="">Select product…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value) || 5)} min={5} max={15} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary" />
              <select value={bulkBias} onChange={(e) => setBulkBias(e.target.value)} className="w-full rounded border border-border bg-transparent px-3 py-2 font-body text-sm text-text-primary">
                <option value="high">High (70% 5★, 30% 4★)</option>
                <option value="balanced">Balanced (mixed 3-5★)</option>
                <option value="mixed">Wider distribution</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="flex-1 rounded bg-brand-dark py-2 font-accent text-xs uppercase tracking-widest text-text-light">Generate {bulkCount} Reviews</button>
              <button type="button" onClick={() => setBulkOpen(false)} className="rounded border border-border px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
