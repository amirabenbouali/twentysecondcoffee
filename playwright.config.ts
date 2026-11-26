import { defineConfig, devices } from "@playwright/test";

const port = 3197;
const origin = `http://127.0.0.1:${port}`;

// Empty overrides also take precedence over any of Next's local .env files.
const isolatedEnvironment = Object.fromEntries([
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
  "CRON_SECRET",
  "GOOGLE_WALLET_ISSUER_ID",
  "GOOGLE_WALLET_CLASS_SUFFIX",
  "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_WALLET_PRIVATE_KEY",
].map((key) => [key, ""]));

export default defineConfig({
  testDir: "./tests/browser",
  forbidOnly: Boolean(process.env.CI),
  workers: 2,
  use: { baseURL: origin, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" } },
  ],
  webServer: {
    command: `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: origin,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...isolatedEnvironment,
      NEXT_TELEMETRY_DISABLED: "1",
      SITE_URL: "https://coffee.example.test",
      VERCEL_ENV: "",
    },
  },
});
