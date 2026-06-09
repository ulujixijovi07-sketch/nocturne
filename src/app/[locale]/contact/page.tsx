import { ContactForm } from "@/components/sections/contact-form";

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
        <ContactForm />

        {/* Contact info */}
        <div className="space-y-6">
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Email</h3>
            <p className="mt-2 font-body text-sm text-text-primary">hello@nocturne.com</p>
            <p className="mt-1 font-body text-xs text-text-secondary">General inquiries & customer support</p>
          </div>
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Press</h3>
            <p className="mt-2 font-body text-sm text-text-primary">press@nocturne.com</p>
            <p className="mt-1 font-body text-xs text-text-secondary">Media inquiries, collaborations, samples</p>
          </div>
          <div className="rounded-sm border border-border bg-brand-primary p-6">
            <h3 className="font-medium text-xs uppercase tracking-widest text-brand-gold">Partnerships</h3>
            <p className="mt-2 font-body text-sm text-text-primary">partners@nocturne.com</p>
            <p className="mt-1 font-body text-xs text-text-secondary">Affiliates, wholesale, brand collaborations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
