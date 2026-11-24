import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createMember: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/loyalty/auth", () => ({ isSameOrigin: () => true }));
vi.mock("@/lib/loyalty/rate-limit", () => ({
  checkLoyaltyRateLimit: mocks.rateLimit,
}));
vi.mock("@/lib/loyalty/db", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/loyalty/db")>();
  return { ...original, createLoyaltyMember: mocks.createMember };
});

import { POST } from "@/app/api/loyalty/join/route";
import { LoyaltyDatabaseError } from "@/lib/loyalty/db";

function request() {
  return new Request("https://staging.example.com/api/loyalty/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Amira",
      email: "amira@example.com",
      marketingConsent: false,
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rateLimit.mockResolvedValue({ success: true, reset: Date.now() + 60_000 });
});

describe("loyalty registration route", () => {
  it("returns a new private card location after atomic registration", async () => {
    mocks.createMember.mockResolvedValue({ public_code: "opaque-private-code" });
    const response = await POST(request());
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      cardUrl: "/loyalty/opaque-private-code",
    });
  });

  it("handles a duplicate without confirming that a particular email exists", async () => {
    mocks.createMember.mockRejectedValue(
      new LoyaltyDatabaseError("duplicate", 409, "23505"),
    );
    const response = await POST(request());
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.error).not.toContain("amira@example.com");
    expect(body.error).not.toContain("already registered");
  });

  it("fails closed if distributed rate limiting is unavailable", async () => {
    mocks.rateLimit.mockRejectedValue(new Error("redis unavailable"));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(mocks.createMember).not.toHaveBeenCalled();
  });
});
