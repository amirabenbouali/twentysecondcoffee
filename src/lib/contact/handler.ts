import type { ContactMessage } from "./validation";
import { validateContactPayload } from "./validation";

const MAX_REQUEST_BYTES = 12_000;

type DeliveryResult =
  | { accepted: true; providerId: string }
  | {
      accepted: false;
      reason: "not_configured" | "provider_rejected" | "provider_unavailable";
      providerStatus?: number;
    };

type ContactDependencies = {
  checkRateLimit: (
    request: Request,
  ) => Promise<{ success: boolean; reset: number }>;
  sendEmail: (contact: ContactMessage) => Promise<DeliveryResult>;
  reportOperationalError: (code: string, metadata?: Record<string, unknown>) => void;
};

function json(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  return Boolean(host && origin === `${protocol}://${host}`);
}

export async function handleContactRequest(
  request: Request,
  dependencies: ContactDependencies,
) {
  if (!isSameOrigin(request)) {
    return json({ error: "Request not allowed." }, 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "This form only accepts JSON requests." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return json({ error: "That message is too large." }, 413);
  }

  let limit: { success: boolean; reset: number };
  try {
    limit = await dependencies.checkRateLimit(request);
  } catch {
    dependencies.reportOperationalError("rate_limit_unavailable");
    return json(
      { error: "The contact form is temporarily unavailable. Please try again later." },
      503,
    );
  }

  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000));
    return json(
      { error: "Too many messages have been sent. Please wait and try again." },
      429,
      { "Retry-After": String(retryAfter) },
    );
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return json({ error: "That message is too large." }, 413);
  }

  let body: unknown = null;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Please submit a valid contact form." }, 400);
  }

  const validation = validateContactPayload(body);
  if (!validation.success) {
    return json({ error: validation.error }, 400);
  }

  if (validation.honeypotFilled) {
    return json({ error: "We could not send that message." }, 400);
  }

  const delivery = await dependencies.sendEmail(validation.data);
  if (!delivery.accepted) {
    dependencies.reportOperationalError("email_delivery_failed", {
      reason: delivery.reason,
      providerStatus: delivery.providerStatus,
    });

    const status = delivery.reason === "not_configured" ? 503 : 502;
    return json(
      { error: "We could not send your message. Please try again later." },
      status,
    );
  }

  return json({ ok: true }, 200);
}
