"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Star, Heart } from "lucide-react";

type UserInfo = { name: string | null; email: string };

export default function AccountPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setUser({ name: data.user.name, email: data.user.email });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8 text-center font-body text-sm text-text-secondary">Loading…</p>;
  if (!user) return <p className="p-8 text-center font-body text-sm text-text-secondary">Please sign in.</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">My Account</h1>

      <div className="mt-8 rounded border border-border bg-brand-primary p-6">
        <p className="font-body text-sm text-text-primary">{user.name || "No name set"}</p>
        <p className="mt-1 font-body text-sm text-text-secondary">{user.email}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/en/account/orders" className="flex items-center gap-3 rounded border border-border bg-brand-primary p-4 hover:border-brand-gold/50 transition-colors">
          <Package className="h-5 w-5 text-brand-gold" />
          <span className="font-accent text-xs uppercase tracking-widest text-text-primary">My Orders</span>
        </Link>
        <Link href="/en/account/wishlist" className="flex items-center gap-3 rounded border border-border bg-brand-primary p-4 hover:border-brand-gold/50 transition-colors">
          <Heart className="h-5 w-5 text-brand-gold" />
          <span className="font-accent text-xs uppercase tracking-widest text-text-primary">Wishlist</span>
        </Link>
      </div>
    </div>
  );
}
