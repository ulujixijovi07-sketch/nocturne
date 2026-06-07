export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <h1 className="text-center font-display text-4xl font-light tracking-[0.15em] text-text-primary">
        30-Day Love It or Return It
      </h1>
      <p className="mt-4 text-center font-body text-base text-text-secondary">
        Not the perfect fit? We&apos;ll make it right.
      </p>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-light text-text-primary">
          How to Return
        </h2>
        <div className="space-y-6">
          <div className="flex gap-4 rounded-sm border border-border bg-brand-primary p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark font-body text-sm font-bold text-text-light">1</span>
            <div>
              <h3 className="font-body text-sm font-medium text-text-primary">Initiate your return</h3>
              <p className="mt-1 font-body text-sm text-text-secondary">
                Visit our returns portal (coming soon) or email us at returns@nocturne.com
                with your order number. We&apos;ll send you a prepaid return label within 24 hours.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-sm border border-border bg-brand-primary p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark font-body text-sm font-bold text-text-light">2</span>
            <div>
              <h3 className="font-body text-sm font-medium text-text-primary">Pack it up</h3>
              <p className="mt-1 font-body text-sm text-text-secondary">
                Place unworn items with original tags in the original packaging (or any plain box).
                All items must be unworn, unwashed, and in resalable condition.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-sm border border-border bg-brand-primary p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark font-body text-sm font-bold text-text-light">3</span>
            <div>
              <h3 className="font-body text-sm font-medium text-text-primary">Drop it off</h3>
              <p className="mt-1 font-body text-sm text-text-secondary">
                Drop your package at any carrier location. Once we receive it, we&apos;ll inspect
                and process your refund within 5–7 business days to your original payment method.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy details */}
      <section className="mt-14 space-y-6">
        <div className="rounded-sm border border-border bg-brand-primary p-5">
          <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Free Returns</h3>
          <p className="mt-2 font-body text-sm text-text-secondary">
            All domestic returns are completely free. We provide a prepaid return shipping label
            with every return request. International returns may incur a small shipping fee.
          </p>
        </div>
        <div className="rounded-sm border border-border bg-brand-primary p-5">
          <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Refund Timeline</h3>
          <p className="mt-2 font-body text-sm text-text-secondary">
            Once we receive and inspect your return, refunds are processed within 5–7 business
            days. Your bank may take an additional 2–5 days to post the credit. Sale items are
            eligible for exchange or store credit only.
          </p>
        </div>
        <div className="rounded-sm border border-border bg-brand-primary p-5">
          <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Exchanges</h3>
          <p className="mt-2 font-body text-sm text-text-secondary">
            Need a different size or color? Email us at exchanges@nocturne.com and we&apos;ll
            reserve your preferred item and send a return label for the original. Exchanges
            ship free once the original is received.
          </p>
        </div>
      </section>
    </div>
  );
}
