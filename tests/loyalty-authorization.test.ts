import { describe, expect, it } from "vitest";
import { staffCan } from "@/lib/loyalty/auth";

describe("loyalty staff permissions", () => {
  it("allows baristas to read, stamp, and redeem", () => {
    const barista = { role: "barista" as const };
    expect(staffCan(barista, "member:read")).toBe(true);
    expect(staffCan(barista, "stamp")).toBe(true);
    expect(staffCan(barista, "redeem")).toBe(true);
  });

  it("does not allow baristas to undo or inspect audit history", () => {
    const barista = { role: "barista" as const };
    expect(staffCan(barista, "undo")).toBe(false);
    expect(staffCan(barista, "audit:read")).toBe(false);
  });

  it("allows managers to perform every staff operation", () => {
    const manager = { role: "manager" as const };
    expect(staffCan(manager, "member:read")).toBe(true);
    expect(staffCan(manager, "stamp")).toBe(true);
    expect(staffCan(manager, "redeem")).toBe(true);
    expect(staffCan(manager, "undo")).toBe(true);
    expect(staffCan(manager, "audit:read")).toBe(true);
  });
});
