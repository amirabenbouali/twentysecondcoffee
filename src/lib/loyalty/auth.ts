import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "twenty_second_loyalty_staff";
const SESSION_LENGTH_SECONDS = 60 * 60 * 10;

function secret() {
  return process.env.LOYALTY_SESSION_SECRET ?? "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function isStaffAuthConfigured() {
  return Boolean(
    process.env.LOYALTY_STAFF_PASSWORD && process.env.LOYALTY_SESSION_SECRET,
  );
}

export function verifyStaffPassword(password: string) {
  const expected = process.env.LOYALTY_STAFF_PASSWORD;
  return Boolean(expected && safeEqual(password, expected));
}

export async function createStaffSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_LENGTH_SECONDS;
  const payload = String(expires);
  const value = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_LENGTH_SECONDS,
    path: "/",
  });
}

export async function clearStaffSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isStaffAuthenticated() {
  if (!isStaffAuthConfigured()) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const [expires, signature] = value.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;

  return Number(expires) > Math.floor(Date.now() / 1000);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  return Boolean(host && origin === `${protocol}://${host}`);
}
