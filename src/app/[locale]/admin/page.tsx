import { getProducts, getCollections } from "@/lib/db";

export default async function AdminDashboard() {
  const products = await getProducts();
  const reviews = products.reduce((sum, p) => sum + (p.reviews?.length || 0), 0);
  const collections = await getCollections();

  return (
    <div>
      <h1 className="font-display text-2xl font-light text-text-primary">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: products.length },
          { label: "Collections", value: collections.length },
          { label: "Reviews", value: reviews },
        ].map((s) => (
          <div key={s.label} className="rounded border border-border bg-brand-primary p-6">
            <p className="font-accent text-xs uppercase tracking-widest text-text-secondary">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-light text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
