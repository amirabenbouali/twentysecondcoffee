import "server-only";

import { randomBytes } from "node:crypto";
import type {
  LoyaltyActivity,
  LoyaltyMember,
  LoyaltyMemberPage,
  LoyaltyStaff,
  LoyaltyStaffSession,
  LoyaltyStaffWithPassword,
  PublicLoyaltyMember,
  StaffLoyaltyMember,
  WalletSyncJob,
} from "./types";
import {
  LOYALTY_SIGNUP_SOURCE,
  MARKETING_CONSENT_VERSION,
  PRIVACY_NOTICE_VERSION,
} from "@/lib/privacy/constants";

type SupabaseError = {
  code?: string;
  message?: string;
  details?: string;
};

export class LoyaltyDatabaseError extends Error {
  status: number;
  code?: string;
  reason?: string;

  constructor(message: string, status = 500, code?: string, reason?: string) {
    super(message);
    this.name = "LoyaltyDatabaseError";
    this.status = status;
    this.code = code;
    this.reason = reason;
  }
}

function configuration() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new LoyaltyDatabaseError(
      "Loyalty is not connected to its database yet.",
      503,
      "NOT_CONFIGURED",
    );
  }

  return { url, serviceKey };
}

export function isLoyaltyDatabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, serviceKey } = configuration();
  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(8_000),
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new LoyaltyDatabaseError(
      timedOut ? "The loyalty database timed out." : "The loyalty database is unavailable.",
      timedOut ? 504 : 503,
      timedOut ? "DATABASE_TIMEOUT" : "DATABASE_UNAVAILABLE",
    );
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as SupabaseError;
    const knownReason = [
      "STAFF_FORBIDDEN",
      "MEMBER_NOT_FOUND",
      "NO_REWARD_AVAILABLE",
      "NO_ACTION_TO_UNDO",
      "IDEMPOTENCY_CONFLICT",
    ].includes(error.message ?? "")
      ? error.message
      : undefined;
    throw new LoyaltyDatabaseError(
      error.message || "The loyalty database request failed.",
      response.status,
      error.code,
      knownReason,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function tablePath(table: string, params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return `${table}?${query.toString()}`;
}

function createMemberCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function staffMemberView(member: LoyaltyMember): StaffLoyaltyMember {
  return {
    id: member.id,
    member_code: member.member_code,
    first_name: member.first_name,
    email: member.email,
    beans: member.beans,
    rewards_available: member.rewards_available,
    created_at: member.created_at,
    updated_at: member.updated_at,
  };
}

export async function createLoyaltyMember(input: {
  firstName: string;
  email: string;
  marketingConsent: boolean;
}) {
  const rows = await supabaseFetch<LoyaltyMember[]>("rpc/register_loyalty_member", {
    method: "POST",
    body: JSON.stringify({
      p_first_name: input.firstName,
      p_email: input.email,
      p_marketing_consent: input.marketingConsent,
      p_member_code: createMemberCode(),
      p_public_code: randomBytes(24).toString("base64url"),
      p_privacy_notice_version: PRIVACY_NOTICE_VERSION,
      p_marketing_consent_version: MARKETING_CONSENT_VERSION,
      p_source: LOYALTY_SIGNUP_SOURCE,
    }),
  });

  return rows[0];
}

export async function getStaffByUsername(username: string) {
  const rows = await supabaseFetch<LoyaltyStaffWithPassword[]>(
    tablePath("loyalty_staff", {
      username: `eq.${username.toLowerCase()}`,
      select:
        "id,username,display_name,role,password_hash,active,created_at,updated_at,last_login_at",
      limit: "1",
    }),
  );
  return rows[0] ?? null;
}

export async function getStaffById(staffId: string) {
  const rows = await supabaseFetch<LoyaltyStaff[]>(
    tablePath("loyalty_staff", {
      id: `eq.${staffId}`,
      select: "id,username,display_name,role,active,created_at,updated_at,last_login_at",
      limit: "1",
    }),
  );
  return rows[0] ?? null;
}

export async function recordStaffLogin(staffId: string) {
  await supabaseFetch<undefined>(tablePath("loyalty_staff", { id: `eq.${staffId}` }), {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ last_login_at: new Date().toISOString() }),
  });
}

export async function createStaffSessionRecord(input: {
  staffId: string;
  tokenHash: string;
  expiresAt: string;
}) {
  const rows = await supabaseFetch<LoyaltyStaffSession[]>("loyalty_staff_sessions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      staff_id: input.staffId,
      token_hash: input.tokenHash,
      expires_at: input.expiresAt,
    }),
  });
  return rows[0];
}

export async function getStaffSessionRecord(tokenHash: string) {
  const rows = await supabaseFetch<LoyaltyStaffSession[]>(
    tablePath("loyalty_staff_sessions", {
      token_hash: `eq.${tokenHash}`,
      revoked_at: "is.null",
      expires_at: `gt.${new Date().toISOString()}`,
      select: "id,staff_id,token_hash,created_at,expires_at,last_seen_at,revoked_at",
      limit: "1",
    }),
  );
  return rows[0] ?? null;
}

export async function revokeStaffSession(tokenHash: string) {
  await supabaseFetch<undefined>(
    tablePath("loyalty_staff_sessions", { token_hash: `eq.${tokenHash}` }),
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ revoked_at: new Date().toISOString() }),
    },
  );
}

export async function getPublicLoyaltyMember(publicCode: string) {
  const rows = await supabaseFetch<PublicLoyaltyMember[]>(
    tablePath("loyalty_members", {
      public_code: `eq.${publicCode}`,
      select:
        "public_code,member_code,first_name,beans,rewards_available,created_at",
      limit: "1",
    }),
  );

  return rows[0] ?? null;
}

function encodeCursor(member: StaffLoyaltyMember) {
  return Buffer.from(JSON.stringify([member.updated_at, member.id])).toString("base64url");
}

function decodeCursor(cursor: string | null | undefined) {
  if (!cursor) return null;
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "string" &&
      typeof value[1] === "string"
    ) {
      return { updatedAt: value[0], id: value[1] };
    }
  } catch {}
  throw new LoyaltyDatabaseError("The pagination cursor is invalid.", 400, "INVALID_CURSOR");
}

export async function searchLoyaltyMembers(
  staffId: string,
  options: { query?: string; cursor?: string | null; limit?: number } = {},
): Promise<LoyaltyMemberPage> {
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 50);
  const cursor = decodeCursor(options.cursor);
  const rows = await supabaseFetch<LoyaltyMember[]>("rpc/search_loyalty_members", {
    method: "POST",
    body: JSON.stringify({
      p_staff_id: staffId,
      p_query: options.query?.trim() || null,
      p_limit: limit + 1,
      p_cursor_updated_at: cursor?.updatedAt ?? null,
      p_cursor_id: cursor?.id ?? null,
    }),
  });
  const hasMore = rows.length > limit;
  const members = rows.slice(0, limit).map(staffMemberView);
  return {
    members,
    nextCursor: hasMore && members.length ? encodeCursor(members[members.length - 1]) : null,
  };
}

export async function lookupLoyaltyMember(staffId: string, code: string) {
  const rows = await supabaseFetch<LoyaltyMember[]>("rpc/lookup_loyalty_member", {
    method: "POST",
    body: JSON.stringify({ p_staff_id: staffId, p_code: code }),
  });
  return rows[0] ? staffMemberView(rows[0]) : null;
}

export async function listLoyaltyActivity(staffId: string, memberId: string) {
  return supabaseFetch<LoyaltyActivity[]>("rpc/list_loyalty_activity", {
    method: "POST",
    body: JSON.stringify({ p_staff_id: staffId, p_member_id: memberId, p_limit: 30 }),
  });
}

async function loyaltyRpc(
  functionName: string,
  input: { memberId: string; staffId: string; idempotencyKey: string; source: string },
) {
  return supabaseFetch<LoyaltyMember[]>(`rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify({
      p_member_id: input.memberId,
      p_staff_id: input.staffId,
      p_idempotency_key: input.idempotencyKey,
      p_request_source: input.source,
    }),
  }).then((rows) => rows[0]);
}

export function addLoyaltyBean(input: Parameters<typeof loyaltyRpc>[1]) {
  return loyaltyRpc("add_loyalty_bean", input);
}

export function redeemLoyaltyReward(input: Parameters<typeof loyaltyRpc>[1]) {
  return loyaltyRpc("redeem_loyalty_reward", input);
}

export function undoLastLoyaltyAction(input: Parameters<typeof loyaltyRpc>[1]) {
  return loyaltyRpc("undo_last_loyalty_action", input);
}

export async function claimWalletSyncJobs(limit = 20) {
  return supabaseFetch<WalletSyncJob[]>("rpc/claim_loyalty_wallet_sync_jobs", {
    method: "POST",
    body: JSON.stringify({ p_limit: limit }),
  });
}

export async function completeWalletSync(memberId: string) {
  await supabaseFetch<undefined>("rpc/complete_loyalty_wallet_sync", {
    method: "POST",
    body: JSON.stringify({ p_member_id: memberId }),
  });
}

export async function retryWalletSync(memberId: string, errorCode: string) {
  await supabaseFetch<undefined>("rpc/retry_loyalty_wallet_sync", {
    method: "POST",
    body: JSON.stringify({ p_member_id: memberId, p_error_code: errorCode }),
  });
}
