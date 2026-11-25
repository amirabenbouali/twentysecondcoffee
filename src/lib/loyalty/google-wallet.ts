import "server-only";

import { createPrivateKey, createSign } from "node:crypto";
import type { LoyaltyMember, PublicLoyaltyMember, WalletSyncJob } from "./types";

const GOOGLE_WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_WALLET_API = "https://walletobjects.googleapis.com/walletobjects/v1";
const REQUEST_TIMEOUT_MS = 5_000;

type GoogleWalletConfiguration = {
  issuerId: string;
  classSuffix: string;
  serviceAccountEmail: string;
  privateKey: string;
};

export type WalletConfigurationStatus =
  | { state: "absent" }
  | { state: "invalid"; reason: string }
  | { state: "ready"; config: GoogleWalletConfiguration };

export type WalletSyncResult =
  | { status: "synced" | "not_saved" }
  | { status: "failed"; errorCode: string };

type AccessToken = { value: string; expiresAt: number };
let accessToken: AccessToken | null = null;

export function googleWalletConfigurationStatus(): WalletConfigurationStatus {
  const values = {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID?.trim() ?? "",
    classSuffix: process.env.GOOGLE_WALLET_CLASS_SUFFIX?.trim() ?? "",
    serviceAccountEmail: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL?.trim() ?? "",
    privateKey: process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, "\n").trim() ?? "",
  };
  const configuredValues = Object.values(values).filter(Boolean).length;
  if (configuredValues === 0) return { state: "absent" };
  if (configuredValues !== 4) return { state: "invalid", reason: "INCOMPLETE_CONFIGURATION" };
  if (!/^[0-9]+$/.test(values.issuerId)) {
    return { state: "invalid", reason: "INVALID_ISSUER_ID" };
  }
  if (!/^[A-Za-z0-9._-]+$/.test(values.classSuffix)) {
    return { state: "invalid", reason: "INVALID_CLASS_SUFFIX" };
  }
  if (!/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(values.serviceAccountEmail)) {
    return { state: "invalid", reason: "INVALID_SERVICE_ACCOUNT_EMAIL" };
  }
  try {
    createPrivateKey(values.privateKey);
  } catch {
    return { state: "invalid", reason: "INVALID_PRIVATE_KEY" };
  }
  return { state: "ready", config: values };
}

export function isGoogleWalletConfigured() {
  return googleWalletConfigurationStatus().state === "ready";
}

function configuration() {
  const status = googleWalletConfigurationStatus();
  return status.state === "ready" ? status.config : null;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, config: GoogleWalletConfiguration) {
  const header = encode({ alg: "RS256", typ: "JWT" });
  const body = encode(payload);
  const unsignedToken = `${header}.${body}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .end()
    .sign(config.privateKey, "base64url");
  return `${unsignedToken}.${signature}`;
}

function objectId(memberCode: string, config: GoogleWalletConfiguration) {
  return `${config.issuerId}.${memberCode}`;
}

function walletObject(
  member: Pick<
    PublicLoyaltyMember,
    "public_code" | "member_code" | "first_name" | "beans" | "rewards_available"
  >,
  config: GoogleWalletConfiguration,
) {
  return {
    id: objectId(member.member_code, config),
    classId: `${config.issuerId}.${config.classSuffix}`,
    state: "ACTIVE",
    accountName: member.first_name,
    accountId: member.member_code,
    loyaltyPoints: { label: "Beans", balance: { int: member.beans } },
    secondaryLoyaltyPoints: {
      label: "Rewards",
      balance: { int: member.rewards_available },
    },
    barcode: {
      type: "QR_CODE",
      value: `TSC:${member.public_code}`,
      alternateText: member.member_code,
    },
  };
}

export function createGoogleWalletSaveUrl(
  member: PublicLoyaltyMember,
  cardUrl: string,
) {
  const config = configuration();
  if (!config) return null;
  const now = Math.floor(Date.now() / 1000);
  const token = signJwt(
    {
      iss: config.serviceAccountEmail,
      aud: "google",
      origins: [new URL(cardUrl).origin],
      typ: "savetowallet",
      iat: now,
      payload: { loyaltyObjects: [walletObject(member, config)] },
    },
    config,
  );
  return `https://pay.google.com/gp/v/save/${token}`;
}

async function getAccessToken(config: GoogleWalletConfiguration) {
  const now = Math.floor(Date.now() / 1000);
  if (accessToken && accessToken.expiresAt > now + 60) return accessToken.value;
  const assertion = signJwt(
    {
      iss: config.serviceAccountEmail,
      scope: GOOGLE_WALLET_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    },
    config,
  );
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth2:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`AUTH_${response.status}`);
  const result = (await response.json()) as { access_token?: unknown; expires_in?: unknown };
  if (typeof result.access_token !== "string" || typeof result.expires_in !== "number") {
    throw new Error("AUTH_INVALID_RESPONSE");
  }
  accessToken = { value: result.access_token, expiresAt: now + result.expires_in };
  return result.access_token;
}

export async function syncGoogleWalletObject(
  member: LoyaltyMember | WalletSyncJob,
): Promise<WalletSyncResult> {
  const status = googleWalletConfigurationStatus();
  if (status.state === "absent") return { status: "failed", errorCode: "NOT_CONFIGURED" };
  if (status.state === "invalid") return { status: "failed", errorCode: status.reason };

  try {
    const token = await getAccessToken(status.config);
    const id = objectId(member.member_code, status.config);
    const object = walletObject(member, status.config);
    const response = await fetch(
      `${GOOGLE_WALLET_API}/loyaltyObject/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountName: object.accountName,
          accountId: object.accountId,
          loyaltyPoints: object.loyaltyPoints,
          secondaryLoyaltyPoints: object.secondaryLoyaltyPoints,
          barcode: object.barcode,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
    if (response.status === 404) return { status: "not_saved" };
    if (!response.ok) return { status: "failed", errorCode: `API_${response.status}` };
    return { status: "synced" };
  } catch (error) {
    const code = error instanceof Error && error.name === "TimeoutError"
      ? "TIMEOUT"
      : error instanceof Error && /^AUTH_[A-Z0-9_]+$/.test(error.message)
        ? error.message
        : "NETWORK_ERROR";
    console.error("[wallet] loyalty_pass_sync_failed", { code });
    return { status: "failed", errorCode: code };
  }
}

export function resetGoogleWalletTokenCacheForTests() {
  accessToken = null;
}
