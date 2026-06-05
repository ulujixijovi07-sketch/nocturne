export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <h1 className="text-center font-display text-4xl font-light tracking-[0.15em] text-text-primary">
        Privacy Policy
      </h1>
      <p className="mt-4 text-center font-body text-sm text-text-secondary">
        Last updated: January 2026
      </p>

      <div className="mt-14 space-y-10 font-body text-sm leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-4 font-display text-xl font-light text-text-primary">1. Information We Collect</h2>
          <p>When you visit NOCTURNE, we collect information you provide directly — such as your name, email address, shipping address, and payment details when you make a purchase. We also automatically collect certain technical information, including your IP address, browser type, device information, and browsing behavior on our site through cookies and similar technologies.</p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-light text-text-primary">2. How We Use Your Information</h2>
          <p>Your information is used to process orders, communicate about your purchases, personalize your shopping experience, and — only with your consent — send you marketing communications about new collections, private sales, and exclusive offers. We never sell, rent, or trade your personal information to third parties for their marketing purposes.</p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-light text-text-primary">3. Data Protection</h2>
          <p>We implement industry-standard security measures including SSL encryption, secure payment processing through Stripe, and restricted access to personal data. Payment information is tokenized and never stored on our servers. While we take every reasonable precaution, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-light text-text-primary">4. Cookies</h2>
          <p>We use cookies to remember your preferences, keep items in your cart, and understand how you interact with our site. You can disable cookies in your browser settings, but this may affect site functionality including shopping cart persistence and personalized recommendations.</p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-light text-text-primary">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. You may opt out of marketing communications by clicking the unsubscribe link in any email or by contacting us at privacy@nocturne.com. We will respond to data requests within 30 days as required by applicable law.</p>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-light text-text-primary">6. Contact</h2>
          <p>For questions about this privacy policy or to exercise your data rights, contact us at privacy@nocturne.com.</p>
        </section>
      </div>
    </div>
  );
}
