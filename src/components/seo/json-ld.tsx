import type { Metadata } from "next";

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Organization ──────────────────────────────────────────────────────

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "NOCTURNE",
        url: "https://nocturne.com",
        logo: "https://nocturne.com/logo.png",
        description:
          "Dark luxury lingerie. Sensual, editorial, empowering. For the woman who owns her night.",
        foundingDate: "2024",
        contactPoint: {
          "@type": "ContactPoint",
          email: "hello@nocturne.com",
          contactType: "customer service",
        },
        sameAs: [
          "https://instagram.com/nocturne",
          "https://pinterest.com/nocturne",
          "https://tiktok.com/@nocturne",
        ],
      }}
    />
  );
}

// ─── Product ───────────────────────────────────────────────────────────

type ProductJsonLdProps = {
  name: string;
  description: string;
  slug: string;
  price: number;
  images: string[];
  inStock: boolean;
};

export function ProductJsonLd({
  name,
  description,
  slug,
  price,
  images,
  inStock,
}: ProductJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        url: `https://nocturne.com/products/${slug}`,
        image: images,
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: "USD",
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
        brand: {
          "@type": "Brand",
          name: "NOCTURNE",
        },
      }}
    />
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────

type FaqItem = { q: string; a: string };

export function FaqJsonLd({ questions }: { questions: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      }}
    />
  );
}

// ─── Breadcrumb ────────────────────────────────────────────────────────

type Crumb = { name: string; url: string };

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `https://nocturne.com${item.url}`,
        })),
      }}
    />
  );
}
