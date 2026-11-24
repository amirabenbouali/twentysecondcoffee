import { getStaffSession } from "@/lib/loyalty/auth";
import { LoyaltyDatabaseError, searchLoyaltyMembers } from "@/lib/loyalty/db";
import { checkLoyaltyRateLimit } from "@/lib/loyalty/rate-limit";

export async function GET(request: Request) {
  let staff;
  try {
    staff = await getStaffSession();
  } catch {
    return Response.json({ error: "Staff access is temporarily unavailable." }, { status: 503 });
  }
  if (!staff) return Response.json({ error: "Staff sign-in required." }, { status: 401 });

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 160);
  const cursor = url.searchParams.get("cursor");

  try {
    const limit = await checkLoyaltyRateLimit(request, "search", staff.id);
    if (!limit.success) {
      return Response.json({ error: "Too many searches. Please wait a moment." }, { status: 429 });
    }
    const page = await searchLoyaltyMembers(staff.id, { query, cursor, limit: 25 });
    return Response.json(page, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[loyalty] staff_member_search_failed", {
      code: error instanceof LoyaltyDatabaseError ? error.code : undefined,
      status: error instanceof LoyaltyDatabaseError ? error.status : undefined,
    });
    const status = error instanceof LoyaltyDatabaseError && error.status === 400 ? 400 : 503;
    return Response.json(
      { error: status === 400 ? "That page link is invalid." : "Customer cards could not be loaded." },
      { status },
    );
  }
}
