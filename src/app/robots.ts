import type { MetadataRoute } from "next";
import { indexableSite, siteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!indexableSite || !siteOrigin) return { rules: { userAgent: "*", disallow: "/" } };

  // Allow crawlers to receive noindex on exposed pages. Never list bearer-card URLs.
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", siteOrigin).href,
  };
}
