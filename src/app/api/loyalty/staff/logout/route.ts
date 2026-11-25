import { clearStaffSession, isSameOrigin } from "@/lib/loyalty/auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }

  await clearStaffSession().catch(() => {
    console.error("[loyalty] staff_session_revoke_failed");
  });
  return Response.json({ ok: true });
}
