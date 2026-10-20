"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const SAVED_CARD_KEY = "twenty-second-loyalty-card";

function subscribeToSavedCard(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSavedCard() {
  return window.localStorage.getItem(SAVED_CARD_KEY);
}

export default function JoinForm() {
  const router = useRouter();
  const savedCard = useSyncExternalStore(subscribeToSavedCard, getSavedCard, () => null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/loyalty/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        email: form.get("email"),
        marketingConsent: form.get("marketingConsent") === "on",
      }),
    });
    const result = (await response.json()) as { cardUrl?: string; error?: string };

    if (!response.ok || !result.cardUrl) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }

    window.localStorage.setItem(SAVED_CARD_KEY, result.cardUrl);
    router.push(result.cardUrl);
  }

  return (
    <div className="rounded-[1.5rem] border border-ink-950/15 bg-paper-50 p-6 shadow-[0_25px_70px_rgba(38,25,15,0.08)] sm:p-9">
      <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-cherry-700">Join free</p>
      <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.03em] sm:text-5xl">Start your card.</h2>

      {savedCard && (
        <Link href={savedCard} className="mt-6 flex items-center justify-between rounded-xl border border-cherry-700/25 bg-blush-100/45 px-4 py-3 text-sm transition-colors hover:bg-blush-100">
          <span>You already have a card on this device.</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-900/65">First name</span>
          <input
            name="firstName"
            autoComplete="given-name"
            minLength={2}
            maxLength={40}
            required
            className="mt-2 w-full rounded-xl border border-ink-950/18 bg-transparent px-4 py-3 text-base outline-none transition-colors placeholder:text-ink-900/30 focus:border-cherry-700"
            placeholder="Your first name"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-900/65">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={160}
            required
            className="mt-2 w-full rounded-xl border border-ink-950/18 bg-transparent px-4 py-3 text-base outline-none transition-colors placeholder:text-ink-900/30 focus:border-cherry-700"
            placeholder="you@example.com"
          />
          <span className="mt-2 block text-xs leading-5 text-ink-900/48">Used to identify and recover your card with help from our team.</span>
        </label>

        <label className="flex items-start gap-3 text-xs leading-5 text-ink-900/58">
          <input name="marketingConsent" type="checkbox" className="mt-1 h-4 w-4 accent-cherry-700" />
          <span>I would like occasional news and rewards from twenty second coffee. Optional.</span>
        </label>

        {error && <p className="rounded-xl bg-blush-100 px-4 py-3 text-sm text-rust-600" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-ink-950 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50 transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-50"
        >
          {pending ? "Creating your card" : "Create my loyalty card"}
        </button>
      </form>

      <p className="mt-5 text-[11px] leading-5 text-ink-900/42">One account per customer. Your details are used to operate the loyalty scheme and are not shown on your public card.</p>
    </div>
  );
}
