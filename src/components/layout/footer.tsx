"use client";

import Link from "next/link";

const SHOP_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Lingerie Sets", href: "/categories/lingerie-sets" },
  { label: "Bras", href: "/categories/bras" },
  { label: "Briefs", href: "/categories/briefs-thongs" },
  { label: "Bodysuits", href: "/categories/bodysuits-teddies" },
  { label: "Hosiery", href: "/categories/hosiery" },
  { label: "Bridal", href: "/categories/bridal-lingerie" },
  { label: "Self-Love", href: "/categories/self-love" },
  { label: "Sale", href: "/categories/all" },
];

const HELP_LINKS = [
  { label: "Size Guide", href: "/size-guide" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Track Order", href: "/track-order" },
];

const ABOUT_LINKS = [
  { label: "Our Story", href: "/our-story" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Careers", href: "/careers" },
  { label: "Affiliates", href: "/affiliates" },
  { label: "Press", href: "/press" },
];

function PaymentBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-brand-light/50">
      <span className="rounded border border-brand-light/20 px-1.5 py-0.5 text-[10px] font-bold">
        {label === "APPLE PAY" ? "" : ""}
      </span>
      {label}
    </span>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-light">
      {children}
    </h3>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block py-1 font-body text-[13px] font-light text-brand-light/60 hover:text-brand-gold transition-colors duration-200"
    >
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--bg-dark)" }}>
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: SHOP */}
          <div>
            <ColumnTitle>Shop</ColumnTitle>
            <nav className="flex flex-col">
              {SHOP_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 2: HELP */}
          <div>
            <ColumnTitle>Help</ColumnTitle>
            <nav className="flex flex-col">
              {HELP_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 3: ABOUT */}
          <div>
            <ColumnTitle>About</ColumnTitle>
            <nav className="flex flex-col">
              {ABOUT_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 4: CONNECT */}
          <div>
            <ColumnTitle>Connect</ColumnTitle>
            <div className="flex items-center gap-4 mb-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-brand-light/60 hover:text-brand-gold transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-brand-light/60 hover:text-brand-gold transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.89a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-brand-light/60 hover:text-brand-gold transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.17-.1-.95-.2-2.41.04-3.44.22-.94 1.42-6.04 1.42-6.04s-.36-.72-.36-1.79c0-1.68.97-2.93 2.18-2.93 1.03 0 1.53.77 1.53 1.7 0 1.03-.66 2.58-1 4.01-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.25 3.78-5.5 0-2.88-2.07-4.89-5.02-4.89-3.42 0-5.43 2.57-5.43 5.22 0 1.03.4 2.14.9 2.74.1.12.11.22.08.34l-.33 1.34c-.05.21-.17.26-.39.15-1.45-.67-2.36-2.78-2.36-4.48 0-3.64 2.65-6.99 7.63-6.99 4.01 0 7.12 2.86 7.12 6.67 0 3.98-2.51 7.19-6 7.19-1.17 0-2.27-.61-2.64-1.33l-.72 2.74c-.26 1-.97 2.25-1.44 3.01C14.09 23.71 15.01 24 16 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
                </svg>
              </a>
            </div>

            {/* Newsletter Signup */}
            <div>
              <p className="mb-3 font-body text-[13px] font-light text-brand-light/60">
                Subscribe for exclusive access to new collections and private sales.
              </p>
              <form
                className="flex gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 rounded border border-brand-light/20 bg-transparent px-3 py-2 font-body text-[13px] text-brand-light placeholder:text-brand-light/30 focus:outline-none focus:border-brand-gold/50 transition-colors"
                />
                <button
                  type="submit"
                  className="rounded px-4 py-2 font-accent text-[11px] uppercase tracking-widest text-brand-dark transition-colors"
                  style={{ backgroundColor: "var(--accent-gold)" }}
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-light/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-6 lg:flex-row lg:justify-between lg:px-8">
          {/* Copyright */}
          <p className="font-body text-[12px] font-light text-brand-light/30">
            &copy; {new Date().getFullYear()} NOCTURNE. All rights reserved.
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-4">
            <PaymentBadge label="VISA" />
            <span className="text-brand-light/10">|</span>
            <PaymentBadge label="MC" />
            <span className="text-brand-light/10">|</span>
            <PaymentBadge label="AMEX" />
            <span className="text-brand-light/10">|</span>
            <PaymentBadge label="APPLE PAY" />
          </div>

          {/* SSL Trust */}
          <div className="flex items-center gap-2 font-body text-[11px] font-light tracking-wide text-brand-light/50">
            <span>🔒</span>
            <span>SSL Encrypted</span>
            <span className="text-brand-light/20">·</span>
            <span>Your data is always protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
