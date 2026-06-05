export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 animate-pulse">
      <div className="mb-8 h-4 w-48 rounded bg-brand-secondary" />
      <div className="lg:flex lg:gap-12">
        <div className="aspect-[3/4] w-full rounded-sm bg-brand-secondary lg:w-3/5" />
        <div className="mt-8 flex-1 space-y-4 lg:mt-0">
          <div className="h-3 w-24 rounded bg-brand-secondary" />
          <div className="h-8 w-3/4 rounded bg-brand-secondary" />
          <div className="h-6 w-32 rounded bg-brand-secondary" />
          <div className="h-5 w-48 rounded bg-brand-secondary" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-full bg-brand-secondary" />
            ))}
          </div>
          <div className="h-12 w-full rounded bg-brand-secondary" />
        </div>
      </div>
    </div>
  );
}
