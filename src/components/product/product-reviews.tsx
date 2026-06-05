"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Review = {
  id: number;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: string;
};

type ProductReviewsProps = {
  productId: number;
};

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"recent" | "highest">("recent");

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return <p className="py-8 text-center font-body text-sm text-text-secondary">Loading reviews…</p>;
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
      <h2 className="font-display text-2xl font-light text-text-primary">
        Reviews
      </h2>

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
