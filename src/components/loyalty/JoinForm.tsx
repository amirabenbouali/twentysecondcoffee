"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { MARKETING_CONSENT_TEXT } from "@/lib/privacy/constants";
import styles from "./loyalty.module.css";

const SAVED_CARD_KEY = "twenty-second-loyalty-card";

function isCardPath(value: unknown): value is string {
  return typeof value === "string" && /^\/loyalty\/[A-Za-z0-9_-]{24,64}$/.test(value);
}

function subscribeToSavedCard(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSavedCard() {
  try {
    const value = window.localStorage.getItem(SAVED_CARD_KEY);
    return isCardPath(value) ? value : null;
  } catch {
    return null;
  }
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

      if (!response.ok || !isCardPath(result?.cardUrl)) {
        setError(result?.error ?? "We could not create your card. Please try again.");
        return;
      }

      try {
        window.localStorage.setItem(SAVED_CARD_KEY, result.cardUrl);
      } catch {
        // Registration has already succeeded. The customer can still open their card.
      }
      router.push(result.cardUrl);
    } catch {
      setError("We could not reach the loyalty service. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.registration}>
      {savedCard && (
        <Link href={savedCard} prefetch={false} className="mt-6 flex items-center justify-between rounded-xl border border-cherry-700/25 bg-blush-100/45 px-4 py-3 text-sm transition-colors hover:bg-blush-100">
          <span>You already have a card on this device.</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <form method="post" action="/api/loyalty/join" onSubmit={submit} className={styles.liveForm} aria-busy={pending}>
        <div className={styles.fields}>
          <label htmlFor="loyalty-first-name">First name</label>
          <input
            id="loyalty-first-name"
            name="firstName"
            autoComplete="given-name"
            minLength={2}
            maxLength={40}
            required
            placeholder="Your first name"
          />

          <label htmlFor="loyalty-email">Email</label>
          <input
            id="loyalty-email"
            name="email"
            aria-describedby="loyalty-email-help"
            type="email"
            autoComplete="email"
            maxLength={160}
            required
            placeholder="you@example.com"
          />
          <p id="loyalty-email-help" className={styles.help}>Used to identify and recover your card with help from our team.</p>
        </div>

        <fieldset className={styles.consent}>
          <legend>
            Optional marketing
          </legend>
          <label>
            <input name="marketingConsent" type="checkbox" />
            <span>{MARKETING_CONSENT_TEXT}</span>
          </label>
          <p className={styles.help}>
            Your choice does not affect your loyalty card.
          </p>
        </fieldset>

        <div aria-live="polite" aria-atomic="true">
          {error && <p className={styles.error} role="alert">{error}</p>}
          {pending && <p className={styles.feedback} role="status">Creating your loyalty card.</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className={styles.button}
        >
          {pending ? "Creating your card" : "Create my loyalty card"}
        </button>
      </form>

      <p className={styles.privacy}>
        One account per customer. We use your details to operate and recover your loyalty card. Read our{" "}
        <Link href="/privacy">
          privacy notice
        </Link>
        . Marketing is optional and separate from joining.
      </p>
    </div>
  );
}
