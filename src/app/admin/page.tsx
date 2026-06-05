import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [productCount, reviewCount, collectionCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isDeleted: false } }),
    prisma.collection.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "Total Products", value: productCount },
    { label: "Total Collections", value: collectionCount },
    { label: "Total Reviews", value: reviewCount },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-light text-text-primary">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded border border-border bg-brand-primary p-6">
            <p className="font-accent text-xs uppercase tracking-widest text-text-secondary">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-light text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
