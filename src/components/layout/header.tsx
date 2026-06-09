"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { UserMenu } from "@/components/auth/user-menu";
import { ShoppingBag, List, X, Globe, SignOut, User, Package, MapPin, Gift, Heart, ChatCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useSession, signOut } from "next-auth/react";

const NAV_LINKS = [
  { label: "Collections", href: "/categories/all" },
  { label: "Lingerie", href: "/categories/lingerie-sets" },
  { label: "Bridal", href: "/categories/bridal-lingerie" },
  { label: "Self-Love", href: "/categories/self-love" },
  { label: "Sale", href: "/categories/all?sale=1" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  const LOCALES = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
    { code: "de", label: "DE" },
    { code: "es", label: "ES" },
    { code: "it", label: "IT" },
  ] as const;

  const currentLocale = pathname.split("/")[1] || "en";

  const switchLocalePath = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Floating Glass Pill */}
      <header className="fixed top-10 left-1/2 z-40 -translate-x-1/2">
        <div
          className={cn(
            "flex items-center gap-6 rounded-full border border-white/10 px-6 py-3",
            "bg-brand-dark/80 backdrop-blur-xl shadow-lg shadow-black/20",
            "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            mobileMenuOpen && "rounded-[2rem]"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-lg font-light tracking-[0.2em] text-text-primary shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            NOCTURNE
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-body text-[11px] font-medium uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <SearchOverlay />

            {/* Language Switcher */}
            <div ref={langMenuRef} className="relative hidden sm:block">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 font-body text-[11px] font-medium uppercase tracking-widest text-text-secondary hover:text-brand-gold transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                {currentLocale.toUpperCase()}
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-16 rounded-xl border border-white/10 bg-brand-dark/95 backdrop-blur-md py-1 shadow-xl">
                  {LOCALES.map((loc) => (
                    <Link
                      key={loc.code}
                      href={switchLocalePath(loc.code)}
                      onClick={() => setLangMenuOpen(false)}
                      className={cn(
                        "block px-3 py-2 text-center font-body text-xs font-medium tracking-widest transition-colors",
                        currentLocale === loc.code
                          ? "text-brand-gold"
                          : "text-text-secondary hover:text-brand-gold"
                      )}
                    >
                      {loc.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Account */}
            <UserMenu />

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Cart with ${totalItems} items`}
              className="relative text-text-secondary hover:text-text-primary transition-colors"
            >
              <ShoppingBag className="h-4 w-4" weight="light" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-text-light bg-brand-burgundy">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile List Toggle — hamburger morph */}
            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden relative h-6 w-6 text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span
                className={cn(
                  "absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen ? "top-3 rotate-45" : "top-1.5"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-3 block h-[1.5px] bg-current transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen ? "w-0 opacity-0" : "w-6 opacity-100"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen ? "top-3 -rotate-45" : "top-[18px]"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-brand-dark/95 backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-2">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "font-display text-3xl font-light tracking-wide text-text-secondary hover:text-text-primary transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                mobileMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: mobileMenuOpen ? `${150 + i * 75}ms` : "0ms" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-8 h-px w-12 bg-white/10" />

          {isLoggedIn ? (
            <>
              <Link
                href="/account"
                className={cn(
                  "font-body text-sm font-medium uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: mobileMenuOpen ? `${525}ms` : "0ms" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Account
              </Link>

              {/* Account sub-links — mobile only */}
              <div className="flex flex-col items-center gap-3 mt-2">
                <Link
                  href="/en/account/orders"
                  className={cn(
                    "flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wider text-text-secondary/70 hover:text-text-primary transition-all duration-700",
                    mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: mobileMenuOpen ? `${560}ms` : "0ms" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-3.5 w-3.5" />
                  Orders
                </Link>
                <Link
                  href="/en/account/addresses"
                  className={cn(
                    "flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wider text-text-secondary/70 hover:text-text-primary transition-all duration-700",
                    mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: mobileMenuOpen ? `${580}ms` : "0ms" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Addresses
                </Link>
                <Link
                  href="/en/account/gift-cards"
                  className={cn(
                    "flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wider text-text-secondary/70 hover:text-text-primary transition-all duration-700",
                    mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: mobileMenuOpen ? `${600}ms` : "0ms" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gift className="h-3.5 w-3.5" />
                  Gift Cards
                </Link>
                <Link
                  href="/en/account/wishlist"
                  className={cn(
                    "flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wider text-text-secondary/70 hover:text-text-primary transition-all duration-700",
                    mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: mobileMenuOpen ? `${620}ms` : "0ms" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-3.5 w-3.5" />
                  Wishlist
                </Link>
                <Link
                  href="/en/contact"
                  className={cn(
                    "flex items-center gap-2 font-body text-xs font-medium uppercase tracking-wider text-text-secondary/70 hover:text-text-primary transition-all duration-700",
                    mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: mobileMenuOpen ? `${640}ms` : "0ms" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChatCircle className="h-3.5 w-3.5" />
                  Contact Support
                </Link>
              </div>

              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 font-body text-sm font-medium uppercase tracking-widest text-text-secondary hover:text-brand-burgundy transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: mobileMenuOpen ? `${700}ms` : "0ms" }}
              >
                <SignOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className={cn(
                "font-body text-sm font-medium uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: mobileMenuOpen ? `${525}ms` : "0ms" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}

          <div className="mt-6 flex gap-4">
            {LOCALES.map((loc) => (
              <Link
                key={loc.code}
                href={switchLocalePath(loc.code)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-body text-xs font-medium tracking-widest transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                  currentLocale === loc.code ? "text-brand-gold" : "text-text-secondary hover:text-brand-gold"
                )}
                style={{ transitionDelay: mobileMenuOpen ? `${650}ms` : "0ms" }}
              >
                {loc.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
