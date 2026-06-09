import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Free standard shipping over $99. Standard 5-15 days $4.99. Express 2-3 days $14.99. Discreet packaging guaranteed.",
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
