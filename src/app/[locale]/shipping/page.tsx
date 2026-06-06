const INTERNATIONAL_RATES = [
  { region: "Europe", rate: "$14.99", time: "7–14 days" },
  { region: "Australia / NZ", rate: "$19.99", time: "10–21 days" },
  { region: "Asia", rate: "$19.99", time: "10–21 days" },
  { region: "Middle East", rate: "$24.99", time: "10–21 days" },
  { region: "South America", rate: "$24.99", time: "14–28 days" },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <h1 className="text-center font-display text-4xl font-light tracking-[0.15em] text-text-primary">
        Shipping
      </h1>
      <p className="mt-4 text-center font-body text-base text-text-secondary">
        Your secrets, delivered with care.
      </p>

      {/* Domestic shipping */}
      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-light text-text-primary">
          Domestic Shipping
        </h2>
        <div className="space-y-4">
          <div className="rounded-sm border border-border bg-brand-primary p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-body text-sm font-medium text-text-primary">Standard</h3>
                <p className="font-body text-xs text-text-secondary">5–7 business days</p>
              </div>
              <span className="font-body text-sm text-text-primary">$4.99</span>
            </div>
          </div>
          <div className="rounded-sm border border-border bg-brand-primary p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-body text-sm font-medium text-text-primary">Express</h3>
                <p className="font-body text-xs text-text-secondary">2–3 business days</p>
              </div>
              <span className="font-body text-sm text-text-primary">$14.99</span>
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-sm bg-brand-secondary px-4 py-3 font-body text-sm text-brand-gold">
          "Free standard shipping on all orders over $99.",
        </p>
      </section>

      {/* International */}
      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-light text-text-primary">
          International Shipping
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-body text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-accent text-xs uppercase tracking-widest text-text-secondary">Region</th>
                <th className="py-3 pr-4 font-accent text-xs uppercase tracking-widest text-text-secondary">Rate</th>
                <th className="py-3 font-accent text-xs uppercase tracking-widest text-text-secondary">Delivery Time</th>
              </tr>
            </thead>
            <tbody>
              {INTERNATIONAL_RATES.map((row) => (
                <tr key={row.region} className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-text-primary">{row.region}</td>
                  <td className="py-3 pr-4 text-text-secondary">{row.rate}</td>
                  <td className="py-3 text-text-secondary">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Discreet packaging */}
      <section className="mt-14 rounded-sm border border-border bg-brand-primary p-8 text-center">
        <h2 className="font-display text-xl font-light text-text-primary">
          Discreet Packaging Guarantee
        </h2>
        <p className="mt-4 font-body text-sm leading-relaxed text-text-secondary">
          Every NOCTURNE order ships in a plain, unmarked box with no branding on the exterior.
          The return address reads &quot;NTC Fulfillment&quot; — nothing more. Your billing
          statement will show a similarly discreet descriptor. What&apos;s inside is your secret.
        </p>
      </section>
    </div>
  );
}
