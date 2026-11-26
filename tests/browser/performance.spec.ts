import { expect, test } from "@playwright/test";

type LayoutShift = PerformanceEntry & { value: number; hadRecentInput: boolean };

test("sample local homepage vitals and resource delivery", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    let lcpMs = 0;
    let cls = 0;
    let windowScore = 0;
    let windowStart = 0;
    let previousShift = 0;
    let longTasks = 0;

    new PerformanceObserver((list) => {
      lcpMs = Math.round(list.getEntries().at(-1)?.startTime ?? lcpMs);
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShift[]) {
        if (entry.hadRecentInput) continue;
        if (entry.startTime - previousShift > 1000 || entry.startTime - windowStart > 5000) {
          windowScore = 0;
          windowStart = entry.startTime;
        }
        windowScore += entry.value;
        cls = Math.max(cls, windowScore);
        previousShift = entry.startTime;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      longTasks += list.getEntries().length;
    }).observe({ type: "longtask", buffered: true });

    Object.defineProperty(window, "readLocalPerformance", {
      value: () => ({
        lcpMs,
        cls: Number(cls.toFixed(4)),
        longTasks,
        fonts: performance.getEntriesByType("resource").filter((entry) => entry.name.endsWith(".woff2")).length,
      }),
    });
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const hero = page.getByRole("img", { name: "Teal chairs around a timber table by the café window" });
  await expect.poll(() => hero.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

  const readMetrics = () => page.evaluate(() => (window as unknown as {
    readLocalPerformance: () => { lcpMs: number; cls: number; longTasks: number; fonts: number };
  }).readLocalPerformance());
  await expect.poll(async () => (await readMetrics()).lcpMs).toBeGreaterThan(0);

  const stats = {
    ...(await readMetrics()),
    ...(await hero.evaluate((element) => {
      const image = element as HTMLImageElement;
      const resource = performance.getEntriesByName(image.currentSrc)[0] as PerformanceResourceTiming | undefined;
      return {
        heroVariant: new URL(image.currentSrc).searchParams.get("w"),
        heroBytes: resource?.encodedBodySize,
      };
    })),
  };
  await testInfo.attach("local-vitals", { body: JSON.stringify(stats), contentType: "application/json" });
  console.log(`Homepage sample (${testInfo.project.name}): ${JSON.stringify(stats)}`);
});
