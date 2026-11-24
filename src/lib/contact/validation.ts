export const CONTACT_TOPICS = [
  { value: "feedback", label: "Feedback" },
  { value: "event", label: "Event idea" },
  { value: "opportunity", label: "Business opportunity" },
  { value: "privacy", label: "Privacy or data request" },
  { value: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export type ContactMessage = {
  topic: ContactTopic;
  name: string;
  email: string;
  message: string;
  submissionId: string;
};

type ValidationResult =
  | { success: true; data: ContactMessage; honeypotFilled: boolean }
  | { success: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOPIC_VALUES = new Set<string>(CONTACT_TOPICS.map(({ value }) => value));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateContactPayload(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { success: false, error: "Please complete the contact form." };
  }

  const topic = stringValue(value.topic);
  const name = stringValue(value.name);
  const email = stringValue(value.email).toLowerCase();
  const message = stringValue(value.message);
  const submissionId = stringValue(value.submissionId);
  const website = stringValue(value.website);

  if (!TOPIC_VALUES.has(topic)) {
    return { success: false, error: "Please choose what your message is about." };
  }

  if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name)) {
    return { success: false, error: "Please enter a name between 2 and 100 characters." };
  }

  if (
    email.length > 254 ||
    !EMAIL_PATTERN.test(email) ||
    /[\r\n]/.test(email)
  ) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (message.length < 10 || message.length > 5000) {
    return { success: false, error: "Please enter a message between 10 and 5,000 characters." };
  }

  if (!UUID_PATTERN.test(submissionId)) {
    return { success: false, error: "Please refresh the page and try again." };
  }

  return {
    success: true,
    data: {
      topic: topic as ContactTopic,
      name,
      email,
      message,
      submissionId,
    },
    honeypotFilled: website.length > 0,
  };
}

export function contactTopicLabel(topic: ContactTopic) {
  return CONTACT_TOPICS.find(({ value }) => value === topic)?.label ?? "Website message";
}
