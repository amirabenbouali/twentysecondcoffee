import "server-only";

import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type LoyaltyRateLimitScope = "join" | "login" | "search" | "lookup" | "action";

const rules = {
  join: { requests: 5, window: "1 h" },
  login: { requests: 8, window: "15 m" },
  search: { requests: 60, window: "1 m" },
  lookup: { requests: 60, window: "1 m" },
  action: { requests: 90, window: "1 m" },
} as const;

const limiters = new Map<LoyaltyRateLimitScope, Ratelimit>();

export class LoyaltyRateLimitUnavailableError extends Error {
  constructor() {
    super("Loyalty rate limiting is not configured.");
    this.name = "LoyaltyRateLimitUnavailableError";
  }
}

function configuration() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const secret = process.env.LOYALTY_RATE_LIMIT_SECRET?.trim();
  if (!url || !token || !secret || secret.length < 32) return null;
  return { url, token, secret };
}

function clientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  ).slice(0, 200);
}

function limiter(scope: LoyaltyRateLimitScope, url: string, token: string) {
  const existing = limiters.get(scope);
  if (existing) return existing;
  const rule = rules[scope];
  const created = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(rule.requests, rule.window),
    prefix: `twenty-second-loyalty:${scope}`,
  });
  limiters.set(scope, created);
  return created;
}

export async function checkLoyaltyRateLimit(
  request: Request,
  scope: LoyaltyRateLimitScope,
  subject = "anonymous",
) {
  const config = configuration();
  if (!config) throw new LoyaltyRateLimitUnavailableError();
  const identifier = createHmac("sha256", config.secret)
    .update(`${scope}|${clientAddress(request)}|${subject.slice(0, 160)}`)
    .digest("hex");
  const result = await limiter(scope, config.url, config.token).limit(identifier);
  return { success: result.success, reset: result.reset };
}
