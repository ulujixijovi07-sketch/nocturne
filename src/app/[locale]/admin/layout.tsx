"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Package, Star, LayoutDashboard, ShoppingBag, ArrowLeft } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState({ products: 0, reviews: 0 });
  const pathname = usePathname();

  useEffect(() => {
    if (authed) {
      fetch("/api/admin/products").then(r => r.json()).then(d => setStats(s => ({ ...s, products: Array.isArray(d) ? d.length : 0 })));
      fetch("/api/admin/reviews").then(r => r.json()).then(d => setStats(s => ({ ...s, reviews: Array.isArray(d) ? d.length : 0 })));
    }
  }, [authed]);

  const handleLogin = () => { if (password === "nocturne2024") setAuthed(true); };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-secondary">
        <div className="w-full max-w-sm p-8">
          <h1 className="mb-6 text-center font-display text-2xl text-text-primary">Admin</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Password" className="w-full rounded border border-border bg-brand-primary px-4 py-3 font-body text-sm outline-none focus:border-brand-gold" />
          <button onClick={handleLogin} className="mt-4 w-full rounded bg-brand-dark py-3 font-accent text-xs uppercase tracking-widest text-text-light">Enter</button>
        </div>
      </div>
    );
  }

  const stripLocale = (path: string) => path.replace(/^\/[a-z]{2}/, "");
  const isDashboard = stripLocale(pathname) === "/admin";

  return (
    <div className="flex min-h-screen bg-brand-secondary">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-brand-primary p-6">
        <Link href="/" className="mb-8 block font-display text-lg tracking-[0.2em] text-text-primary">NOCTURNE</Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded px-3 py-2 font-body text-sm transition-colors ${
                stripLocale(pathname) === item.href ? "bg-brand-dark text-text-light" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-border pt-4">
          <Link href="/" className="flex items-center gap-2 font-body text-xs text-text-secondary hover:text-brand-gold">
            <ArrowLeft className="h-3 w-3" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {isDashboard ? (
          <div>
            <h1 className="font-display text-2xl font-light text-text-primary">Dashboard</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Products", value: stats.products, icon: Package },
                { label: "Reviews", value: stats.reviews, icon: Star },
              ].map(s => (
                <div key={s.label} className="rounded border border-border bg-brand-primary p-6">
                  <div className="flex items-center gap-3">
                    <s.icon className="h-5 w-5 text-brand-gold" />
                    <p className="font-accent text-xs uppercase tracking-widest text-text-secondary">{s.label}</p>
                  </div>
                  <p className="mt-3 font-display text-3xl font-light text-text-primary">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
