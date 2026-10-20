import {
  createStaffSession,
  isSameOrigin,
  isStaffAuthConfigured,
  verifyStaffPassword,
} from "@/lib/loyalty/auth";
import { allowRequest, requestIdentifier } from "@/lib/loyalty/rate-limit";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }

  if (!isStaffAuthConfigured()) {
    return Response.json(
      { error: "Staff access has not been configured yet." },
      { status: 503 },
    );
  }

  const identifier = `login:${requestIdentifier(request)}`;
  if (!allowRequest(identifier, 8, 15 * 60 * 1000)) {
    return Response.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!verifyStaffPassword(password)) {
    return Response.json({ error: "That password is not correct." }, { status: 401 });
  }

  await createStaffSession();
  return Response.json({ ok: true });
}
