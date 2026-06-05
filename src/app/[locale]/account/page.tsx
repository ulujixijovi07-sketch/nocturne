"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Heart,
  Tag,
  Gift,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

// ─── Dashboard cards ───────────────────────────────────────────────────

const DASHBOARD_CARDS = [
  {
    icon: Package,
    title: "My Orders",
    description: "Track your orders and view history.",
    href: "/account/orders",
  },
  {
    icon: MapPin,
    title: "Addresses",
    description: "Manage shipping and billing addresses.",
    href: "/account/addresses",
  },
  {
    icon: Heart,
    title: "Wishlist",
    description: "Your saved favorites.",
    href: "/account/wishlist",
  },
  {
    icon: Tag,
    title: "Deals",
    description: "Exclusive promo codes and special offers.",
    href: "/account/deals",
  },
  {
    icon: Gift,
    title: "Gift Cards",
    description: "Check your balance and add gift cards.",
    href: "/account/gift-cards",
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Update your name, email, and preferences.",
    href: "/account/settings",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, login, logout, isLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    login(email.trim(), name.trim());
  };

  // ── Not logged in → show login form ──────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 lg:px-8">
        <h1 className="text-center font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Sign In
        </h1>
        <p className="mt-3 text-center font-body text-sm text-text-secondary">
          Enter your details to access your account.
        </p>

        <form onSubmit={handleSignIn} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim() || !name.trim()}
            className={cn(
              "w-full rounded py-4 font-accent text-xs font-medium uppercase tracking-widest transition-colors",
              email.trim() && name.trim()
                ? "bg-brand-dark text-text-light hover:bg-brand-dark/90"
                : "cursor-not-allowed bg-brand-secondary text-text-secondary"
            )}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // ── Logged in → dashboard ────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      {/* Welcome */}
      <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-light tracking-[0.15em] text-text-primary">
            Welcome, {user!.name}
          </h1>
          <p className="mt-1 font-body text-sm text-text-secondary">
            {user!.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="mt-4 inline-flex items-center gap-2 font-body text-sm text-text-secondary transition-colors hover:text-brand-burgundy sm:mt-0"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex flex-col gap-2 rounded-sm border border-border bg-brand-primary p-6 transition-shadow hover:shadow-md"
          >
            <card.icon className="h-6 w-6 text-brand-gold transition-transform duration-300 group-hover:scale-110" />
            <h3 className="font-display text-lg font-medium text-text-primary">
              {card.title}
            </h3>
            <p className="font-body text-sm leading-relaxed text-text-secondary">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
