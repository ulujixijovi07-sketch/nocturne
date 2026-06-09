import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  IconArrowRight,
  IconPawPrint,
  IconDiamond,
  IconHeart,
  IconPackage,
  IconRuler,
  IconScissors,
  IconTShirt,
  IconSparkle,
} from "@/components/ui/icons";
import { getProducts, getCollections } from "@/lib/db";
import { ProductGrid } from "@/components/product/product-grid";
import { NewsletterForm } from "@/components/sections/newsletter-form";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { SocialProofBar } from "@/components/sections/social-proof";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import enMessages from "../../../messages/en.json";
import frMessages from "../../../messages/fr.json";
import deMessages from "../../../messages/de.json";
import esMessages from "../../../messages/es.json";
import itMessages from "../../../messages/it.json";

const messagesByLocale: Record<string, typeof enMessages> = {
  en: enMessages,
  fr: frMessages,
  de: deMessages,
  es: esMessages,
  it: itMessages,
};



const INSTAGRAM_ICON = (
  <svg
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const INSTAGRAM_IMAGES = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  src: "", // placeholder
  alt: `Instagram post ${i + 1}`,
}));

// ─── Metadata per locale ──────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = messagesByLocale[locale]?.home || enMessages.home;
  return {
    title: { absolute: t.title },
    description: t.description,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = messagesByLocale[locale]?.home || enMessages.home;

  const products = await getProducts(8);
  const collections = await getCollections(4);

  return (
    <>
      <OrganizationJsonLd />
      <div>
      {/* ════════════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6"
        style={{
          background: "linear-gradient(135deg, #1a1817 0%, #2d2520 50%, #1a1817 100%)",
        }}
      >
        <div className="absolute inset-0 bg-brand-dark/40" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-10 h-px w-16 bg-brand-gold" aria-hidden="true" />
          <h1 className="font-display text-5xl font-light tracking-[0.15em] text-text-light md:text-9xl md:tracking-[0.3em]">
            {t.brand}
          </h1>
          <p className="mt-4 font-body text-base tracking-widest text-text-light/80 md:mt-6 md:text-lg">
            For the woman who owns her night.
          </p>
          <Link
            href="/categories/all"
            className="mt-10 inline-block rounded bg-brand-gold px-8 py-3 font-body text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90 md:mt-12 md:px-10 md:py-4"
          >
            Explore Our Products
          </Link>
          <div className="mt-10 h-px w-16 bg-brand-gold" aria-hidden="true" />
        </div>
      </section>

      {/* Social Proof Bar */}
      <SocialProofBar />

      {/* ════════════════════════════════════════════════════════════════
          FEATURED COLLECTIONS
          ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <h2 className="mb-12 text-center font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Our Collections
        </h2>
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {collections.slice(0, 3).map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group relative h-56 overflow-hidden rounded-sm md:h-80"
              >
                {collection.heroImage ? (
                  <Image
                    src={collection.heroImage}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-brand-secondary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl font-medium text-text-light">
                    {collection.name}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 font-body text-[11px] font-medium uppercase tracking-widest text-brand-gold transition-colors group-hover:text-brand-gold/80">
                    Explore {collection.name}
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
            {/* 4th card — More Collections */}
            <Link
              href="https://lovenocturne.com/collections"
              className="group relative h-56 overflow-hidden rounded-sm md:h-80"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-secondary to-brand-dark" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-medium text-text-light">
                  更多系列
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 font-body text-[11px] font-medium uppercase tracking-widest text-brand-gold transition-colors group-hover:text-brand-gold/80">
                  More Collections
                  <IconArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        ) : (
          <p className="py-12 text-center font-body text-sm text-text-secondary">
            No collections found.
          </p>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SHOP BY CATEGORY
          ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <h2 className="mb-12 text-center font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Bras */}
          <Link
            href="/categories/bras"
            className="group relative col-span-2 flex min-h-[140px] flex-col justify-end overflow-hidden rounded-sm bg-brand-secondary p-5 transition-shadow hover:shadow-lg md:col-span-2 md:row-span-2 md:min-h-[320px] md:p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
            <div className="relative z-10">
              <IconHeart className="mb-3 h-8 w-8 text-brand-gold" />
              <span className="block font-display text-2xl font-light tracking-wide text-text-light">Bras</span>
              <span className="mt-1 block font-body text-sm text-text-light/70">From delicate lace to structured support</span>
            </div>
          </Link>
          {/* Briefs */}
          <Link
            href="/categories/briefs-thongs"
            className="group flex h-28 flex-col items-center justify-center gap-2 rounded-sm bg-brand-secondary transition-shadow hover:shadow-md md:h-40 md:gap-3"
          >
            <IconScissors className="h-7 w-7 text-brand-gold transition-transform duration-500 group-hover:scale-110" />
            <span className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary transition-colors group-hover:text-text-primary">Briefs</span>
          </Link>
          {/* Bodysuits */}
          <Link
            href="/categories/bodysuits-teddies"
            className="group flex h-28 flex-col items-center justify-center gap-2 rounded-sm bg-brand-secondary transition-shadow hover:shadow-md md:h-40 md:gap-3"
          >
            <IconTShirt className="h-7 w-7 text-brand-gold transition-transform duration-500 group-hover:scale-110" />
            <span className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary transition-colors group-hover:text-text-primary">Bodysuits</span>
          </Link>
          {/* Hosiery */}
          <Link
            href="/categories/hosiery"
            className="group flex h-28 flex-col items-center justify-center gap-2 rounded-sm bg-brand-secondary transition-shadow hover:shadow-md md:h-40 md:gap-3"
          >
            <IconPawPrint className="h-7 w-7 text-brand-gold transition-transform duration-500 group-hover:scale-110" />
            <span className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary transition-colors group-hover:text-text-primary">Hosiery</span>
          </Link>
          {/* Bridal */}
          <Link
            href="/categories/bridal-lingerie"
            className="group relative col-span-1 row-span-2 flex min-h-[240px] flex-col justify-end overflow-hidden rounded-sm bg-brand-secondary p-5 transition-shadow hover:shadow-lg md:col-span-2 md:row-auto md:min-h-[200px] md:p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
            <div className="relative z-10">
              <IconDiamond className="mb-2 h-7 w-7 text-brand-gold" />
              <span className="block font-display text-xl font-light tracking-wide text-text-light">Bridal</span>
            </div>
          </Link>
          {/* Self-Love */}
          <Link
            href="/categories/self-love"
            className="group flex h-28 flex-col items-center justify-center gap-2 rounded-sm bg-brand-secondary transition-shadow hover:shadow-md md:h-40 md:gap-3"
          >
            <IconSparkle className="h-7 w-7 text-brand-gold transition-transform duration-500 group-hover:scale-110" />
            <span className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary transition-colors group-hover:text-text-primary">Self-Love</span>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BUNDLE PROMO BANNER
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center lg:px-8">
          <h2 className="font-display text-3xl font-light tracking-[0.1em] text-text-light sm:text-4xl md:text-5xl">
            Curate Your Set.
          </h2>
          <p className="mt-3 font-display text-2xl font-light tracking-[0.05em] text-brand-gold sm:text-3xl">
            Choose 3+ items, save 20%.
          </p>
          <p className="mt-6 font-body text-base font-light tracking-wide text-text-light/70">
            Mix and match across any collection.
          </p>
          <Link
            href="/collections"
            className="mt-10 inline-block rounded bg-brand-gold px-10 py-4 font-body text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
          >
            Start Building
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BRAND VALUES
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-light">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 md:py-24">
          <h2 className="mb-8 text-center font-display text-3xl font-light tracking-[0.15em] text-text-dark md:mb-16">
            The NOCTURNE Difference
          </h2>
          <div className="space-y-8 md:space-y-20">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-dark">
                <IconHeart className="h-7 w-7 text-brand-gold" />
              </div>
              <div className="md:text-left">
                <h3 className="font-display text-2xl font-medium text-text-dark">Body Positive</h3>
                <p className="mt-3 max-w-md font-body text-base leading-relaxed text-text-secondary">Designed for every curve, every angle, every form. Luxury that celebrates you exactly as you are.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 md:flex-row-reverse md:gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-dark">
                <IconRuler className="h-7 w-7 text-brand-gold" />
              </div>
              <div className="md:text-right">
                <h3 className="font-display text-2xl font-medium text-text-dark">Inclusive Sizing</h3>
                <p className="mt-3 max-w-md font-body text-base leading-relaxed text-text-secondary">From 30A to 42H, our pieces are engineered for fit, not compromise. Because luxury has no size limit.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-dark">
                <IconPackage className="h-7 w-7 text-brand-gold" />
              </div>
              <div className="md:text-left">
                <h3 className="font-display text-2xl font-medium text-text-dark">Discreet Luxury</h3>
                <p className="mt-3 max-w-md font-body text-base leading-relaxed text-text-secondary">Unmarked packaging, private billing, and delivery that respects your privacy. Your secret is safe with us.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          NEW ARRIVALS
          ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <h2 className="mb-10 text-center font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          New Arrivals
        </h2>
        <ProductGrid products={products} />
      </section>

      {/* ════════════════════════════════════════════════════════════════
          INSTAGRAM
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-light py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-center gap-3">
            <span className="text-text-dark">{INSTAGRAM_ICON}</span>
            <h2 className="font-display text-3xl font-light tracking-[0.1em] text-text-dark">
              Follow @nocturne
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {INSTAGRAM_IMAGES.map((img) => (
              <a
                key={img.id}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 via-brand-secondary/60 to-brand-dark/80 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center text-brand-gold/30 text-2xl">✦</div>
                <div className="absolute inset-0 bg-brand-gold/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <RecentlyViewed />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          NEWSLETTER
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-dark">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <h2 className="font-display text-3xl font-light tracking-[0.1em] text-text-light sm:text-4xl">
            Join the Nocturne Society
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-base leading-relaxed text-text-light/70">
            Sign up for exclusive access to new collections, private sales,
            and 10% off your first order.
          </p>
          <div className="mt-10">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
export const dynamic = 'force-dynamic';
