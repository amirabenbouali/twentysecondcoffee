import { describe, expect, it } from "vitest";
import { validateContactPayload } from "@/lib/contact/validation";

const validPayload = {
  topic: "feedback",
  name: "  Ada Lovelace  ",
  email: "  ADA@EXAMPLE.COM ",
  message: "  The coffee was excellent.  ",
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  website: "",
};

describe("validateContactPayload", () => {
  it("normalises and accepts a valid message", () => {
    const result = validateContactPayload(validPayload);

    expect(result).toEqual({
      success: true,
      data: {
        topic: "feedback",
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "The coffee was excellent.",
        submissionId: "123e4567-e89b-42d3-a456-426614174000",
      },
      honeypotFilled: false,
    });
  });

  it.each([
    [{ ...validPayload, topic: "not-a-topic" }, "choose"],
    [{ ...validPayload, name: "A" }, "name"],
    [{ ...validPayload, email: "not-an-email" }, "email"],
    [{ ...validPayload, message: "Too short" }, "message"],
    [{ ...validPayload, submissionId: "not-a-uuid" }, "refresh"],
  ])("rejects invalid input", (payload, expectedText) => {
    const result = validateContactPayload(payload);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.toLowerCase()).toContain(expectedText);
  });

  it("detects the honeypot without including it in the message", () => {
    const result = validateContactPayload({ ...validPayload, website: "https://spam.test" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.honeypotFilled).toBe(true);
  });

  it("accepts the dedicated privacy request topic", () => {
    const result = validateContactPayload({ ...validPayload, topic: "privacy" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.topic).toBe("privacy");
  });
});
