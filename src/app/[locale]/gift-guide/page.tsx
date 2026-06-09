import Link from "next/link";
import { getProducts } from "@/lib/db";

// Fetch real products and group by price
export default async function GiftGuidePage() {
  const allProducts = await getProducts();
  const activeProducts = allProducts.filter((p: any) => p.isActive && p.status === "ACTIVE");

  const sections = [
    {
      title: "Gifts Under $50",
      description: "Thoughtful luxuries that make an impression without the splurge. Perfect for first-time NOCTURNE gifting.",
      items: activeProducts.filter((p: any) => p.price < 50).slice(0, 4),
    },
    {
      title: "Gifts Under $150",
      description: "Elevate the gesture with pieces that feel truly indulgent. Our most-gifted range.",
      items: activeProducts.filter((p: any) => p.price >= 50 && p.price < 150).slice(0, 4),
    },
    {
      title: "Luxury Splurges",
      description: "For the moments that demand something extraordinary. Heirloom-quality pieces she'll treasure forever.",
      items: activeProducts.filter((p: any) => p.price >= 150).slice(0, 4),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-light tracking-[0.15em] text-text-primary">
          The NOCTURNE Gift Guide
        </h1>
        <p className="mt-4 font-body text-base text-text-secondary">
          Because the most memorable gift is the one that's worn against the skin.
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="mt-20">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-light text-text-primary">
              {section.title}
            </h2>
            <p className="mt-2 font-body text-sm text-text-secondary">
              {section.description}
            </p>
          </div>

          {section.items.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {section.items.map((item: any) => (
                <Link key={item.id} href={`/products/${item.slug}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden rounded-sm bg-brand-secondary">
                    <img
                      src={item.images?.[0]?.url || `https://picsum.photos/seed/${item.slug}/400/533`}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-medium text-text-primary">
                    {item.name}
                  </h3>
                  <p className="font-body text-sm text-text-secondary">
                    ${item.price.toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center font-body text-sm text-text-secondary py-8">
              No products in this range yet.
            </p>
          )}
        </section>
      ))}

      {/* Gift card promo */}
      <div className="mt-20 rounded-sm border border-brand-gold/30 bg-brand-primary p-10 text-center">
        <h2 className="font-display text-2xl font-light text-text-primary">
          Not sure what to choose?
        </h2>
        <p className="mt-3 font-body text-sm text-text-secondary">
          Gift cards are always the perfect fit. Available in any denomination,
          delivered instantly by email, and never expire.
        </p>
        <Link
          href="/account/gift-cards"
          className="mt-6 inline-block rounded bg-brand-gold px-10 py-4 font-medium text-xs uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          Send a Gift Card
        </Link>
      </div>
    </div>
  );
}
