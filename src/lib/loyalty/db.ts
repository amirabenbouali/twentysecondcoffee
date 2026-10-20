import "server-only";

import { randomBytes } from "node:crypto";
import type { LoyaltyMember, PublicLoyaltyMember } from "./types";

type SupabaseError = {
  code?: string;
  message?: string;
  details?: string;
};

export class LoyaltyDatabaseError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "LoyaltyDatabaseError";
    this.status = status;
    this.code = code;
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
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as SupabaseError;
    throw new LoyaltyDatabaseError(
      error.message || "The loyalty database request failed.",
      response.status,
      error.code,
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

export async function createLoyaltyMember(input: {
  firstName: string;
  email: string;
  marketingConsent: boolean;
}) {
  const rows = await supabaseFetch<LoyaltyMember[]>("loyalty_members", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      first_name: input.firstName,
      email: input.email,
      marketing_consent: input.marketingConsent,
      member_code: createMemberCode(),
      public_code: randomBytes(24).toString("base64url"),
    }),
  });

  return rows[0];
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

export async function listLoyaltyMembers() {
  return supabaseFetch<LoyaltyMember[]>(
    tablePath("loyalty_members", {
      select:
        "id,public_code,member_code,first_name,email,beans,rewards_available,marketing_consent,created_at,updated_at",
      order: "updated_at.desc",
      limit: "250",
    }),
  );
}

async function loyaltyRpc(functionName: string, memberId: string) {
  return supabaseFetch<LoyaltyMember[]>(`rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify({ p_member_id: memberId }),
  }).then((rows) => rows[0]);
}

export function addLoyaltyBean(memberId: string) {
  return loyaltyRpc("add_loyalty_bean", memberId);
}

export function redeemLoyaltyReward(memberId: string) {
  return loyaltyRpc("redeem_loyalty_reward", memberId);
}

export function undoLastLoyaltyAction(memberId: string) {
  return loyaltyRpc("undo_last_loyalty_action", memberId);
}
