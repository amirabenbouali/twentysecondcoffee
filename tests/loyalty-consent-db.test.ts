import { afterEach, describe, expect, it, vi } from "vitest";
import { createLoyaltyMember } from "@/lib/loyalty/db";
import {
  LOYALTY_SIGNUP_SOURCE,
  MARKETING_CONSENT_VERSION,
  PRIVACY_NOTICE_VERSION,
} from "@/lib/privacy/constants";

const member = {
  id: "7d5dfd0d-407f-4ba1-a4b3-0b3b11c20648",
  public_code: "private-code",
  member_code: "A1B2C3D4",
  first_name: "Amira",
  email: "amira@example.com",
  beans: 0,
  rewards_available: 0,
  marketing_consent: false,
  created_at: "2026-11-24T10:00:00.000Z",
  updated_at: "2026-11-24T10:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("createLoyaltyMember consent metadata", () => {
  it.each([false, true])(
    "sends the privacy version, source, and explicit marketing choice (%s) to the registration RPC",
    async (marketingConsent) => {
      vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ ...member, marketing_consent: marketingConsent }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      await createLoyaltyMember({
        firstName: "Amira",
        email: "amira@example.com",
        marketingConsent,
      });

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;

      expect(url).toBe("https://project.supabase.co/rest/v1/rpc/register_loyalty_member");
      expect(init.method).toBe("POST");
      expect(body).toMatchObject({
        p_first_name: "Amira",
        p_email: "amira@example.com",
        p_marketing_consent: marketingConsent,
        p_privacy_notice_version: PRIVACY_NOTICE_VERSION,
        p_marketing_consent_version: MARKETING_CONSENT_VERSION,
        p_source: LOYALTY_SIGNUP_SOURCE,
      });
      expect(body.p_member_code).toEqual(expect.any(String));
      expect(body.p_public_code).toEqual(expect.any(String));
    },
  );
});
