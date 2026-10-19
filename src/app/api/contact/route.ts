import { NextResponse } from "next/server";

type ContactPayload = {
  topic?: string;
  name?: string;
  email?: string;
  message?: string;
};

// NOTE: this endpoint currently just logs submissions server-side.
// To actually receive messages, wire this up to an email service
// (e.g. Resend, Postmark) or forward `body` to a webhook. See README.
export async function POST(request: Request) {
  const body: ContactPayload = await request.json();
  const { topic, name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  console.log("New contact form submission:", { topic, name, email, message });

  return NextResponse.json({ ok: true });
}
