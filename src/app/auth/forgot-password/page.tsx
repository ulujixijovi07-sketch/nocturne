"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setStatus("sent");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-2xl font-light tracking-[0.15em] text-text-primary">
          Forgot Password
        </h1>
        {status === "sent" ? (
          <div className="mt-8 text-center">
            <p className="font-body text-sm text-text-secondary">
              If an account exists for <strong className="text-text-primary">{email}</strong>, we've sent a reset link.
            </p>
            <Link href="/auth/signin" className="mt-6 inline-block font-body text-sm text-brand-gold hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoFocus
              className="w-full rounded border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded bg-brand-dark py-3 font-medium text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center">
              <Link href="/auth/signin" className="font-body text-xs text-text-secondary hover:text-brand-gold">
                Back to Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
