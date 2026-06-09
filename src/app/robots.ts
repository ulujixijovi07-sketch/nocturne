import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/checkout/", "/admin/", "/auth/"],
    },
    sitemap: "https://lovenocturne.com/sitemap.xml",
  };
}
