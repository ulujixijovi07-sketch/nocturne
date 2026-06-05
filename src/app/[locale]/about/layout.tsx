import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "NOCTURNE — For the woman who owns her night. Our philosophy: luxury should empower, body-positive, size-inclusive. Learn our story.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
