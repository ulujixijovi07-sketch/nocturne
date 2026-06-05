export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <h1 className="text-center font-display text-4xl font-light tracking-[0.15em] text-text-primary">
        Contact Us
      </h1>
      <p className="mt-4 text-center font-body text-sm text-text-secondary">
        We respond within 24 hours.
      </p>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        {/* Contact form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Name</label>
            <input type="text" required className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Email</label>
            <input type="email" required className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Subject</label>
            <select className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-gold">
              <option>General Inquiry</option>
              <option>Order Help</option>
              <option>Returns & Exchanges</option>
              <option>Sizing & Fit</option>
              <option>Press & Partnerships</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-accent text-xs uppercase tracking-widest text-text-secondary">Message</label>
            <textarea required rows={5} className="w-full rounded-sm border border-border bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none" placeholder="How can we help?" />
          </div>
          <button type="submit" className="w-full rounded bg-brand-dark py-4 font-accent text-xs font-medium uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90">
            Send Message
          </button>
        </form>

        {/* Contact info */}
        <div className="space-y-6">
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h3 className="font-accent text-xs uppercase tracking-widest text-brand-gold">Email</h3>
            <p className="mt-2 font-body text-sm text-text-primary">hello@nocturne.com</p>
            <p className="mt-1 font-body text-xs text-text-secondary">General inquiries & customer support</p>
          </div>
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h3 className="font-accent text-xs uppercase tracking-widest text-brand-gold">Press</h3>
            <p className="mt-2 font-body text-sm text-text-primary">press@nocturne.com</p>
            <p className="mt-1 font-body text-xs text-text-secondary">Media inquiries, collaborations, samples</p>
          </div>
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h3 className="font-accent text-xs uppercase tracking-widest text-brand-gold">Partnerships</h3>
            <p className="mt-2 font-body text-sm text-text-primary">partners@nocturne.com</p>
            <p className="mt-1 font-body text-xs text-text-secondary">Affiliates, wholesale, brand collaborations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
