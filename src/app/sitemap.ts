import type { MetadataRoute } from "next";
import { indexableSite, publicPagePaths, siteOrigin } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexableSite || !siteOrigin) return [];
  const origin = siteOrigin;
  return publicPagePaths.map((path) => ({ url: new URL(path, origin).href }));
}
