const GIFT_SECTIONS = [
  {
    title: "Gifts Under $50",
    description: "Thoughtful luxuries that make an impression without the splurge. Perfect for first-time NOCTURNE gifting.",
    items: [
      { name: "Silk Blindfold", price: 29, image: "https://picsum.photos/seed/gift-blindfold/400/533" },
      { name: "Lace Choker", price: 39, image: "https://picsum.photos/seed/gift-choker/400/533" },
      { name: "Satin Eye Mask", price: 45, image: "https://picsum.photos/seed/gift-mask/400/533" },
      { name: "Velvet Scrunchie Set", price: 49, image: "https://picsum.photos/seed/gift-scrunchie/400/533" },
    ],
  },
  {
    title: "Gifts Under $150",
    description: "Elevate the gesture with pieces that feel truly indulgent. Our most-gifted range.",
    items: [
      { name: "Lace Bralette", price: 89, image: "https://picsum.photos/seed/gift-bralette/400/533" },
      { name: "Silk Chemise", price: 129, image: "https://picsum.photos/seed/gift-chemise/400/533" },
      { name: "Suspender Belt Set", price: 99, image: "https://picsum.photos/seed/gift-suspender/400/533" },
      { name: "Cashmere Robe", price: 149, image: "https://picsum.photos/seed/gift-robe/400/533" },
    ],
  },
  {
    title: "Luxury Splurges",
    description: "For the moments that demand something extraordinary. Heirloom-quality pieces she'll treasure forever.",
    items: [
      { name: "Silk Kimono", price: 399, image: "https://picsum.photos/seed/gift-kimono/400/533" },
      { name: "Full Lingerie Set", price: 499, image: "https://picsum.photos/seed/gift-set/400/533" },
      { name: "Bridal Corset", price: 599, image: "https://picsum.photos/seed/gift-corset/400/533" },
      { name: "Collection Wardrobe", price: 990, image: "https://picsum.photos/seed/gift-wardrobe/400/533" },
    ],
  },
];

export default function GiftGuidePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-light tracking-[0.15em] text-text-primary">
          The NOCTURNE Gift Guide
        </h1>
        <p className="mt-4 font-body text-base text-text-secondary">
          Because the most memorable gift is the one that&apos;s worn against the skin.
        </p>
      </div>

      {GIFT_SECTIONS.map((section) => (
        <section key={section.title} className="mt-20">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-light text-text-primary">
              {section.title}
            </h2>
            <p className="mt-2 font-body text-sm text-text-secondary">
              {section.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {section.items.map((item) => (
              <div key={item.name} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-sm bg-brand-secondary">
                  <img
                    src={item.image}
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
              </div>
            ))}
          </div>
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
        <a
          href="/account/gift-cards"
          className="mt-6 inline-block rounded bg-brand-gold px-10 py-4 font-medium text-xs font-medium uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90"
        >
          Send a Gift Card
        </a>
      </div>
    </div>
  );
}
