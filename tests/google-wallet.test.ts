import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createGoogleWalletSaveUrl,
  googleWalletConfigurationStatus,
  resetGoogleWalletTokenCacheForTests,
  syncGoogleWalletObject,
} from "@/lib/loyalty/google-wallet";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

const member = {
  id: "7d5dfd0d-407f-4ba1-a4b3-0b3b11c20648",
  public_code: "opaque_public_code_123456789",
  member_code: "A1B2C3D4",
  first_name: "Amira",
  email: "amira@example.com",
  beans: 4,
  rewards_available: 1,
  marketing_consent: false,
  created_at: "2026-11-24T10:00:00.000Z",
  updated_at: "2026-11-24T10:01:00.000Z",
};

function configureWallet() {
  vi.stubEnv("GOOGLE_WALLET_ISSUER_ID", "1234567890");
  vi.stubEnv("GOOGLE_WALLET_CLASS_SUFFIX", "twenty_second_rewards");
  vi.stubEnv(
    "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
    "wallet@staging-project.iam.gserviceaccount.com",
  );
  vi.stubEnv("GOOGLE_WALLET_PRIVATE_KEY", privateKeyPem);
}

beforeEach(() => resetGoogleWalletTokenCacheForTests());
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Google Wallet", () => {
  it("rejects partial and malformed configuration", () => {
    vi.stubEnv("GOOGLE_WALLET_ISSUER_ID", "123");
    expect(googleWalletConfigurationStatus()).toEqual({
      state: "invalid",
      reason: "INCOMPLETE_CONFIGURATION",
    });

    configureWallet();
    vi.stubEnv("GOOGLE_WALLET_PRIVATE_KEY", "not-a-key");
    expect(googleWalletConfigurationStatus()).toEqual({
      state: "invalid",
      reason: "INVALID_PRIVATE_KEY",
    });
  });

  it("creates a signed save URL with an opaque scan payload", () => {
    configureWallet();
    const url = createGoogleWalletSaveUrl(
      member,
      "https://staging.example.com/loyalty/opaque_public_code_123456789",
    );
    expect(url).toMatch(/^https:\/\/pay\.google\.com\/gp\/v\/save\//);
    const token = url?.split("/").at(-1) ?? "";
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    expect(payload.origins).toEqual(["https://staging.example.com"]);
    expect(payload.payload.loyaltyObjects[0].barcode).toEqual({
      type: "QR_CODE",
      value: `TSC:${member.public_code}`,
      alternateText: member.member_code,
    });
  });

  it("updates a saved pass and distinguishes a pass that has not been saved", async () => {
    configureWallet();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "token", expires_in: 3600 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(syncGoogleWalletObject(member)).resolves.toEqual({ status: "synced" });

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(syncGoogleWalletObject(member)).resolves.toEqual({ status: "not_saved" });
  });

  it("returns a retryable code when Google times out", async () => {
    configureWallet();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")),
    );
    await expect(syncGoogleWalletObject(member)).resolves.toEqual({
      status: "failed",
      errorCode: "TIMEOUT",
    });
  });
});
