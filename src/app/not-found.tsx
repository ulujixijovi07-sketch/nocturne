import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-10 h-px w-16 bg-brand-gold" aria-hidden="true" />

      <h1 className="font-display text-8xl font-light tracking-[0.25em] text-text-primary">
        404
      </h1>

      <p className="mt-6 font-body text-base font-light tracking-[0.15em] text-text-secondary">
        Page not found
      </p>

      <Link
        href="/"
        className="mt-12 font-accent text-xs font-medium uppercase tracking-[0.3em] text-brand-gold transition-colors hover:text-brand-burgundy"
      >
        Return Home
      </Link>

      <div className="mt-10 h-px w-16 bg-brand-gold" aria-hidden="true" />
    </main>
  );
}
