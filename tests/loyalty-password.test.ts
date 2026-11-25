import { describe, expect, it } from "vitest";
import { hashStaffPassword, verifyStaffPassword } from "@/lib/loyalty/password";

describe("staff password hashing", () => {
  it("creates a salted scrypt hash and verifies only the correct password", () => {
    const hash = hashStaffPassword("a-long-staging-password");
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(hash).not.toContain("a-long-staging-password");
    expect(verifyStaffPassword("a-long-staging-password", hash)).toBe(true);
    expect(verifyStaffPassword("the-wrong-password", hash)).toBe(false);
  });

  it("uses a different salt for each staff account", () => {
    expect(hashStaffPassword("a-long-staging-password")).not.toBe(
      hashStaffPassword("a-long-staging-password"),
    );
  });

  it("rejects weak and malformed values", () => {
    expect(() => hashStaffPassword("too-short")).toThrow();
    expect(verifyStaffPassword("password", "not-a-hash")).toBe(false);
  });
});
