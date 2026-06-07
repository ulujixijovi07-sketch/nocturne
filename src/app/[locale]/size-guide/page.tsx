const SIZE_CHART = [
  { size: "XS", us: "0–2", bust: '31–32"', waist: '23–24"', hip: '33–34"' },
  { size: "S", us: "4–6", bust: '33–34"', waist: '25–26"', hip: '35–36"' },
  { size: "M", us: "8–10", bust: '35–36"', waist: '27–28"', hip: '37–38"' },
  { size: "L", us: "12–14", bust: '37–39"', waist: '29–31"', hip: '39–41"' },
  { size: "XL", us: "16–18", bust: '40–42"', waist: '32–34"', hip: '42–44"' },
  { size: "2XL", us: "20–22", bust: '43–45"', waist: '35–37"', hip: '45–47"' },
  { size: "3XL", us: "22–24", bust: '46–48"', waist: '38–40"', hip: '48–50"' },
  { size: "4XL", us: "24–26", bust: '49–51"', waist: '41–43"', hip: '51–53"' },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <h1 className="text-center font-display text-4xl font-light tracking-[0.15em] text-text-primary">
        Size Guide
      </h1>
      <p className="mt-4 text-center font-body text-base text-text-secondary">
        Find your perfect fit. Every body is a NOCTURNE body.
      </p>

      {/* How to measure */}
      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-light text-text-primary">
          How to Measure
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-sm border border-border bg-brand-primary p-5">
            <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Bust</h3>
            <p className="mt-2 font-body text-sm text-text-secondary">
              Measure around the fullest part of your bust, keeping the tape parallel
              to the floor. Wear an unpadded bra for accuracy.
            </p>
          </div>
          <div className="rounded-sm border border-border bg-brand-primary p-5">
            <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Waist</h3>
            <p className="mt-2 font-body text-sm text-text-secondary">
              Measure around the narrowest part of your natural waist, usually just
              above the belly button. Keep the tape snug but not tight.
            </p>
          </div>
          <div className="rounded-sm border border-border bg-brand-primary p-5">
            <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Hip</h3>
            <p className="mt-2 font-body text-sm text-text-secondary">
              Measure around the fullest part of your hips, usually 7–9 inches below
              your waist. Stand with your feet together.
            </p>
          </div>
        </div>
      </section>

      {/* Size chart */}
      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-light text-text-primary">
          Size Chart
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-body text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium text-xs uppercase tracking-widest text-text-secondary">Size</th>
                <th className="py-3 pr-4 font-medium text-xs uppercase tracking-widest text-text-secondary">US</th>
                <th className="py-3 pr-4 font-medium text-xs uppercase tracking-widest text-text-secondary">Bust</th>
                <th className="py-3 pr-4 font-medium text-xs uppercase tracking-widest text-text-secondary">Waist</th>
                <th className="py-3 font-medium text-xs uppercase tracking-widest text-text-secondary">Hip</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-b border-border">
                  <td className="py-3 pr-4 font-medium text-text-primary">{row.size}</td>
                  <td className="py-3 pr-4 text-text-secondary">{row.us}</td>
                  <td className="py-3 pr-4 text-text-secondary">{row.bust}</td>
                  <td className="py-3 pr-4 text-text-secondary">{row.waist}</td>
                  <td className="py-3 text-text-secondary">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bra sizing */}
      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-light text-text-primary">
          Bra Sizing
        </h2>
        <div className="space-y-4 font-body text-sm leading-relaxed text-text-secondary">
          <p>
            <strong className="text-text-primary">Band size:</strong> Measure around your ribcage
            directly under your bust. Round to the nearest whole number. If the number is even,
            add 4 inches; if odd, add 5 inches. This is your band size.
          </p>
          <p>
            <strong className="text-text-primary">Cup size:</strong> Measure around the fullest
            part of your bust. Subtract your band measurement from this number. Each inch of
            difference equals one cup size: 1&quot; = A, 2&quot; = B, 3&quot; = C, 4&quot; = D,
            5&quot; = DD/E.
          </p>
          <p>
            Example: Underbust 30&quot; + 4 = 34 band. Bust 37&quot; − 34 = 3&quot; = C cup.
            Result: 34C.
          </p>
        </div>
      </section>

      {/* Tips */}
      <section className="mt-14 rounded-sm border border-brand-gold/30 bg-brand-primary p-6">
        <h2 className="font-display text-xl font-light text-text-primary">
          Find Your Perfect Fit
        </h2>
        <ul className="mt-4 space-y-2 font-body text-sm text-text-secondary">
          <li>• If you&apos;re between sizes, size up for comfort or down for a more sculpted fit.</li>
          <li>• Lingerie should feel like a second skin — never pinch, dig, or leave marks.</li>
          <li>• Straps should stay in place without slipping; adjust them every few wears.</li>
          <li>• Watch our fit tutorial video (coming soon) for a visual walkthrough.</li>
        </ul>
      </section>

      {/* Video placeholder */}
      <div className="mt-10 flex aspect-video items-center justify-center rounded-sm bg-brand-secondary">
        <p className="font-body text-sm text-text-secondary">Fit video tutorial — coming soon</p>
      </div>
    </div>
  );
}
