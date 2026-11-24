import { getStaffSession, isSameOrigin, staffCan } from "@/lib/loyalty/auth";
import {
  addLoyaltyBean,
  completeWalletSync,
  LoyaltyDatabaseError,
  redeemLoyaltyReward,
  retryWalletSync,
  staffMemberView,
  undoLastLoyaltyAction,
} from "@/lib/loyalty/db";
import { syncGoogleWalletObject } from "@/lib/loyalty/google-wallet";
import { checkLoyaltyRateLimit } from "@/lib/loyalty/rate-limit";

const actions = {
  stamp: addLoyaltyBean,
  redeem: redeemLoyaltyReward,
  undo: undoLastLoyaltyAction,
} as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  context: RouteContext<"/api/loyalty/staff/members/[id]/[action]">,
) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }

  let staff;
  try {
    staff = await getStaffSession();
  } catch {
    return Response.json({ error: "Staff access is temporarily unavailable." }, { status: 503 });
  }
  if (!staff) {
    return Response.json({ error: "Staff sign-in required." }, { status: 401 });
  }

  const { id, action } = await context.params;
  const mutate = actions[action as keyof typeof actions];

  if (!mutate) {
    return Response.json({ error: "Unknown loyalty action." }, { status: 404 });
  }
  if (!staffCan(staff, action)) {
    return Response.json({ error: "Your staff account cannot perform that action." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    idempotencyKey?: unknown;
    source?: unknown;
  } | null;
  const idempotencyKey =
    typeof body?.idempotencyKey === "string" ? body.idempotencyKey : "";
  const source = body?.source === "scanner" ? "scanner" : "staff_desk";
  if (!UUID_PATTERN.test(idempotencyKey)) {
    return Response.json({ error: "The action request is invalid. Please try again." }, { status: 400 });
  }

  try {
    const limit = await checkLoyaltyRateLimit(request, "action", staff.id);
    if (!limit.success) {
      return Response.json({ error: "Too many actions. Please wait a moment." }, { status: 429 });
    }
    const member = await mutate({
      memberId: id,
      staffId: staff.id,
      idempotencyKey,
      source,
    });
    const wallet = await syncGoogleWalletObject(member);
    try {
      if (wallet.status === "failed") {
        await retryWalletSync(member.id, wallet.errorCode);
      } else {
        await completeWalletSync(member.id);
      }
    } catch {
      console.error("[wallet] sync_queue_update_failed");
    }
    return Response.json({ member: staffMemberView(member) });
  } catch (error) {
    console.error("[loyalty] staff_action_failed", {
      action,
      code: error instanceof LoyaltyDatabaseError ? error.code : undefined,
      status: error instanceof LoyaltyDatabaseError ? error.status : undefined,
    });
    const reason = error instanceof LoyaltyDatabaseError ? error.reason : undefined;
    const status =
      reason === "STAFF_FORBIDDEN"
        ? 403
        : reason === "MEMBER_NOT_FOUND"
          ? 404
          : error instanceof LoyaltyDatabaseError && error.status >= 500
            ? error.status
            : 409;
    return Response.json(
      {
        error:
          reason === "STAFF_FORBIDDEN"
            ? "Your staff account cannot perform that action."
            : reason === "MEMBER_NOT_FOUND"
              ? "That customer card no longer exists."
              : action === "redeem"
            ? "There is no reward available to redeem."
            : action === "undo"
              ? "There is no recent action to undo."
              : status >= 500
                ? "The loyalty service is temporarily unavailable."
                : "The bean could not be added.",
      },
      { status },
    );
  }
}
