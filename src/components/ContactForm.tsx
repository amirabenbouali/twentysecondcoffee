"use client";

import { useState, type FormEvent } from "react";

const topics = [
  { value: "feedback", label: "Feedback" },
  { value: "event", label: "Event idea" },
  { value: "opportunity", label: "Business opportunity" },
  { value: "other", label: "Something else" },
];

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-2 w-full border-0 border-b border-ink-950/25 bg-transparent px-0 py-3 text-sm text-ink-950 outline-none transition-colors focus:border-ink-950 focus:ring-0";

const labelClass =
  "block text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-900/50";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border-y border-ink-950/20 py-8 text-ink-950" aria-live="polite">
        <p className="font-display text-5xl">Thank you.</p>
        <p className="mt-3 text-sm leading-6 text-ink-900/65">
          We&rsquo;ve received your message and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="topic" className={labelClass}>
          What&rsquo;s this about?
        </label>
        <select
          id="topic"
          name="topic"
          defaultValue="feedback"
          className={fieldClass}
        >
          {topics.map((t) => (
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
          rows={5}
          className={fieldClass}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-cherry-700" role="alert">
          Something went wrong sending your message. Please try again, or email us directly.
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
