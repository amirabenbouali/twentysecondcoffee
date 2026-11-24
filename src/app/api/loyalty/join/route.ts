import { createLoyaltyMember, LoyaltyDatabaseError } from "@/lib/loyalty/db";
import { isSameOrigin } from "@/lib/loyalty/auth";
import { checkLoyaltyRateLimit } from "@/lib/loyalty/rate-limit";
import { validateLoyaltyRegistration } from "@/lib/loyalty/registration";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }

  let limit;
  try {
    limit = await checkLoyaltyRateLimit(request, "join");
  } catch {
    return Response.json(
      { error: "Online joining is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }
  if (!limit.success) {
    return Response.json(
      { error: "Too many attempts. Please ask a member of the team for help." },
      { status: 429 },
    );
  }

  const registration = validateLoyaltyRegistration(
    await request.json().catch(() => null),
  );
  if (!registration.success) {
    return Response.json({ error: registration.error }, { status: 400 });
  }

  try {
    const member = await createLoyaltyMember(registration.data);
    return Response.json(
      { cardUrl: `/loyalty/${member.public_code}` },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof LoyaltyDatabaseError) {
      if (error.code === "23505") {
        return Response.json(
          {
            error:
              "We could not create a new card with those details. If you have joined before, ask the team to help you reopen your card.",
          },
          { status: 409 },
        );
      }

      if (error.code === "NOT_CONFIGURED") {
        return Response.json(
          { error: "Online joining is being prepared. Please check back soon." },
          { status: 503 },
        );
      }
    }

    console.error("[loyalty] member_creation_failed", {
      code: error instanceof LoyaltyDatabaseError ? error.code : undefined,
      status: error instanceof LoyaltyDatabaseError ? error.status : undefined,
    });
    return Response.json(
      { error: "We could not create your card. Please try again." },
      { status: error instanceof LoyaltyDatabaseError ? error.status : 500 },
    );
  }
}
