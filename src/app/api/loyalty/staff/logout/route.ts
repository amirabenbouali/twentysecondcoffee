import { clearStaffSession, isSameOrigin } from "@/lib/loyalty/auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }

  await clearStaffSession();
  return Response.json({ ok: true });
}
