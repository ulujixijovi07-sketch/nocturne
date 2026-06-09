"use client";

import { useState, useEffect } from "react";
import { Star, Users } from "@phosphor-icons/react";

export function SocialProofBar() {
  const [stats, setStats] = useState<{ reviews: number; orders: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/reviews").then(r => r.json()),
      fetch("/api/admin/orders?limit=1").then(r => r.json()),
    ])
      .then(([reviews, ordersData]) => {
        setStats({
          reviews: Array.isArray(reviews) ? reviews.length : 0,
          orders: ordersData?.pagination?.total || 0,
        });
      })
      .catch(() => {});
  }, []);

  if (!stats || (stats.reviews === 0 && stats.orders === 0)) return null;

  return (
    <section className="border-y border-border bg-brand-primary/30">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-brand-gold" weight="fill" />
            <span className="font-body text-sm text-text-secondary">
              <strong className="text-text-primary">{stats.reviews}+</strong> Verified Reviews
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-gold" />
            <span className="font-body text-sm text-text-secondary">
              <strong className="text-text-primary">{stats.orders}+</strong> Orders Shipped
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
