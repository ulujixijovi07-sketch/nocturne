"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/auth/register?email=${encodeURIComponent(email.trim())}`);
    }
  };

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
        className="rounded bg-brand-gold px-8 py-4 font-medium text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/80"
      >
        Subscribe
      </button>
    </form>
  );
}
