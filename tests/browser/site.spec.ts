import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("home navigation and menu work with reduced motion", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Coffee bean introduction" })).toBeHidden();

  if (testInfo.project.name === "mobile") {
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  }

  await page.getByRole("link", { name: "View menu" }).click();
  await expect(page).toHaveURL(/\/menu$/);
  await page.getByRole("link", { name: "From the espresso machine" }).click();
  await expect(page).toHaveURL(/#coffee$/);
  await expect(page.getByRole("heading", { name: "Coffee", exact: true })).toBeVisible();
});

test("bean intro can be skipped and plays at most once per session", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?intro");
  const skip = page.getByRole("button", { name: "Skip intro" });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(skip).toBeHidden();
  await page.getByRole("link", { name: "View menu" }).click();
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("twenty-second-coffee-intro"))).toBe("seen");
  await expect(page.getByRole("dialog", { name: "Coffee bean introduction" })).toBeHidden();
});

test("contact form accepts confirmed delivery and recovers from a bad response", async ({ page }) => {
  await page.goto("/contact?topic=privacy");
  await expect(page.getByLabel("Subject")).toHaveValue("privacy");
  await page.getByLabel("Name", { exact: true }).fill("Synthetic Visitor");
  await page.getByLabel("Email", { exact: true }).fill("contact@example.invalid");
  await page.getByLabel("Message").fill("Synthetic test enquiry for the local browser test.");

  const contact = page.getByRole("region", { name: "Write to us." });
  const button = contact.getByRole("button", { name: "Send message" });
  const statuses = [{ status: 200, contentType: "text/html", body: "unexpected response" }, { status: 200, json: { ok: true } }];
  const submissions: string[] = [];
  await page.route("**/api/contact", async (route) => {
    submissions.push(route.request().postDataJSON().submissionId);
    const response = statuses.shift();
    await route.fulfill(response ?? { status: 500 });
  });

  await button.click();
  await expect(contact.getByRole("alert")).toContainText("could not send your message");
  await expect(button).toBeEnabled();
  await button.click();
  await expect(contact.getByRole("status")).toContainText("accepted for delivery");
  expect(submissions).toHaveLength(2);
  expect(submissions[0]).toBe(submissions[1]);
});

test("loyalty signup remains usable with blocked storage and a service failure", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Storage is blocked"); };
  });
  let optedIn: boolean | undefined;
  await page.route("**/api/loyalty/join", async (route) => {
    optedIn = route.request().postDataJSON().marketingConsent;
    await route.fulfill({ status: 503, json: { error: "Loyalty is temporarily unavailable." } });
  });
  await page.goto("/loyalty");
  await page.getByLabel("First name").fill("Synthetic");
  await page.getByLabel("Email", { exact: true }).fill("loyalty@example.invalid");
  const form = page.locator("form");
  await expect(form.getByRole("checkbox")).not.toBeChecked();
  const submit = form.getByRole("button", { name: /create/i });
  await submit.click();
  await expect(form.getByRole("alert")).toContainText("temporarily unavailable");
  await expect(submit).toBeEnabled();
  expect(optedIn).toBe(false);
});

test("private routes keep access and caching controls", async ({ request }) => {
  const staff = await request.get("/api/loyalty/staff/members");
  expect(staff.status()).toBe(401);
  expect(staff.headers()["cache-control"]).toContain("no-store");
  expect(staff.headers()["x-robots-tag"]).toContain("noindex");

  const card = await request.get("/loyalty/invalid");
  expect(card.status()).toBe(404);
  expect(card.headers()["x-robots-tag"]).toContain("noindex");
  expect(card.headers()["referrer-policy"]).toBe("no-referrer");

  const desk = await request.get("/staff/loyalty");
  expect(desk.headers()["permissions-policy"]).toContain("camera=(self)");
  expect(desk.headers()["x-robots-tag"]).toContain("noindex");
  expect(await desk.text()).not.toContain("Customer cards");
});

test("the demo loyalty QR and reward state work under CSP", async ({ page }) => {
  await page.goto("/preview/loyalty/card");
  const qr = page.getByRole("img", { name: "Demo QR code" });
  await expect.poll(() => qr.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText("One bean to go.")).toBeVisible();
  await page.getByRole("button", { name: "Reward ready" }).click();
  await expect(page.getByText("Your coffee is on us.")).toBeVisible();
});

test("production metadata, sitemap and social image use the configured origin", async ({ page, request }) => {
  const response = await page.goto("/");
  const headers = response!.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("script-src-attr 'none'");
  expect(headers["content-security-policy"]).not.toContain("'unsafe-eval'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
  for (const path of ["/", "/menu", "/loyalty", "/events", "/about", "/contact"]) {
    await page.goto(path);
    const canonical = new URL(path, "https://coffee.example.test");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", path === "/" ? canonical.origin : canonical.href);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Twenty Second Coffee/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https:\/\/coffee\.example\.test\/opengraph-image/);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://coffee.example.test/loyalty");
  expect(sitemap).not.toMatch(/\/staff|\/preview|\/loyalty\//);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://coffee.example.test/sitemap.xml");
  const card = await request.get("/opengraph-image");
  expect(card.ok()).toBeTruthy();
  expect(card.headers()["content-type"]).toContain("image/png");
  const image = await card.body();
  expect([image.readUInt32BE(16), image.readUInt32BE(20)]).toEqual([1200, 630]);
});

for (const path of ["/", "/menu", "/loyalty", "/events", "/about", "/contact"]) {
  test(`automated accessibility at ${path}`, async ({ page }) => {
    await page.goto(path);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
  });
}
