import "server-only";

import { createSign } from "node:crypto";
import type { LoyaltyMember, PublicLoyaltyMember } from "./types";

const GOOGLE_WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_WALLET_API = "https://walletobjects.googleapis.com/walletobjects/v1";

type GoogleWalletConfiguration = {
  issuerId: string;
  classSuffix: string;
  serviceAccountEmail: string;
  privateKey: string;
};

type AccessToken = { value: string; expiresAt: number };
let accessToken: AccessToken | null = null;

function configuration(): GoogleWalletConfiguration | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID?.trim();
  const classSuffix = process.env.GOOGLE_WALLET_CLASS_SUFFIX?.trim();
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!issuerId || !classSuffix || !serviceAccountEmail || !privateKey) return null;
  if (!/^[0-9]+$/.test(issuerId) || !/^[A-Za-z0-9._-]+$/.test(classSuffix)) return null;

  return { issuerId, classSuffix, serviceAccountEmail, privateKey };
}

export function isGoogleWalletConfigured() {
  return configuration() !== null;
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
    "member_code" | "first_name" | "beans" | "rewards_available"
  >,
  config: GoogleWalletConfiguration,
) {
  return {
    id: objectId(member.member_code, config),
    classId: `${config.issuerId}.${config.classSuffix}`,
    state: "ACTIVE",
    accountName: member.first_name,
    accountId: member.member_code,
    loyaltyPoints: {
      label: "Beans",
      balance: { int: member.beans },
    },
    secondaryLoyaltyPoints: {
      label: "Rewards",
      balance: { int: member.rewards_available },
    },
    barcode: {
      type: "QR_CODE",
      value: member.member_code,
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
      origins: [new URL(cardUrl).host],
      typ: "savetowallet",
      iat: now,
      payload: {
        loyaltyObjects: [walletObject(member, config)],
      },
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
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Google Wallet authentication failed.");
  const result = (await response.json()) as { access_token: string; expires_in: number };
  accessToken = {
    value: result.access_token,
    expiresAt: now + result.expires_in,
  };
  return result.access_token;
}

export async function syncGoogleWalletObject(member: LoyaltyMember) {
  const config = configuration();
  if (!config) return;

  try {
    const token = await getAccessToken(config);
    const id = objectId(member.member_code, config);
    const object = walletObject(member, config);
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
      },
    );

    // A 404 simply means this customer has not saved their pass yet.
    if (!response.ok && response.status !== 404) {
      throw new Error(`Google Wallet update failed with ${response.status}.`);
    }
  } catch (error) {
    // Loyalty actions must remain usable if Google is temporarily unavailable.
    console.error("Unable to update Google Wallet pass", error);
  }
}
