export type LoyaltyRegistration = {
  firstName: string;
  email: string;
  marketingConsent: boolean;
};

type RegistrationResult =
  | { success: true; data: LoyaltyRegistration }
  | { success: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoyaltyRegistration(value: unknown): RegistrationResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { success: false, error: "Please complete the loyalty form." };
  }

  const body = value as Record<string, unknown>;
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const marketingConsent = body.marketingConsent === true;

  if (firstName.length < 2 || firstName.length > 40 || /[\r\n]/.test(firstName)) {
    return { success: false, error: "Please enter your first name." };
  }

  if (email.length > 160 || !EMAIL_PATTERN.test(email) || /[\r\n]/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  return {
    success: true,
    data: { firstName, email, marketingConsent },
  };
}
