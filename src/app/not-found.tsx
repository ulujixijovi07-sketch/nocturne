import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-10 h-px w-16 bg-brand-gold" aria-hidden="true" />

      <h1 className="font-display text-8xl font-light tracking-[0.25em] text-text-primary">
        404
      </h1>

      <p className="mt-6 font-body text-base font-light tracking-[0.15em] text-text-secondary">
        The page you're looking for doesn't exist.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded bg-brand-dark px-6 py-3 font-medium text-xs uppercase tracking-widest text-text-light hover:bg-brand-dark/90 transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/en/categories/all"
          className="rounded border border-border px-6 py-3 font-medium text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
        >
          Shop All
        </Link>
      </div>

      <div className="mt-10 h-px w-16 bg-brand-gold" aria-hidden="true" />
    </main>
  );
}
