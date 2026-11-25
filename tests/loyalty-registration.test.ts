import { describe, expect, it } from "vitest";
import { validateLoyaltyRegistration } from "@/lib/loyalty/registration";

describe("validateLoyaltyRegistration", () => {
  it("normalises registration details and keeps marketing optional", () => {
    expect(
      validateLoyaltyRegistration({
        firstName: "  Amira  ",
        email: " AMIRA@EXAMPLE.COM ",
      }),
    ).toEqual({
      success: true,
      data: {
        firstName: "Amira",
        email: "amira@example.com",
        marketingConsent: false,
      },
    });
  });

  it("records marketing consent only for an explicit boolean true", () => {
    const granted = validateLoyaltyRegistration({
      firstName: "Amira",
      email: "amira@example.com",
      marketingConsent: true,
    });
    const ambiguous = validateLoyaltyRegistration({
      firstName: "Amira",
      email: "amira@example.com",
      marketingConsent: "true",
    });

    expect(granted.success && granted.data.marketingConsent).toBe(true);
    expect(ambiguous.success && ambiguous.data.marketingConsent).toBe(false);
  });

  it.each([
    [{}, "first name"],
    [{ firstName: "A", email: "a@example.com" }, "first name"],
    [{ firstName: "Amira", email: "not-an-email" }, "email"],
    [{ firstName: "Amira\nInjected", email: "a@example.com" }, "first name"],
  ])("rejects invalid registration data", (payload, expectedText) => {
    const result = validateLoyaltyRegistration(payload);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.toLowerCase()).toContain(expectedText);
  });
});
