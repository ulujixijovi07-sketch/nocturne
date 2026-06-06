"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, ChevronDown, LogOut, Package, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated" && !!session?.user;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) {
    return (
      <div className="hidden sm:block">
        <div className="h-5 w-5 rounded-full animate-pulse bg-border" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/auth/signin"
        aria-label="Sign In"
        className="hidden sm:block text-text-secondary hover:text-text-primary transition-colors"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Account";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
      >
        {displayName.split(" ")[0]}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-sm border border-border bg-brand-primary py-1 shadow-lg z-50">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 font-body text-sm text-text-secondary hover:bg-brand-secondary hover:text-text-primary transition-colors"
          >
            <Settings className="h-4 w-4" />
            My Account
          </Link>
          <Link
            href="/en/account/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 font-body text-sm text-text-secondary hover:bg-brand-secondary hover:text-text-primary transition-colors"
          >
            <Package className="h-4 w-4" />
            My Orders
          </Link>
          <Link
            href="/en/account/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 font-body text-sm text-text-secondary hover:bg-brand-secondary hover:text-text-primary transition-colors"
          >
            <Star className="h-4 w-4" />
            My Reviews
          </Link>
          <hr className="my-1 border-border" />
          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 font-body text-sm text-text-secondary hover:bg-brand-secondary hover:text-brand-burgundy transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
