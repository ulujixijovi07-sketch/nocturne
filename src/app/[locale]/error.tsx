"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl font-light text-text-primary/20">404</p>
      <h1 className="mt-4 font-display text-2xl font-light text-text-primary">
        Something went wrong
      </h1>
      <p className="mt-3 font-body text-sm text-text-secondary">
        We encountered an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded bg-brand-dark px-8 py-3 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90"
      >
        Try Again
      </button>
    </div>
  );
}
