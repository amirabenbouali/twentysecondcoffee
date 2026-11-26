import { describe, expect, it, vi } from "vitest";
import { handleContactRequest } from "@/lib/contact/handler";

const payload = {
  topic: "event",
  name: "Grace Hopper",
  email: "grace@example.com",
  message: "I would like to suggest a neighbourhood coffee morning.",
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  website: "",
};

function contactRequest(body: unknown, headers?: HeadersInit) {
  return new Request("https://twentysecond.test/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "twentysecond.test",
      origin: "https://twentysecond.test",
      "x-forwarded-proto": "https",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function dependencies() {
  return {
    checkRateLimit: vi.fn().mockResolvedValue({
      success: true,
      reset: Date.now() + 60_000,
    }),
    sendEmail: vi.fn().mockResolvedValue({
      accepted: true as const,
      providerId: "provider-id",
    }),
    reportOperationalError: vi.fn(),
  };
}

describe("handleContactRequest", () => {
  it("returns success only after the provider accepts the email", async () => {
    const deps = dependencies();
    const response = await handleContactRequest(contactRequest(payload), deps);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(deps.sendEmail).toHaveBeenCalledOnce();
  });

  it("returns an error when the provider rejects the email", async () => {
    const deps = dependencies();
    deps.sendEmail.mockResolvedValue({
      accepted: false,
      reason: "provider_rejected",
      providerStatus: 422,
    });

    const response = await handleContactRequest(contactRequest(payload), deps);

    expect(response.status).toBe(502);
    expect(deps.reportOperationalError).toHaveBeenCalledWith(
      "email_delivery_failed",
      { reason: "provider_rejected", providerStatus: 422 },
    );
  });

  it("rejects invalid input without calling the email provider", async () => {
    const deps = dependencies();
    const response = await handleContactRequest(
      contactRequest({ ...payload, email: "invalid" }),
      deps,
    );

    expect(response.status).toBe(400);
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a body larger than the server limit", async () => {
    const deps = dependencies();
    const response = await handleContactRequest(
      contactRequest({ ...payload, message: "x".repeat(12_001) }),
      deps,
    );

    expect(response.status).toBe(413);
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a filled honeypot without calling the email provider", async () => {
    const deps = dependencies();
    const response = await handleContactRequest(
      contactRequest({ ...payload, website: "https://spam.test" }),
      deps,
    );

    expect(response.status).toBe(400);
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("returns a retry time when the rate limit is exceeded", async () => {
    const deps = dependencies();
    deps.checkRateLimit.mockResolvedValue({
      success: false,
      reset: Date.now() + 60_000,
    });

    const response = await handleContactRequest(contactRequest(payload), deps);

    expect(response.status).toBe(429);
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects cross-origin submissions", async () => {
    const deps = dependencies();
    const response = await handleContactRequest(
      contactRequest(payload, { origin: "https://attacker.test" }),
      deps,
    );

    expect(response.status).toBe(403);
    expect(deps.checkRateLimit).not.toHaveBeenCalled();
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });
});

it("handles rejected delivery promises without logging error content", async () => {
  const deps = dependencies();
  deps.sendEmail.mockRejectedValue(new Error("private provider information"));

  const response = await handleContactRequest(contactRequest(payload), deps);

  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain("private provider information");
  expect(deps.reportOperationalError).toHaveBeenCalledWith(
    "email_delivery_failed",
    { reason: "provider_unavailable", providerStatus: undefined },
  );
});
