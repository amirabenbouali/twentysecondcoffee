import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  createStaffSessionRecord,
  getStaffById,
  getStaffSessionRecord,
  isLoyaltyDatabaseConfigured,
  revokeStaffSession,
} from "@/lib/loyalty/db";
import type { LoyaltyStaff } from "@/lib/loyalty/types";

const COOKIE_NAME = "twenty_second_loyalty_staff";
const SESSION_LENGTH_SECONDS = 60 * 60 * 10;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isStaffAuthConfigured() {
  return isLoyaltyDatabaseConfigured();
}

export async function createStaffSession(staffId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LENGTH_SECONDS * 1000);
  await createStaffSessionRecord({
    staffId,
    tokenHash: tokenHash(token),
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_LENGTH_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function clearStaffSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  try {
    if (token) await revokeStaffSession(tokenHash(token));
  } finally {
    cookieStore.delete(COOKIE_NAME);
  }
}

export async function getStaffSession(): Promise<LoyaltyStaff | null> {
  if (!isStaffAuthConfigured()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || token.length < 32 || token.length > 100) return null;

  const session = await getStaffSessionRecord(tokenHash(token));
  if (!session) return null;
  const staff = await getStaffById(session.staff_id);
  return staff?.active ? staff : null;
}

export async function isStaffAuthenticated() {
  return (await getStaffSession()) !== null;
}

export function staffCan(staff: Pick<LoyaltyStaff, "role">, permission: string) {
  if (staff.role === "manager") return true;
  return ["member:read", "stamp", "redeem"].includes(permission);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  return Boolean(host && origin === `${protocol}://${host}`);
}
