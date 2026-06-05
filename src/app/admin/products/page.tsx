import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { collection: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-light text-text-primary">Products</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Name</th>
              <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Collection</th>
              <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Price</th>
              <th className="py-2 pr-4 font-accent text-xs text-text-secondary">Active</th>
              <th className="py-2 font-accent text-xs text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-2 pr-4 font-medium text-text-primary">{p.name}</td>
                <td className="py-2 pr-4 text-text-secondary">{p.collection?.name ?? "—"}</td>
                <td className="py-2 pr-4 text-text-secondary">${p.price.toFixed(2)}</td>
                <td className="py-2 pr-4">
                  <span className={p.isActive ? "text-brand-gold" : "text-text-secondary/50"}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-2">
                  <Link href={`/admin/products/${p.id}`} className="text-text-secondary underline hover:text-text-primary">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
