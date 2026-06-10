"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Package,
  Star,
  ShoppingBag,
  Tag,
  ChatCircle,
  Users,
  Gear,
  List,
  X,
  Envelope,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/en/admin", icon: SquaresFour, enabled: true },
  { label: "Products", href: "/en/admin/products", icon: Package, enabled: true },
  { label: "Orders", href: "/en/admin/orders", icon: ShoppingBag, enabled: true },
  { label: "Reviews", href: "/en/admin/reviews", icon: Star, enabled: true },
  { label: "Promotions", href: "/en/admin/promos", icon: Tag, enabled: true },
  { label: "Newsletter", href: "/en/admin/newsletter", icon: Envelope, enabled: true },
  { label: "Messages", href: "/en/admin/contact", icon: ChatCircle, enabled: true },
  { label: "Customers", href: "/en/admin/customers", icon: Users, enabled: true },
  { label: "Settings", href: "/en/admin/settings", icon: Gear, enabled: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isLoading = status === "loading";
  const isAdmin = session?.user?.role === "ADMIN";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-secondary">
        <p className="font-body text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-secondary px-4">
        <div className="w-full max-w-sm rounded-sm border border-border bg-brand-primary p-8 shadow-sm text-center">
          <h1 className="font-display text-2xl font-light tracking-[0.2em] text-text-primary">
            NOCTURNE
          </h1>
          <p className="mt-2 font-body text-xs text-text-secondary">Admin access restricted</p>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="mt-6 rounded bg-brand-dark px-6 py-2.5 font-medium text-xs uppercase tracking-widest text-text-light"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const stripLocale = (path: string) => path.replace(/^\/[a-z]{2}/, "");

  const currentPath = stripLocale(pathname);

  const sidebar = (
    <aside className="flex h-full flex-col bg-brand-dark">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          href="/en/admin"
          onClick={() => setSidebarOpen(false)}
          className="font-display text-lg tracking-[0.15em] text-text-light"
        >
          NOCTURNE
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded p-1 text-text-light/50 hover:text-text-light md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href;

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center justify-between rounded px-3 py-2.5"
              >
                <div className="flex items-center gap-3 text-text-light/25">
                  <item.icon className="h-4 w-4" />
                  <span className="font-body text-sm">{item.label}</span>
                </div>
                <span className="rounded bg-brand-gold/20 px-1.5 py-0.5 font-medium text-[9px] uppercase tracking-wider text-brand-gold/60">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2.5 font-body text-sm transition-colors",
                isActive
                  ? "bg-brand-gold/15 text-brand-gold"
                  : "text-text-light/60 hover:bg-brand-gold/10 hover:text-text-light"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-text-light/10 px-6 py-4">
        <Link
          href="/"
          className="font-body text-xs text-text-light/40 underline-offset-2 hover:text-brand-gold hover:underline"
        >
          ← Back to Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="ml-4 font-body text-xs text-text-light/40 underline-offset-2 hover:text-brand-gold hover:underline"
        >
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#F6F2ED",
            border: "1px solid #D4CFC8",
            color: "#1A1817",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
        }}
      />
      <div className="flex min-h-screen bg-brand-primary">
        {/* Desktop sidebar */}
        <div className="hidden w-60 shrink-0 md:block">{sidebar}</div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 z-50 h-full w-60 animate-in slide-in-from-left">
              {sidebar}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Mobile header bar */}
          <div className="flex items-center gap-4 border-b border-border bg-brand-primary px-6 py-4 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1 text-text-primary hover:bg-brand-secondary"
              aria-label="Open sidebar"
            >
              <List className="h-5 w-5" />
            </button>
            <span className="font-display text-lg tracking-[0.15em] text-text-primary">
              NOCTURNE
            </span>
          </div>

          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
