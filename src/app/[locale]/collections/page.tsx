import Link from "next/link";
import { getCollections } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore NOCTURNE luxury lingerie collections.",
};

export default function CollectionsPage() {
  const collections = getCollections();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <h1 className="mb-2 text-center font-display text-4xl font-light tracking-[0.15em] text-text-primary">
        Our Collections
      </h1>
      <p className="mb-12 text-center font-body text-sm text-text-secondary">
        Each collection tells a story. Find yours.
      </p>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/all?collection=${c.slug}`}
            className="group relative block h-80 overflow-hidden rounded-sm"
          >
            <img
              src={c.heroImage || `https://picsum.photos/seed/${c.slug}/600/800`}
              alt={c.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="font-display text-2xl font-light tracking-[0.1em] text-text-light">
                {c.name}
              </h2>
              {c.description && (
                <p className="mt-1 font-body text-sm text-text-light/70">
                  {c.description}
                </p>
              )}
              <span className="mt-3 inline-block font-medium text-xs uppercase tracking-widest text-brand-gold">
                Explore {c.name} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
