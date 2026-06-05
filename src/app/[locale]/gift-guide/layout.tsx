import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Guide",
  description: "The NOCTURNE gift guide — curated luxury lingerie gifts under $50, under $150, and luxury splurges. Find the perfect present.",
};

export default function GiftGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
