"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PASSWORD = "nocturne2024";
const KEY = "nocturne-admin-auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setAuthed(sessionStorage.getItem(KEY) === PASSWORD);
    setLoading(false);
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === PASSWORD) { sessionStorage.setItem(KEY, pw); setAuthed(true); setErr(""); }
    else setErr("Wrong password");
  };

  const logout = () => { sessionStorage.removeItem(KEY); setAuthed(false); };

  if (loading) return null;

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded border border-border bg-brand-primary p-8 space-y-4">
          <h1 className="text-center font-display text-2xl text-text-primary">Admin</h1>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="w-full rounded border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold" />
          <button type="submit" className="w-full rounded bg-brand-dark py-3 font-accent text-xs uppercase tracking-widest text-text-light">Enter</button>
          {err && <p className="text-center font-body text-xs text-brand-burgundy">{err}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-secondary">
      <aside className="hidden w-48 shrink-0 border-r border-border bg-brand-primary p-6 md:block">
        <Link href="/admin" className="font-display text-lg tracking-[0.15em] text-text-primary">Admin</Link>
        <nav className="mt-6 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("block rounded px-3 py-2 font-body text-sm", pathname === n.href ? "bg-brand-dark text-text-light" : "text-text-secondary hover:bg-brand-secondary hover:text-text-primary")}>{n.label}</Link>
          ))}
        </nav>
        <div className="mt-8 space-y-2">
          <Link href="/" className="block font-body text-xs text-text-secondary underline hover:text-text-primary">← Store</Link>
          <button onClick={logout} className="block font-body text-xs text-text-secondary underline hover:text-text-primary">Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
