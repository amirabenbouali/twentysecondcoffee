import "server-only";

import type { ContactMessage } from "./validation";
import { contactTopicLabel } from "./validation";

type DeliveryResult =
  | { accepted: true; providerId: string }
  | {
      accepted: false;
      reason: "not_configured" | "provider_rejected" | "provider_unavailable";
      providerStatus?: number;
    };

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 10_000;

function deliveryConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();

  if (
    !apiKey ||
    !from ||
    !to ||
    /[\r\n]/.test(from) ||
    /[\r\n]/.test(to)
  ) {
    return null;
  }

  return { apiKey, from, to };
}

export async function sendContactEmail(
  contact: ContactMessage,
): Promise<DeliveryResult> {
  const config = deliveryConfiguration();
  if (!config) return { accepted: false, reason: "not_configured" };

  const topic = contactTopicLabel(contact.topic);
  const text = [
    `New ${topic.toLowerCase()} message from the twenty second coffee website.`,
    "",
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Topic: ${topic}`,
    "",
    contact.message,
  ].join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact-form/${contact.submissionId}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: contact.email,
        subject: `Website enquiry: ${topic}`,
        text,
      }),
    });

    const body = (await response.json().catch(() => null)) as {
      id?: unknown;
    } | null;

    if (!response.ok || typeof body?.id !== "string" || !body.id) {
      return {
        accepted: false,
        reason: "provider_rejected",
        providerStatus: response.status,
      };
    }

    return { accepted: true, providerId: body.id };
  } catch {
    return { accepted: false, reason: "provider_unavailable" };
  }
}
