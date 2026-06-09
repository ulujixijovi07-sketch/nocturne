"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Heart, ChatCircle, CaretDown } from "@phosphor-icons/react";

type UserInfo = { name: string | null; email: string };

function ContactAccordion() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.user) {
          setName(d.user.name || "");
          setEmail(d.user.email || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Account User", email: email.trim(), subject, message: message.trim() }),
      });
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <details className="group mt-6 rounded border border-border bg-brand-primary">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 marker:hidden">
        <div className="flex items-center gap-3">
          <ChatCircle className="h-5 w-5 text-brand-gold" />
          <span className="font-medium text-xs uppercase tracking-widest text-text-primary">Contact Support</span>
        </div>
        <CaretDown className="h-4 w-4 text-text-secondary transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="border-t border-border px-5 py-4">
        {status === "sent" ? (
          <p className="text-center font-display text-sm text-brand-gold py-4">Message sent. We'll reply within 24 hours. ✦</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option>General Inquiry</option>
              <option>Order Help</option>
              <option>Returns & Exchanges</option>
              <option>Sizing & Fit</option>
              <option>Press & Partnerships</option>
            </select>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none"
            />
            <button
              type="submit"
              disabled={status === "sending" || !message.trim()}
              className="w-full rounded bg-brand-dark py-3 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </details>
  );
}

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
          <span className="font-medium text-xs uppercase tracking-widest text-text-primary">My Orders</span>
        </Link>
        <Link href="/en/account/wishlist" className="flex items-center gap-3 rounded border border-border bg-brand-primary p-4 hover:border-brand-gold/50 transition-colors">
          <Heart className="h-5 w-5 text-brand-gold" />
          <span className="font-medium text-xs uppercase tracking-widest text-text-primary">Wishlist</span>
        </Link>
      </div>

      <ContactAccordion />
    </div>
  );
}
