"use client";

import { useState, useEffect, useRef } from "react";
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

type ProductReviewsProps = { productId: number };

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"recent" | "highest">("recent");
  const [error, setError] = useState<string | null>(null);

  // ── Session check (safe, won't crash) ────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.email) {
          setIsLoggedIn(true);
          setSessionUser({ name: data.user.name || "", email: data.user.email });
        }
        setSessionLoading(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setSessionLoading(false);
      });
  }, []);

  // Purchase check
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<{name:string,email:string}>({name:"",email:""});

  useEffect(() => {
    if (!isLoggedIn) return;
    setPurchaseLoading(true);
    fetch(`/api/reviews?productId=${productId}&checkPurchase=true`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setHasPurchased(data.purchased === true);
        setPurchaseLoading(false);
      })
      .catch(() => {
        setHasPurchased(false);
        setPurchaseLoading(false);
      });
  }, [isLoggedIn, productId]);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formImages, setFormImages] = useState<{file:File,preview:string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openForm = () => {
    setFormName(sessionUser.name || "");
    setFormOpen(true);
  };

  const addFiles = (files: FileList | File[]) => {
    const remaining = 3 - formImages.length;
    if (remaining <= 0) return;
    const arr = Array.from(files).slice(0, remaining);
    setFormImages((prev) => [...prev, ...arr.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };

  const removeFile = (i: number) => {
    setFormImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBody.trim()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("productId", String(productId));
      fd.append("authorName", formName.trim() || "Anonymous");
      fd.append("rating", String(formRating));
      if (formTitle.trim()) fd.append("title", formTitle.trim());
      fd.append("body", formBody.trim());
      formImages.forEach((img) => fd.append("images", img.file));

      const res = await fetch("/api/reviews", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      toast.success("Review submitted!");
      setFormOpen(false);
      setFormBody("");
      setFormTitle("");
      setFormRating(5);
      formImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setFormImages([]);
      // Refresh
      fetch(`/api/reviews?productId=${productId}`)
        .then((r) => r.json())
        .then((data) => setReviews(Array.isArray(data) ? data : []))
        .catch(() => {});
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Fetch reviews (always works) ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load reviews");
        return r.json();
      })
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  // ── Computed values ───────────────────────────────────────────────
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count, pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 };
  });

  const sorted = [...reviews].sort((a, b) =>
    sort === "recent"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : b.rating - a.rating
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="mt-14 border-t border-border pt-10">
      <h2 className="font-display text-2xl font-light text-text-primary">
        Customer Reviews
      </h2>

      {/* Sign in / Write review CTA */}
      <div className="mt-3">
        {sessionLoading ? (
          <span className="inline-block rounded bg-brand-dark/50 px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light/50">
            Loading…
          </span>
        ) : !isLoggedIn ? (
          <a
            href="/auth/signin"
            className="inline-block rounded bg-brand-dark px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 transition-colors"
          >
            Sign in to Write a Review
          </a>
        ) : purchaseLoading ? (
          <span className="inline-block rounded bg-brand-dark/50 px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light/50">
            Checking…
          </span>
        ) : hasPurchased ? (
          <button
            onClick={openForm}
            className="inline-block rounded bg-brand-dark px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 transition-colors"
          >
            {formOpen ? "Cancel" : "Write a Review"}
          </button>
        ) : (
          <span className="inline-block rounded border border-border px-4 py-2 font-accent text-xs uppercase tracking-widest text-text-secondary">
            Purchase this item to leave a review
          </span>
        )}
      </div>

      {/* Review Form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 rounded border border-border bg-brand-secondary/50 p-6 space-y-4">
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">Your Name *</label>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Your name"
              className="w-full rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm text-text-primary" required maxLength={100} />
          </div>
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">Rating</label>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setFormRating(n)}
                  className={cn("text-xl", n <= formRating ? "text-brand-gold" : "text-text-secondary/20")}>♥</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">Title <span className="text-text-secondary/50">(optional)</span></label>
            <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Summarize your experience"
              className="w-full rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm text-text-primary" maxLength={200} />
          </div>
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">Your Review *</label>
            <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="Share your thoughts…" rows={4}
              className="w-full rounded border border-border bg-brand-primary px-3 py-2 font-body text-sm text-text-primary resize-none" required maxLength={2000} />
          </div>
          <div>
            <label className="block font-body text-xs text-text-secondary mb-1">Images <span className="text-text-secondary/50">(up to 3)</span></label>
            <div onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded border border-dashed border-border p-4 text-center hover:border-brand-gold/50 transition-colors">
              <p className="font-body text-xs text-text-secondary/60">Click to upload images</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            {formImages.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {formImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.preview} alt="" className="h-20 w-20 rounded border border-border object-cover" />
                    <button type="button" onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-burgundy text-white text-[10px] opacity-0 group-hover:opacity-100">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting}
            className="w-full rounded bg-brand-dark py-2.5 font-accent text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 disabled:opacity-50">
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center font-body text-sm text-text-secondary">
          Loading reviews…
        </p>
      ) : error ? (
        <p className="py-8 text-center font-body text-sm text-text-secondary">
          Unable to load reviews.
        </p>
      ) : (
        <>
          {/* Summary */}
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
                      n <= Math.round(avgRating) ? "text-brand-gold" : "text-text-secondary/30"
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

          {/* Sort */}
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

          {/* Review list */}
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
                            n <= review.rating ? "text-brand-gold" : "text-text-secondary/30"
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
                  {review.images && review.images.length > 0 && (
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {review.images.map((img) => (
                        <img
                          key={img.id}
                          src={img.url}
                          alt="Review"
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
        </>
      )}
    </div>
  );
}
