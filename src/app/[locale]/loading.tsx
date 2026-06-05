export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-1 w-32 overflow-hidden rounded-full bg-brand-secondary">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-gold" />
        </div>
        <p className="font-body text-sm text-text-secondary">Loading…</p>
      </div>
    </div>
  );
}
