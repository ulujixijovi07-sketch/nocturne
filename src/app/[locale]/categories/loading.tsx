export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 animate-pulse">
      <div className="mb-8 h-4 w-48 rounded bg-brand-secondary" />
      <div className="mb-8 h-8 w-64 rounded bg-brand-secondary" />
      <div className="flex gap-10">
        <div className="hidden w-1/4 space-y-4 lg:block">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 rounded bg-brand-secondary" style={{ width: `${80 - i * 10}%` }} />
          ))}
        </div>
        <div className="flex-1">
          <div className="mb-6 h-5 w-40 rounded bg-brand-secondary" />
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] rounded-sm bg-brand-secondary" />
                <div className="h-4 w-3/4 rounded bg-brand-secondary" />
                <div className="h-4 w-1/2 rounded bg-brand-secondary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
