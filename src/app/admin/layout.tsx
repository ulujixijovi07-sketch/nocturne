"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_PASSWORD = "nocturne2024";
const AUTH_KEY = "nocturne-admin-auth";

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY);
    setAuthenticated(stored === ADMIN_PASSWORD);
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, password);
      setAuthenticated(true);
      setError("");
    } else {
      setError("Wrong password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
  };

  if (loading) return null;

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded border border-border bg-brand-primary p-8">
          <h1 className="text-center font-display text-2xl text-text-primary">NOCTURNE Admin</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-brand-gold" />
          <button type="submit" className="w-full rounded bg-brand-dark py-3 font-accent text-xs uppercase tracking-widest text-text-light">Enter</button>
          {error && <p className="text-center font-body text-xs text-brand-burgundy">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-secondary">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-brand-primary p-6 md:block">
        <Link href="/admin" className="block font-display text-xl font-light tracking-[0.2em] text-text-primary">NOCTURNE</Link>
        <nav className="mt-8 space-y-1">
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded px-3 py-2 font-body text-sm transition-colors",
                pathname === link.href
                  ? "bg-brand-dark text-text-light"
                  : "text-text-secondary hover:bg-brand-secondary hover:text-text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 space-y-2">
          <Link href="/" className="block font-body text-xs text-text-secondary underline hover:text-text-primary">← Back to Store</Link>
          <button onClick={handleLogout} className="block font-body text-xs text-text-secondary underline hover:text-text-primary">Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
