"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { MARKETING_CONSENT_TEXT } from "@/lib/privacy/constants";

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
    try {
      const response = await fetch("/api/loyalty/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          email: form.get("email"),
          marketingConsent: form.get("marketingConsent") === "on",
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        cardUrl?: string;
        error?: string;
      } | null;

      if (!response.ok || !result?.cardUrl) {
        setError(result?.error ?? "We could not create your card. Please try again.");
        return;
      }

      window.localStorage.setItem(SAVED_CARD_KEY, result.cardUrl);
      router.push(result.cardUrl);
    } catch {
      setError("We could not reach the loyalty service. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
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

      <form onSubmit={submit} className="mt-7 space-y-5" aria-busy={pending}>
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
          <span className="mt-2 block text-xs leading-5 text-ink-700">Used to identify and recover your card with help from our team.</span>
        </label>

        <fieldset className="rounded-xl border border-ink-950/12 p-4">
          <legend className="px-1 text-[9px] font-semibold uppercase tracking-[0.17em] text-ink-700">
            Optional marketing
          </legend>
          <label className="flex items-start gap-3 text-xs leading-5 text-ink-900/62">
            <input name="marketingConsent" type="checkbox" className="mt-1 h-4 w-4 accent-cherry-700" />
            <span>{MARKETING_CONSENT_TEXT}</span>
          </label>
          <p className="mt-3 text-[11px] leading-5 text-ink-700">
            Your choice does not affect your loyalty card.
          </p>
        </fieldset>

        <div aria-live="polite" aria-atomic="true">
          {error && <p className="rounded-xl bg-blush-100 px-4 py-3 text-sm text-rust-600" role="alert">{error}</p>}
          {pending && <p className="text-sm text-ink-700" role="status">Creating your loyalty card.</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-ink-950 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50 transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-50"
        >
          {pending ? "Creating your card" : "Create my loyalty card"}
        </button>
      </form>

      <p className="mt-5 text-[11px] leading-5 text-ink-700">
        One account per customer. We use your details to operate and recover your loyalty card. Read our{" "}
        <Link href="/privacy" className="font-semibold text-ink-950 underline underline-offset-4">
          privacy notice
        </Link>
        . Marketing is optional and separate from joining.
      </p>
    </div>
  );
}
