import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendContactEmail } from "@/lib/contact/email";

const contact = {
  topic: "feedback" as const,
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "The coffee was excellent.",
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
};

describe("sendContactEmail", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv(
      "CONTACT_FROM_EMAIL",
      "twenty second coffee <website@coffee.example>",
    );
    vi.stubEnv("CONTACT_TO_EMAIL", "approved@coffee.example");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("accepts only a successful provider response containing an email id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "provider-id" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendContactEmail(contact)).resolves.toEqual({
      accepted: true,
      providerId: "provider-id",
    });

    const [, request] = fetchMock.mock.calls[0];
    expect(request.headers.Authorization).toBe("Bearer re_test_key");
    expect(request.headers["Idempotency-Key"]).toBe(
      `contact-form/${contact.submissionId}`,
    );
    expect(JSON.parse(request.body)).toMatchObject({
      to: ["approved@coffee.example"],
      reply_to: "ada@example.com",
    });
  });

  it("fails closed when delivery is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendContactEmail(contact)).resolves.toEqual({
      accepted: false,
      reason: "not_configured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not accept an unsuccessful provider response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "rejected" }), { status: 422 }),
      ),
    );

    await expect(sendContactEmail(contact)).resolves.toEqual({
      accepted: false,
      reason: "provider_rejected",
      providerStatus: 422,
    });
  });
});
