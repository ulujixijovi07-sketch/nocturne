"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Review = {
  id: number;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: string;
  images?: { id: number; url: string }[];
};

type ProductReviewsProps = {
  productId: number;
};

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session, status } = useSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"recent" | "highest">("recent");

  // ── Purchase check state ───────────────────────────────────────────
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // ── Review form state ───────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formImages, setFormImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchReviews = useCallback(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Check purchase status when authenticated ───────────────────────
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setPurchaseLoading(true);
      fetch(`/api/reviews?productId=${productId}&checkPurchase=true`)
        .then((r) => r.json())
        .then((data) => {
          setHasPurchased(data.purchased === true);
          setPurchaseLoading(false);
        })
        .catch(() => {
          setHasPurchased(false);
          setPurchaseLoading(false);
        });
    } else {
      setHasPurchased(false);
      setPurchaseLoading(false);
    }
  }, [status, session, productId]);

  // ── Image handling ─────────────────────────────────────────────────

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const remaining = 3 - formImages.length;
      if (remaining <= 0) return;
      const arr = Array.from(files).slice(0, remaining);
      const newImages = arr.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
      }));
      setFormImages((prev) => [...prev, ...newImages]);
    },
    [formImages.length]
  );

  const removeImage = (index: number) => {
    setFormImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // ── Form submit ────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBody.trim()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("productId", String(productId));
      fd.append("authorName", formName.trim());
      fd.append("rating", String(formRating));
      if (formTitle.trim()) fd.append("title", formTitle.trim());
      fd.append("body", formBody.trim());
      formImages.forEach((img) => fd.append("images", img.file));

      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted!");
      setFormOpen(false);
      setFormName("");
      setFormRating(5);
      setFormTitle("");
      setFormBody("");
      // Clean up preview URLs
      formImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setFormImages([]);
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Existing display logic ─────────────────────────────────────────

  if (loading) {
    return (
      <p className="py-8 text-center font-body text-sm text-text-secondary">
        Loading reviews…
      </p>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  const sorted = [...reviews].sort((a, b) =>
    sort === "recent"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : b.rating - a.rating
  );

  return (
    <div className="mt-14 border-t border-border pt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-light text-text-primary">
          Reviews
        </h2>

        {/* ── Auth-dependent CTA ─────────────────────────────────── */}
        {status === "loading" ? (
          <div className="rounded bg-brand-dark/50 px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light/50">
            Loading…
          </div>
        ) : status === "unauthenticated" ? (
          <a
            href="/auth/signin"
            className="rounded bg-brand-dark px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 transition-colors inline-block"
          >
            Sign in to Write a Review
          </a>
        ) : purchaseLoading ? (
          <div className="rounded bg-brand-dark/50 px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light/50">
            Checking…
          </div>
        ) : hasPurchased ? (
          <button
            onClick={() => {
              if (!formOpen && session?.user?.name) {
                setFormName(session.user.name);
              }
              setFormOpen(!formOpen);
            }}
            className="rounded bg-brand-dark px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 transition-colors"
          >
            {formOpen ? "Cancel" : "Write a Review"}
          </button>
        ) : null}
      </div>

      {/* ── Purchase-required message ────────────────────────────────── */}
      {status === "authenticated" && !purchaseLoading && !hasPurchased && (
        <p className="mt-3 font-body text-sm text-text-secondary">
          Purchase this item to leave a review
        </p>
      )}

      {/* ── Review Submission Form ─────────────────────────────────── */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded border border-border bg-brand-secondary/50 p-6 space-y-4"
        >
          {/* Name (pre-filled from session) */}
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">
              Your Name *
            </label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/50"
              required
              maxLength={100}
            />
          </div>

          {/* Rating — 10 clickable half-step hearts */}
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">
              Rating
            </label>
            <div className="flex gap-0.5">
              {Array.from({ length: 10 }, (_, i) => {
                const value = (i + 1) / 2;
                const isFilled = value <= formRating;
                const isHalf =
                  !isFilled && value - 0.5 < formRating && formRating % 1 !== 0;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormRating(value)}
                    onMouseEnter={() => setFormRating(value)}
                    className={cn(
                      "text-2xl transition-colors",
                      isFilled
                        ? "text-brand-gold"
                        : isHalf
                        ? "text-brand-gold/60"
                        : "text-text-secondary/20"
                    )}
                    aria-label={`Rate ${value} stars`}
                  >
                    {isFilled ? "♥" : isHalf ? "♥" : "♡"}
                  </button>
                );
              })}
              <span className="ml-2 font-body text-sm text-text-secondary self-center">
                {formRating}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">
              Title <span className="text-text-secondary/50">(optional)</span>
            </label>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/50"
              maxLength={200}
            />
          </div>

          {/* Body */}
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">
              Your Review *
            </label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Share your thoughts about this piece…"
              rows={4}
              className="w-full rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary/50 resize-none"
              required
              maxLength={2000}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">
              Images{" "}
              <span className="text-text-secondary/50">
                (up to 3, optional)
              </span>
            </label>

            {/* Drop zone */}
            <div
              ref={dropRef}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded border border-dashed p-4 transition-colors",
                dragOver
                  ? "border-brand-gold bg-brand-gold/5"
                  : "border-border hover:border-brand-gold/50"
              )}
            >
              <p className="font-body text-xs text-text-secondary/60">
                Click or drag images to upload
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Image previews */}
            {formImages.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {formImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Upload ${i + 1}`}
                      className="h-20 w-20 rounded border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-burgundy text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-brand-dark py-2.5 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {/* ── Summary (existing) ──────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="flex flex-col items-center rounded-sm border border-border bg-brand-primary px-8 py-6">
          <p className="font-display text-4xl font-light text-text-primary">
            {avgRating.toFixed(1)}
          </p>
          <div className="mt-1 flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={cn(
                  "text-sm",
                  n <= Math.round(avgRating)
                    ? "text-brand-gold"
                    : "text-text-secondary/30"
                )}
              >
                ♥
              </span>
            ))}
          </div>
          <p className="mt-1 font-body text-xs text-text-secondary">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-1.5">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-2">
              <span className="w-8 text-right font-body text-xs text-text-secondary">
                {b.star}♥
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-secondary">
                <div
                  className="h-full rounded-full bg-brand-gold transition-all"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className="w-8 font-body text-xs text-text-secondary">
                {b.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sort (existing) ─────────────────────────────────────────── */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setSort("recent")}
          className={cn(
            "rounded-sm px-3 py-1.5 font-body text-xs",
            sort === "recent"
              ? "bg-brand-dark text-text-light"
              : "bg-brand-secondary text-text-secondary"
          )}
        >
          Most Recent
        </button>
        <button
          onClick={() => setSort("highest")}
          className={cn(
            "rounded-sm px-3 py-1.5 font-body text-xs",
            sort === "highest"
              ? "bg-brand-dark text-text-light"
              : "bg-brand-secondary text-text-secondary"
          )}
        >
          Highest Rated
        </button>
      </div>

      {/* ── Review list (existing + images) ─────────────────────────── */}
      {sorted.length === 0 ? (
        <p className="mt-6 font-body text-sm text-text-secondary">
          No reviews yet. Be the first to review this product.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-border">
          {sorted.map((review) => (
            <div key={review.id} className="py-5">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "text-xs",
                        n <= review.rating
                          ? "text-brand-gold"
                          : "text-text-secondary/30"
                      )}
                    >
                      ♥
                    </span>
                  ))}
                </div>
                <span className="font-body text-sm font-medium text-text-primary">
                  {review.authorName}
                </span>
                {review.isVerified && (
                  <span className="rounded-sm bg-brand-gold/10 px-1.5 py-0.5 font-body text-[10px] text-brand-gold">
                    Verified
                  </span>
                )}
              </div>
              {review.title && (
                <p className="mt-1 font-body text-sm font-medium text-text-primary">
                  {review.title}
                </p>
              )}
              {review.body && (
                <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
                  {review.body}
                </p>
              )}
              {/* Review images */}
              {review.images && review.images.length > 0 && (
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {review.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="Review image"
                      className="h-16 w-16 rounded border border-border object-cover"
                    />
                  ))}
                </div>
              )}
              <p className="mt-2 font-body text-xs text-text-secondary/60">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
