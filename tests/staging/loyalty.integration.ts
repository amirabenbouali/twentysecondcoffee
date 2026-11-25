import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hashStaffPassword } from "@/lib/loyalty/password";
import stagingProjects from "../../config/loyalty-staging-projects.json";
import { validateStagingTarget } from "../../scripts/staging-target-safety.mjs";

const key = process.env.LOYALTY_STAGING_SUPABASE_SERVICE_ROLE_KEY ?? "";
const target = validateStagingTarget({
  productionProjectRef: process.env.LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF,
  stagingProjectRef: process.env.LOYALTY_STAGING_SUPABASE_PROJECT_REF,
  stagingUrl: process.env.LOYALTY_STAGING_SUPABASE_URL,
  permittedProjectRefs: stagingProjects.permittedProjectRefs,
  requireServiceRoleKey: true,
  hasServiceRoleKey: Boolean(key),
  requiredApproval: "STAGING_ONLY",
  approval: process.env.ALLOW_STAGING_LOYALTY_MUTATIONS,
});
const url = target.url;

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}

const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
const managerId = randomUUID();
const baristaId = randomUUID();
let memberId = "";

async function action(
  name: "add_loyalty_bean" | "redeem_loyalty_reward" | "undo_last_loyalty_action",
  staffId: string,
  idempotencyKey = randomUUID(),
) {
  return request(`rpc/${name}`, {
    method: "POST",
    body: JSON.stringify({
      p_member_id: memberId,
      p_staff_id: staffId,
      p_idempotency_key: idempotencyKey,
      p_request_source: "staging_integration_test",
    }),
  });
}

describe.sequential("loyalty staging integration", () => {
  beforeAll(async () => {
    const passwordHash = hashStaffPassword(`staging-only-password-${suffix}`);
    const staff = await request("loyalty_staff", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          id: managerId,
          username: `manager.${suffix}`,
          display_name: "Synthetic Test Manager",
          role: "manager",
          password_hash: passwordHash,
        },
        {
          id: baristaId,
          username: `barista.${suffix}`,
          display_name: "Synthetic Test Barista",
          role: "barista",
          password_hash: passwordHash,
        },
      ]),
    });
    expect(staff.response.ok).toBe(true);
  });

  afterAll(async () => {
    if (memberId) await request(`loyalty_members?id=eq.${memberId}`, { method: "DELETE" });
    await request(`loyalty_staff?id=in.(${managerId},${baristaId})`, { method: "DELETE" });
  });

  it("rejects a case-insensitive duplicate registration", async () => {
    const email = `synthetic-${suffix}@example.invalid`;
    const registration = {
      p_first_name: "Synthetic",
      p_email: email.toUpperCase(),
      p_marketing_consent: false,
      p_member_code: suffix.slice(0, 8).toUpperCase(),
      p_public_code: `staging_${suffix}_${randomUUID().replaceAll("-", "")}`,
      p_privacy_notice_version: "staging-test",
      p_marketing_consent_version: "staging-test",
      p_source: "staging_integration_test",
    };
    const first = await request("rpc/register_loyalty_member", {
      method: "POST",
      body: JSON.stringify(registration),
    });
    expect(first.response.ok).toBe(true);
    memberId = first.body[0].id;

    const duplicate = await request("rpc/register_loyalty_member", {
      method: "POST",
      body: JSON.stringify({
        ...registration,
        p_email: email,
        p_member_code: randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase(),
        p_public_code: `staging_${randomUUID().replaceAll("-", "")}`,
      }),
    });
    expect(duplicate.response.ok).toBe(false);
    expect(duplicate.body.code).toBe("23505");
  });

  it("makes a retried stamp idempotent and serializes concurrent stamps", async () => {
    const retryKey = randomUUID();
    const retried = await Promise.all([
      action("add_loyalty_bean", baristaId, retryKey),
      action("add_loyalty_bean", baristaId, retryKey),
    ]);
    expect(retried.every(({ response }) => response.ok)).toBe(true);
    expect(retried[1].body[0].beans).toBe(1);

    const distinct = await Promise.all([
      action("add_loyalty_bean", baristaId),
      action("add_loyalty_bean", baristaId),
    ]);
    expect(distinct.every(({ response }) => response.ok)).toBe(true);
    const lookup = await request("rpc/lookup_loyalty_member", {
      method: "POST",
      body: JSON.stringify({ p_staff_id: baristaId, p_code: distinct[0].body[0].member_code }),
    });
    expect(lookup.body[0].beans).toBe(3);
  });

  it("never spends the same reward twice under concurrent redemption", async () => {
    for (let index = 0; index < 6; index += 1) {
      const stamp = await action("add_loyalty_bean", baristaId);
      expect(stamp.response.ok).toBe(true);
    }
    const redemptions = await Promise.all([
      action("redeem_loyalty_reward", baristaId),
      action("redeem_loyalty_reward", baristaId),
    ]);
    expect(redemptions.filter(({ response }) => response.ok)).toHaveLength(1);
    const member = await request(`loyalty_members?id=eq.${memberId}&select=beans,rewards_available`);
    expect(member.body[0]).toEqual({ beans: 0, rewards_available: 0 });
  });

  it("enforces manager-only undo and attributes the audit trail", async () => {
    const forbidden = await action("undo_last_loyalty_action", baristaId);
    expect(forbidden.response.ok).toBe(false);
    expect(forbidden.body.message).toBe("STAFF_FORBIDDEN");

    const undone = await action("undo_last_loyalty_action", managerId);
    expect(undone.response.ok).toBe(true);
    expect(undone.body[0].rewards_available).toBe(1);

    const audit = await request("rpc/list_loyalty_activity", {
      method: "POST",
      body: JSON.stringify({ p_staff_id: managerId, p_member_id: memberId, p_limit: 50 }),
    });
    expect(audit.response.ok).toBe(true);
    expect(audit.body[0]).toMatchObject({
      action: "undo",
      staff_display_name: "Synthetic Test Manager",
      request_source: "staging_integration_test",
    });
  });
});
