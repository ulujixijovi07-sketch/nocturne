"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, ChevronDown, LogOut, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { label: "Collections", href: "/categories/all" },
  { label: "Lingerie", href: "/categories/lingerie-sets" },
  { label: "Bridal", href: "/categories/bridal-lingerie" },
  { label: "Self-Love", href: "/categories/self-love" },
  { label: "Sale", href: "/categories/all" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { user, logout, isLoggedIn } = useAuth();
  const pathname = usePathname();

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
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-8 left-0 right-0 z-40 h-16",
        "bg-brand-primary border-b border-border"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-2xl font-light tracking-[0.25em] text-text-primary shrink-0"
        >
          NOCTURNE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4 lg:gap-5">
          <button
            aria-label="Search"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Language Switcher */}
          <div ref={langMenuRef} className="relative hidden sm:block">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-brand-gold transition-colors"
            >
              <Globe className="h-4 w-4" />
              {currentLocale.toUpperCase()}
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-16 rounded-sm border border-border bg-brand-primary py-1 shadow-lg">
                {LOCALES.map((loc) => (
                  <Link
                    key={loc.code}
                    href={switchLocalePath(loc.code)}
                    onClick={() => setLangMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 text-center font-accent text-xs tracking-widest transition-colors",
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

          {/* Account / User Menu */}
          {isLoggedIn ? (
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
              >
                {user!.name.split(" ")[0]}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-sm border border-border bg-brand-primary py-1 shadow-lg">
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2.5 font-body text-sm text-text-secondary hover:bg-brand-secondary hover:text-text-primary transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2.5 font-body text-sm text-text-secondary hover:bg-brand-secondary hover:text-text-primary transition-colors"
                  >
                    Orders
                  </Link>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 font-body text-sm text-text-secondary hover:bg-brand-secondary hover:text-brand-burgundy transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/account"
              aria-label="Account"
              className="hidden sm:block text-text-secondary hover:text-text-primary transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          <Link
            href="/cart"
            aria-label={`Cart with ${totalItems} items`}
            className="relative text-text-secondary hover:text-text-primary transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-text-light bg-brand-burgundy">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          mobileMenuOpen
            ? "max-h-[500px] border-t border-border"
            : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-6 py-4 gap-1 bg-brand-primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="py-3 font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href="/account"
                className="py-3 font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Account
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 py-3 font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-brand-burgundy transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/account"
              className="py-3 font-accent text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              Account
            </Link>
          )}

          <hr className="my-1 border-border" />
          <div className="flex gap-4 py-2">
            {LOCALES.map((loc) => (
              <Link
                key={loc.code}
                href={switchLocalePath(loc.code)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-accent text-xs tracking-widest transition-colors",
                  currentLocale === loc.code
                    ? "text-brand-gold"
                    : "text-text-secondary hover:text-brand-gold"
                )}
              >
                {loc.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
