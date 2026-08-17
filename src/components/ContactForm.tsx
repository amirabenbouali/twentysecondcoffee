"use client";

import { useState, type FormEvent } from "react";

const topics = [
  { value: "feedback", label: "Feedback" },
  { value: "event", label: "Event idea" },
  { value: "opportunity", label: "Business opportunity" },
  { value: "other", label: "Something else" },
];

type Status = "idle" | "submitting" | "success" | "error";

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
      <div className="rounded-xl border border-amber-600/20 bg-amber-100 p-6 text-ink-950">
        <p className="font-display text-lg font-semibold">Thanks — message sent!</p>
        <p className="mt-2 text-sm text-ink-900/70">
          We&rsquo;ve received your message and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-ink-900">
          What&rsquo;s this about?
        </label>
        <select
          id="topic"
          name="topic"
          defaultValue="feedback"
          className="mt-2 w-full rounded-lg border border-ink-950/15 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none focus:border-amber-600"
        >
          {topics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-900">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-2 w-full rounded-lg border border-ink-950/15 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none focus:border-amber-600"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-lg border border-ink-950/15 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none focus:border-amber-600"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink-900">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full rounded-lg border border-ink-950/15 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none focus:border-amber-600"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong sending your message. Please try again, or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-press rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-espresso-950 transition-colors hover:bg-amber-300 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
