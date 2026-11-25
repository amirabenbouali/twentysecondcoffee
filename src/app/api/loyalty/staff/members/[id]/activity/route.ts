import { getStaffSession, staffCan } from "@/lib/loyalty/auth";
import { listLoyaltyActivity, LoyaltyDatabaseError } from "@/lib/loyalty/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let staff;
  try {
    staff = await getStaffSession();
  } catch {
    return Response.json({ error: "Staff access is temporarily unavailable." }, { status: 503 });
  }
  if (!staff) return Response.json({ error: "Staff sign-in required." }, { status: 401 });
  if (!staffCan(staff, "audit:read")) {
    return Response.json({ error: "Manager access is required." }, { status: 403 });
  }

  const { id } = await context.params;
  try {
    const activity = await listLoyaltyActivity(staff.id, id);
    return Response.json({ activity }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[loyalty] activity_list_failed", {
      code: error instanceof LoyaltyDatabaseError ? error.code : undefined,
      status: error instanceof LoyaltyDatabaseError ? error.status : undefined,
    });
    return Response.json({ error: "The action history could not be loaded." }, { status: 503 });
  }
}
