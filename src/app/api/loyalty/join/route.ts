import { createLoyaltyMember, LoyaltyDatabaseError } from "@/lib/loyalty/db";
import { isSameOrigin } from "@/lib/loyalty/auth";
import { allowRequest, requestIdentifier } from "@/lib/loyalty/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  }

  const identifier = `join:${requestIdentifier(request)}`;
  if (!allowRequest(identifier, 5, 60 * 60 * 1000)) {
    return Response.json(
      { error: "Too many attempts. Please ask a member of the team for help." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    firstName?: unknown;
    email?: unknown;
    marketingConsent?: unknown;
  } | null;

  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const marketingConsent = body?.marketingConsent === true;

  if (firstName.length < 2 || firstName.length > 40) {
    return Response.json(
      { error: "Please enter your first name." },
      { status: 400 },
    );
  }

  if (email.length > 160 || !EMAIL_PATTERN.test(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const member = await createLoyaltyMember({ firstName, email, marketingConsent });
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
              "That email is already registered. Ask the team to help you reopen your card.",
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

    console.error("Unable to create loyalty member", error);
    return Response.json(
      { error: "We could not create your card. Please try again." },
      { status: 500 },
    );
  }
}
