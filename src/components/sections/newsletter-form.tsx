"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <p className="text-center font-display text-lg text-brand-gold">
        Welcome to the night. ✦
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 rounded border border-brand-light/30 bg-transparent px-5 py-4 font-body text-sm text-text-light placeholder:text-text-light/40 focus:border-brand-gold/50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded bg-brand-gold px-8 py-4 font-medium text-xs uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/80 disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
