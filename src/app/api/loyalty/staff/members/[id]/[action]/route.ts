import { isSameOrigin, isStaffAuthenticated } from "@/lib/loyalty/auth";
import {
  addLoyaltyBean,
  redeemLoyaltyReward,
  undoLastLoyaltyAction,
} from "@/lib/loyalty/db";
import { syncGoogleWalletObject } from "@/lib/loyalty/google-wallet";

const actions = {
  stamp: addLoyaltyBean,
  redeem: redeemLoyaltyReward,
  undo: undoLastLoyaltyAction,
} as const;

export async function POST(
  request: Request,
  context: RouteContext<"/api/loyalty/staff/members/[id]/[action]">,
) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }

  if (!(await isStaffAuthenticated())) {
    return Response.json({ error: "Staff sign-in required." }, { status: 401 });
  }

  const { id, action } = await context.params;
  const mutate = actions[action as keyof typeof actions];

  if (!mutate) {
    return Response.json({ error: "Unknown loyalty action." }, { status: 404 });
  }

  try {
    const member = await mutate(id);
    await syncGoogleWalletObject(member);
    return Response.json({ member });
  } catch (error) {
    console.error(`Unable to complete loyalty action: ${action}`, error);
    return Response.json(
      {
        error:
          action === "redeem"
            ? "There is no reward available to redeem."
            : action === "undo"
              ? "There is no recent action to undo."
              : "The bean could not be added.",
      },
      { status: 400 },
    );
  }
}
