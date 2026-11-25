import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkLoyaltyRateLimit,
  LoyaltyRateLimitUnavailableError,
} from "@/lib/loyalty/rate-limit";

afterEach(() => vi.unstubAllEnvs());

describe("distributed loyalty rate limiting", () => {
  it("fails closed when the serverless rate limiter is not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("LOYALTY_RATE_LIMIT_SECRET", "");
    await expect(
      checkLoyaltyRateLimit(new Request("https://staging.example.com"), "login"),
    ).rejects.toBeInstanceOf(LoyaltyRateLimitUnavailableError);
  });

  it("rejects a secret that is too short", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://staging.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubEnv("LOYALTY_RATE_LIMIT_SECRET", "short");
    await expect(
      checkLoyaltyRateLimit(new Request("https://staging.example.com"), "join"),
    ).rejects.toBeInstanceOf(LoyaltyRateLimitUnavailableError);
  });
});
