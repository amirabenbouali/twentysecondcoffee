import "server-only";

import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const REQUEST_LIMIT = 5;
const WINDOW = "10 m";

let contactRateLimiter: Ratelimit | null = null;

function clientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function rateLimitConfiguration() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const secret = process.env.CONTACT_RATE_LIMIT_SECRET?.trim();

  if (!url || !token || !secret || secret.length < 32) return null;
  return { url, token, secret };
}

function limiter(url: string, token: string) {
  if (!contactRateLimiter) {
    contactRateLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(REQUEST_LIMIT, WINDOW),
      prefix: "twenty-second-contact",
    });
  }

  return contactRateLimiter;
}

export async function checkContactRateLimit(request: Request) {
  const config = rateLimitConfiguration();
  if (!config) throw new Error("CONTACT_RATE_LIMIT_NOT_CONFIGURED");

  const identifier = createHmac("sha256", config.secret)
    .update(clientAddress(request).slice(0, 200))
    .digest("hex");

  const result = await limiter(config.url, config.token).limit(identifier);
  return { success: result.success, reset: result.reset };
}
