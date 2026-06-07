"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeGiftCode, setWelcomeGiftCode] = useState("");

  // Check for post-registration redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      const code = params.get("giftCode") || "";
      setWelcomeGiftCode(code);
    }
  }, []);

  const doSignIn = async () => {
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    if (result?.ok) {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="font-display text-3xl font-light tracking-[0.2em] text-text-primary">NOCTURNE</Link>
          <p className="mt-2 font-body text-sm text-text-secondary">Sign in to your account</p>
        </div>

        {/* Welcome + Gift Card (post-registration) */}
        {welcomeGiftCode && (
          <div className="rounded border border-brand-gold/30 bg-gradient-to-br from-brand-dark/80 to-brand-dark/40 p-6 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 rounded-bl-full" />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/20 mb-3">
              <svg className="h-6 w-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-display text-lg text-text-light">Account Created!</p>
            <p className="mt-1 font-body text-xs text-text-secondary">Welcome to NOCTURNE. Sign in to start shopping.</p>
            <div className="mt-4 rounded border border-brand-gold/20 bg-brand-dark/40 px-4 py-3">
              <p className="font-accent text-[10px] uppercase tracking-widest text-brand-gold/60">Your 10% Welcome Gift</p>
              <p className="mt-1 font-mono text-xl tracking-wider text-brand-gold">{welcomeGiftCode}</p>
            </div>
            <p className="mt-2 font-body text-[11px] text-text-secondary/60">Enter this code at checkout. Also saved in My Account → Gift Cards.</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-medium text-xs uppercase tracking-widest text-text-secondary">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="mt-1.5 w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block font-medium text-xs uppercase tracking-widest text-text-secondary">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="mt-1.5 w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold" placeholder="••••••••" />
          </div>
          {error && <p className="text-center font-body text-sm text-brand-burgundy">{error}</p>}
          <button type="button" onClick={doSignIn} disabled={loading} className="w-full rounded-sm bg-brand-dark py-3 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-text-primary disabled:opacity-50">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>

        {/* Register link */}
        <p className="text-center font-body text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-brand-gold underline underline-offset-2 hover:text-brand-burgundy transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
}
