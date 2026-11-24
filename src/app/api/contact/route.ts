import { sendContactEmail } from "@/lib/contact/email";
import { handleContactRequest } from "@/lib/contact/handler";
import { checkContactRateLimit } from "@/lib/contact/rate-limit";

export async function POST(request: Request) {
  return handleContactRequest(request, {
    checkRateLimit: checkContactRateLimit,
    sendEmail: sendContactEmail,
    reportOperationalError(code, metadata) {
      // Never log the submitted name, email address, message, or client IP.
      console.error(`[contact] ${code}`, metadata ?? {});
    },
  });
}
