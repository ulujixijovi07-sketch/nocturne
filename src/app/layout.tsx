import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nocturne-pi-livid.vercel.app"),
  title: {
    default: "NOCTURNE | Luxury Lingerie",
    template: "%s | NOCTURNE",
  },
  description:
    "NOCTURNE — Dark luxury lingerie. Sensual, editorial, empowering. For the woman who owns her night. Shop collections, bras, briefs, bodysuits, and more.",
  keywords: [
    "luxury lingerie",
    "dark lingerie",
    "sensual lingerie",
    "lingerie online",
    "designer lingerie",
  ],
  authors: [{ name: "NOCTURNE" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nocturne-pi-livid.vercel.app",
    siteName: "NOCTURNE",
    title: "NOCTURNE | Luxury Lingerie",
    description:
      "Dark luxury lingerie. Sensual, editorial, empowering. For the woman who owns her night.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NOCTURNE — Luxury Lingerie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOCTURNE | Luxury Lingerie",
    description:
      "Dark luxury lingerie. Sensual, editorial, empowering. For the woman who owns her night.",
  },
  alternates: {
    languages: {
      en: "/en",
      fr: "/fr",
      de: "/de",
      es: "/es",
      it: "/it",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${outfit.variable}`}
    >
      <body className="min-h-screen antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
