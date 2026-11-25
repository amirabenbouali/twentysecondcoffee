import { getStaffSession } from "@/lib/loyalty/auth";
import { lookupLoyaltyMember, LoyaltyDatabaseError } from "@/lib/loyalty/db";
import { checkLoyaltyRateLimit } from "@/lib/loyalty/rate-limit";

const CODE_PATTERN = /^(?:TSC:)?[A-Za-z0-9_-]{8,64}$/;

export async function GET(request: Request) {
  let staff;
  try {
    staff = await getStaffSession();
  } catch {
    return Response.json({ error: "Staff access is temporarily unavailable." }, { status: 503 });
  }
  if (!staff) return Response.json({ error: "Staff sign-in required." }, { status: 401 });

  const code = (new URL(request.url).searchParams.get("code") ?? "").trim();
  if (!CODE_PATTERN.test(code)) {
    return Response.json({ error: "Enter or scan a valid card code." }, { status: 400 });
  }

  try {
    const limit = await checkLoyaltyRateLimit(request, "lookup", staff.id);
    if (!limit.success) {
      return Response.json({ error: "Too many scans. Please wait a moment." }, { status: 429 });
    }
    const member = await lookupLoyaltyMember(staff.id, code);
    if (!member) return Response.json({ error: "No matching card was found." }, { status: 404 });
    return Response.json({ member }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[loyalty] member_lookup_failed", {
      code: error instanceof LoyaltyDatabaseError ? error.code : undefined,
      status: error instanceof LoyaltyDatabaseError ? error.status : undefined,
    });
    return Response.json({ error: "The card could not be looked up." }, { status: 503 });
  }
}
