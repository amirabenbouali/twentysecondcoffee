import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  createRecord: vi.fn(),
  getSession: vi.fn(),
  getStaff: vi.fn(),
  revoke: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/loyalty/db", () => ({
  createStaffSessionRecord: mocks.createRecord,
  getStaffById: mocks.getStaff,
  getStaffSessionRecord: mocks.getSession,
  isLoyaltyDatabaseConfigured: () => true,
  revokeStaffSession: mocks.revoke,
}));

import {
  clearStaffSession,
  createStaffSession,
  getStaffSession,
} from "@/lib/loyalty/auth";

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cookies.mockResolvedValue(cookieStore);
  mocks.createRecord.mockResolvedValue({ id: "session-id" });
});

describe("individual staff sessions", () => {
  it("stores only a hash in the database and a secure random token in the cookie", async () => {
    await createStaffSession("staff-id");

    const token = cookieStore.set.mock.calls[0][1] as string;
    const record = mocks.createRecord.mock.calls[0][0] as {
      staffId: string;
      tokenHash: string;
      expiresAt: string;
    };
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(record.staffId).toBe("staff-id");
    expect(record.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(record.tokenHash).not.toBe(token);
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      priority: "high",
    });
  });

  it("resolves only an active staff account from a live database session", async () => {
    cookieStore.get.mockReturnValue({ value: "x".repeat(43) });
    mocks.getSession.mockResolvedValue({ staff_id: "staff-id" });
    mocks.getStaff.mockResolvedValue({ id: "staff-id", active: true, role: "barista" });
    await expect(getStaffSession()).resolves.toMatchObject({ id: "staff-id" });

    mocks.getStaff.mockResolvedValue({ id: "staff-id", active: false, role: "barista" });
    await expect(getStaffSession()).resolves.toBeNull();
  });

  it("revokes the server session and clears the cookie on logout", async () => {
    cookieStore.get.mockReturnValue({ value: "x".repeat(43) });
    await clearStaffSession();
    expect(mocks.revoke).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/));
    expect(cookieStore.delete).toHaveBeenCalledWith("twenty_second_loyalty_staff");
  });
});
