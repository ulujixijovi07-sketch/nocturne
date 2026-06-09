export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 animate-pulse">
      <div className="h-4 w-32 bg-brand-secondary rounded mb-8" />
      <div className="h-10 w-64 bg-brand-secondary rounded mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] bg-brand-secondary rounded-sm" />
            <div className="h-4 w-3/4 bg-brand-secondary rounded" />
            <div className="h-3 w-1/2 bg-brand-secondary rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
