import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about NOCTURNE sizing, orders, shipping, returns, products, and payments.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
