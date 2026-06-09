import { ProductCard, type ProductCardProduct } from "./product-card";

type ProductGridProps = {
  products: ProductCardProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return (
      <p className="py-20 text-center font-body text-sm text-text-secondary">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
