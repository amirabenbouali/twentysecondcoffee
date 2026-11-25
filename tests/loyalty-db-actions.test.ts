import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addLoyaltyBean,
  LoyaltyDatabaseError,
  searchLoyaltyMembers,
} from "@/lib/loyalty/db";

const member = {
  id: "7d5dfd0d-407f-4ba1-a4b3-0b3b11c20648",
  public_code: "private-code",
  member_code: "A1B2C3D4",
  first_name: "Amira",
  email: "amira@example.com",
  beans: 1,
  rewards_available: 0,
  marketing_consent: false,
  created_at: "2026-11-24T10:00:00.000Z",
  updated_at: "2026-11-24T10:01:00.000Z",
};

function configure() {
  vi.stubEnv("SUPABASE_URL", "https://staging-project.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "staging-service-role-key");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("loyalty database operations", () => {
  it("passes staff attribution and the idempotency key to atomic stamp RPC", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([member]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await addLoyaltyBean({
      memberId: member.id,
      staffId: "6e3ce268-ec92-49d6-a7b5-531ea8813745",
      idempotencyKey: "5a92651a-412c-44ec-94f4-87fe7406cc44",
      source: "scanner",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url.endsWith("/rest/v1/rpc/add_loyalty_bean")).toBe(true);
    expect(JSON.parse(String(init.body))).toEqual({
      p_member_id: member.id,
      p_staff_id: "6e3ce268-ec92-49d6-a7b5-531ea8813745",
      p_idempotency_key: "5a92651a-412c-44ec-94f4-87fe7406cc44",
      p_request_source: "scanner",
    });
  });

  it("performs authenticated server-side search with bounded pagination", async () => {
    configure();
    const rows = Array.from({ length: 26 }, (_, index) => ({
      ...member,
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      updated_at: new Date(Date.UTC(2026, 10, 24, 10, 1, index)).toISOString(),
    }));
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const page = await searchLoyaltyMembers(
      "6e3ce268-ec92-49d6-a7b5-531ea8813745",
      { query: "Amira", limit: 25 },
    );

    expect(page.members).toHaveLength(25);
    expect(page.nextCursor).toEqual(expect.any(String));
    const body = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body));
    expect(body).toMatchObject({
      p_staff_id: "6e3ce268-ec92-49d6-a7b5-531ea8813745",
      p_query: "Amira",
      p_limit: 26,
    });
  });

  it("maps network and timeout failures to safe database errors", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    await expect(searchLoyaltyMembers("staff-id")).rejects.toMatchObject({
      code: "DATABASE_UNAVAILABLE",
      status: 503,
    } satisfies Partial<LoyaltyDatabaseError>);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")));
    await expect(searchLoyaltyMembers("staff-id")).rejects.toMatchObject({
      code: "DATABASE_TIMEOUT",
      status: 504,
    } satisfies Partial<LoyaltyDatabaseError>);
  });
});
