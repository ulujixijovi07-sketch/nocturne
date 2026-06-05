const FAQS = [
  {
    category: "Sizing",
    questions: [
      { q: "How do I find my size?", a: "Use our Size Guide — measure your bust, waist, and hips, then compare against our size chart. For bras, measure your underbust for band size and fullest bust for cup. Still unsure? Email us at fit@nocturne.com." },
      { q: "What if I'm between sizes?", a: "We recommend sizing up for comfort or down for a more sculpted, compressive fit. Most NOCTURNE pieces include adjustable straps and bands for a customizable fit." },
      { q: "Do you offer extended sizes?", a: "Yes. Our sizes range from XS to 4XL, and our bras span 30A to 42H. We believe luxury has no size limit." },
      { q: "Can I get a custom size?", a: "At this time we don't offer fully custom sizing, but our fit specialists can help you find the closest match. Contact us for personalized advice." },
    ],
  },
  {
    category: "Orders",
    questions: [
      { q: "How do I track my order?", a: "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track through your Account page under My Orders." },
      { q: "Can I change or cancel my order?", a: "Orders process quickly. If you contact us within 2 hours of placing your order, we can usually make changes. Email orders@nocturne.com immediately." },
      { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and PayPal." },
      { q: "When will I be charged?", a: "Your payment is captured at the time you place your order. For pre-orders, you'll be charged at the time of reservation." },
    ],
  },
  {
    category: "Shipping",
    questions: [
      { q: "How long does shipping take?", a: "Standard shipping: 5–7 business days. Express shipping: 2–3 business days. International: 7–21 business days depending on region." },
      { q: "Do you ship internationally?", a: "Yes. We ship to over 40 countries worldwide. Rates and delivery times vary by region. See our Shipping page for full details." },
      { q: "Is shipping free?", a: "Standard domestic shipping is free on all orders over $299. International orders have a flat rate based on destination." },
      { q: "Is the packaging discreet?", a: "Absolutely. Every order ships in a plain, unmarked box. The return address and billing descriptor are discreet. What's inside is your business." },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      { q: "What is your return policy?", a: "You have 30 days from delivery to return any unworn, unwashed item with original tags attached. Domestic returns are free. See our Returns page for the full process." },
      { q: "When will I receive my refund?", a: "Refunds are processed within 5–7 business days after we receive and inspect your return. Your bank may take 2–5 additional days to post the credit." },
      { q: "Can I exchange an item?", a: "Yes. Email exchanges@nocturne.com with your order number and preferred size/color. We'll reserve the new item and send a return label for the original." },
      { q: "Are sale items returnable?", a: "Sale items are eligible for exchange or store credit only. Final sale items are marked as such and cannot be returned." },
    ],
  },
  {
    category: "Products & Care",
    questions: [
      { q: "How should I care for my NOCTURNE pieces?", a: "Most NOCTURNE pieces are crafted from silk, lace, and delicate fabrics. We recommend hand washing in cold water with a pH-neutral detergent. Lay flat to dry. Do not bleach, wring, or tumble dry." },
      { q: "What materials do you use?", a: "We use French leavers lace, silk charmeuse, silk chiffon, lambskin leather, and premium microfiber. All materials are sourced from ethical suppliers and tested for durability and comfort." },
      { q: "Are your products ethically made?", a: "Yes. We partner with ateliers that provide fair wages, safe working conditions, and sustainable practices. We visit every facility personally." },
      { q: "Do you offer gift wrapping?", a: "Every NOCTURNE order arrives in our signature black tissue paper inside a discreet box. Premium gift wrapping with a handwritten note is available at checkout for $5." },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <h1 className="text-center font-display text-4xl font-light tracking-[0.15em] text-text-primary">
        Frequently Asked Questions
      </h1>

      <div className="mt-14 space-y-10">
        {FAQS.map((section) => (
          <section key={section.category}>
            <h2 className="mb-6 border-b border-border pb-2 font-display text-2xl font-light text-text-primary">
              {section.category}
            </h2>
            <div className="divide-y divide-border">
              {section.questions.map((faq) => (
                <details key={faq.q} className="group">
                  <summary className="flex cursor-pointer items-center justify-between py-4 font-body text-sm font-medium text-text-primary marker:hidden hover:text-text-secondary">
                    {faq.q}
                    <span className="ml-4 text-xs text-text-secondary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-4 font-body text-sm leading-relaxed text-text-secondary">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
