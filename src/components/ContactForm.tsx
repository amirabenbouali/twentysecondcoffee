"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONTACT_TOPICS } from "@/lib/contact/validation";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-2 w-full border-0 border-b border-ink-950/25 bg-transparent px-0 py-3 text-sm text-ink-950 outline-none transition-colors focus:border-ink-950 focus:ring-0";

const labelClass =
  "block text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-900/50";

type ContactFormProps = {
  fallbackEmail?: string | null;
  initialTopic?: (typeof CONTACT_TOPICS)[number]["value"];
};

export default function ContactForm({
  fallbackEmail,
  initialTopic = "feedback",
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const submissionId = useRef("");
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    submissionId.current ||= crypto.randomUUID();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, submissionId: submissionId.current }),
      });
      const result = (await res.json().catch(() => null)) as {
        error?: unknown;
      } | null;

      if (!res.ok) {
        setErrorMessage(
          typeof result?.error === "string"
            ? result.error
            : "We could not send your message. Please try again later.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      submissionId.current = "";
      form.reset();
    } catch {
      setErrorMessage("We could not reach the contact service. Please try again later.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={statusRef}
        className="border-y border-ink-950/20 py-8 text-ink-950 outline-none"
        role="status"
        tabIndex={-1}
      >
        <p className="font-display text-5xl">Thank you.</p>
        <p className="mt-3 text-sm leading-6 text-ink-900/65">
          Your message has been accepted for delivery. The team will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" aria-busy={status === "submitting"}>
      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="topic" className={labelClass}>
          What&rsquo;s this about?
        </label>
        <select
          id="topic"
          name="topic"
          defaultValue={initialTopic}
          required
          className={fieldClass}
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className={fieldClass}
        />
      </div>

      <p className="text-[11px] leading-5 text-ink-900/48">
        We use the details you provide to respond to your enquiry. Read our{" "}
        <a href="/privacy" className="font-semibold text-ink-950 underline underline-offset-4">
          privacy notice
        </a>
        .
      </p>

      {status === "error" && (
        <div
          ref={statusRef}
          className="text-sm leading-6 text-cherry-700 outline-none"
          role="alert"
          tabIndex={-1}
        >
          <p>{errorMessage}</p>
          {fallbackEmail && (
            <p className="mt-2">
              You can also email us at{" "}
              <a href={`mailto:${fallbackEmail}`} className="font-semibold underline underline-offset-4">
                {fallbackEmail}
              </a>
              .
            </p>
          )}
        </div>
      )}

      {status === "submitting" && (
        <p className="text-sm text-ink-900/60" role="status">
          Sending your message.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-press rounded-full bg-ink-950 px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50 transition-colors hover:bg-cherry-700 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
