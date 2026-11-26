import "server-only";

import type { Metadata } from "next";
import { site } from "@/data/site";

const brand = "Twenty Second Coffee";

const publicPages = {
  "/": {
    title: `${brand} | Neighbourhood café in Royal Wharf`,
    description: "Visit Twenty Second Coffee in Royal Wharf, London, for Pact coffee, pastries, light bites and drinks from the bar. See the menu, opening hours and upcoming events.",
  },
  "/menu": {
    title: `Drinks menu | ${brand}`,
    description: "Browse the Twenty Second Coffee drinks menu in Royal Wharf, from espresso and speciality teas to draught beer and cocktails.",
  },
  "/loyalty": {
    title: `Coffee Club loyalty card | ${brand}`,
    description: "Join the Twenty Second Coffee Club in Royal Wharf. Collect nine beans with qualifying coffee purchases and redeem your next standard coffee.",
  },
  "/events": {
    title: `Events in Royal Wharf | ${brand}`,
    description: "Find upcoming workshops and neighbourhood gatherings at Twenty Second Coffee in Royal Wharf, with dates and details from the organisers.",
  },
  "/about": {
    title: `About our Royal Wharf café | ${brand}`,
    description: "Meet Twenty Second Coffee, an independent neighbourhood café on Royal Crest Avenue in Royal Wharf, London.",
  },
  "/contact": {
    title: `Contact and opening hours | ${brand}`,
    description: "Find opening hours, contact details and directions to Twenty Second Coffee at 38 Royal Crest Avenue, Royal Wharf, London E16 2TF.",
  },
} as const;

export const publicPagePaths = Object.keys(publicPages);

export function parseSiteOrigin(value: string | undefined): URL | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol === "https:" && !url.username && !url.password &&
        url.pathname === "/" && !url.search && !url.hash && !url.port &&
        url.hostname.includes(".") && !url.hostname.endsWith(".localhost") &&
        !/^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) return url;
  } catch {
    // Keep canonical URLs and indexing disabled if launch configuration is invalid.
  }
  return undefined;
}

export const siteOrigin = parseSiteOrigin(process.env.SITE_URL);
export const indexableSite = process.env.NODE_ENV === "production" &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production") && Boolean(siteOrigin);

export function publicPageMetadata(path: keyof typeof publicPages): Metadata {
  const { title, description } = publicPages[path];
  const url = siteOrigin ? new URL(path, siteOrigin) : undefined;
  const image = siteOrigin ? new URL("/opengraph-image", siteOrigin) : undefined;

  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    robots: indexableSite ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: brand,
      title,
      description,
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: "Twenty Second Coffee in Royal Wharf" }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export function cafeStructuredData() {
  if (!siteOrigin || !indexableSite) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": new URL("/#cafe", siteOrigin).href,
    name: brand,
    url: siteOrigin.href,
    image: new URL("/opengraph-image", siteOrigin).href,
    address: { "@type": "PostalAddress", ...site.postalAddress },
    hasMap: site.mapsUrl,
  };
}
