import { afterEach, describe, expect, it, vi } from "vitest";
import { parseSiteOrigin } from "@/lib/seo";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("production SEO", () => {
  it("accepts only a bare HTTPS origin", () => {
    expect(parseSiteOrigin("https://coffee.example.test/")?.href).toBe("https://coffee.example.test/");
    for (const invalid of [undefined, "", "http://example.test", "https://localhost", "https://127.0.0.1", "https://user:pass@example.test", "https://example.test/cafe", "https://example.test/?preview=1"]) {
      expect(parseSiteOrigin(invalid)).toBeUndefined();
    }
  });

  it("leaves indexing and the sitemap disabled without the approved domain", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_URL", "");
    vi.resetModules();
    const { default: sitemap } = await import("@/app/sitemap");
    const { publicPageMetadata } = await import("@/lib/seo");
    expect(sitemap()).toEqual([]);
    expect(publicPageMetadata("/").robots).toEqual({ index: false, follow: false });
    expect(publicPageMetadata("/").alternates).toBeUndefined();
  });

  it("keeps staging deployments out of the index even if an origin is inherited", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_URL", "https://coffee.example.test");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.resetModules();
    const { indexableSite } = await import("@/lib/seo");
    expect(indexableSite).toBe(false);
  });
});
