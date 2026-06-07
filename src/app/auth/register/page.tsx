"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [giftCard, setGiftCard] = useState<{ code: string; type: string; value: number } | null>(null);
  const [registered, setRegistered] = useState(false);

  // Pre-fill email from URL param (newsletter flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // Save gift card to localStorage
      if (data.giftCard) {
        setGiftCard(data.giftCard);
        const existing = localStorage.getItem("nocturne-giftcards");
        const cards = existing ? JSON.parse(existing) : [];
        cards.push(data.giftCard);
        localStorage.setItem("nocturne-giftcards", JSON.stringify(cards));
      }

      setRegistered(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state with gift card ──────────────────────────────────────
  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-primary px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/20">
            <svg className="h-8 w-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-light tracking-[0.15em] text-text-primary">
            Welcome to NOCTURNE
          </h1>
          <p className="font-body text-sm text-text-secondary">
            Your account has been created. As a thank you, here&apos;s 10% off your first order:
          </p>

          {giftCard && (
            <div className="rounded border border-brand-gold/30 bg-gradient-to-br from-brand-dark/80 to-brand-dark/40 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 rounded-bl-full" />
              <p className="font-accent text-[10px] uppercase tracking-widest text-brand-gold/60">Your Gift Card</p>
              <p className="mt-2 font-display text-2xl text-brand-gold tracking-wider">{giftCard.code}</p>
              <p className="mt-1 font-body text-sm text-text-secondary">10% off your entire order</p>
            </div>
          )}

          <p className="font-body text-xs text-text-secondary">
            Saved to your account — enter the code at checkout.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/auth/signin"
              className="w-full rounded-sm bg-brand-dark py-3 font-accent text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-text-primary"
            >
              Sign In & Start Shopping
            </Link>
            <Link
              href="/collections"
              className="w-full rounded-sm border border-border py-3 font-accent text-xs uppercase tracking-widest text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
            >
              Browse Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <Link
            href="/"
            className="font-display text-3xl font-light tracking-[0.2em] text-text-primary"
          >
            NOCTURNE
          </Link>
          <p className="mt-2 font-body text-sm text-text-secondary">
            Create your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block font-medium text-xs uppercase tracking-widest text-text-secondary"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="mt-1.5 w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block font-medium text-xs uppercase tracking-widest text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-medium text-xs uppercase tracking-widest text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block font-medium text-xs uppercase tracking-widest text-text-secondary"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-center font-body text-sm text-brand-burgundy">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-brand-dark py-3 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-text-primary disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Sign in link */}
        <p className="text-center font-body text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-brand-gold underline underline-offset-2 hover:text-brand-burgundy transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
