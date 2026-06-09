import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1A1817",
};

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
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${outfit.variable}`}
    >
      <head>
        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}
        {/* Meta Pixel */}
        {pixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`,
            }}
          />
        )}
      </head>
      <body className="min-h-screen antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
