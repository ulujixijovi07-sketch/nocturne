"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject, message: message.trim() }),
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-sm border border-brand-gold/30 bg-brand-gold/5 p-8 text-center">
        <p className="font-display text-xl text-brand-gold">Message sent. ✦</p>
        <p className="mt-2 font-body text-sm text-text-secondary">We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block font-medium text-xs uppercase tracking-widest text-text-secondary">Name</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" placeholder="Your name" />
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-xs uppercase tracking-widest text-text-secondary">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" placeholder="you@example.com" />
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-xs uppercase tracking-widest text-text-secondary">Subject</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold">
          <option>General Inquiry</option>
          <option>Order Help</option>
          <option>Returns & Exchanges</option>
          <option>Sizing & Fit</option>
          <option>Press & Partnerships</option>
        </select>
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-xs uppercase tracking-widest text-text-secondary">Message</label>
        <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none" placeholder="How can we help?" />
      </div>
      <button type="submit" disabled={status === "sending"} className="w-full rounded bg-brand-dark py-4 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90 disabled:opacity-50">
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
