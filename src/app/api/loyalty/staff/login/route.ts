import { createStaffSession, isSameOrigin, isStaffAuthConfigured } from "@/lib/loyalty/auth";
import { getStaffByUsername, LoyaltyDatabaseError, recordStaffLogin } from "@/lib/loyalty/db";
import { hashStaffPassword, verifyStaffPassword } from "@/lib/loyalty/password";
import { checkLoyaltyRateLimit } from "@/lib/loyalty/rate-limit";

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,49}$/;
const DUMMY_PASSWORD_HASH = hashStaffPassword("not-a-real-staff-password");

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }
  if (!isStaffAuthConfigured()) {
    return Response.json({ error: "Staff access has not been configured yet." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    username?: unknown;
    password?: unknown;
  } | null;
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!USERNAME_PATTERN.test(username) || !password || password.length > 200) {
    return Response.json({ error: "The username or password is not correct." }, { status: 401 });
  }

  try {
    const limit = await checkLoyaltyRateLimit(request, "login", username);
    if (!limit.success) {
      return Response.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 },
      );
    }

    const staff = await getStaffByUsername(username);
    const passwordValid = verifyStaffPassword(
      password,
      staff?.password_hash ?? DUMMY_PASSWORD_HASH,
    );
    if (!staff || !staff.active || !passwordValid) {
      return Response.json({ error: "The username or password is not correct." }, { status: 401 });
    }

    await recordStaffLogin(staff.id);
    await createStaffSession(staff.id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[loyalty] staff_login_unavailable", {
      code: error instanceof LoyaltyDatabaseError ? error.code : undefined,
      status: error instanceof LoyaltyDatabaseError ? error.status : undefined,
    });
    return Response.json(
      { error: "Staff sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
}
