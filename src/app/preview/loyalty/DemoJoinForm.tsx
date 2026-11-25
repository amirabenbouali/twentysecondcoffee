"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MARKETING_CONSENT_TEXT } from "@/lib/privacy/constants";
import { validateLoyaltyRegistration } from "@/lib/loyalty/registration";
import styles from "@/components/loyalty/loyalty.module.css";

export default function DemoJoinForm() {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const firstName = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const marketingConsent = useRef<HTMLInputElement>(null);
  const demoCardLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (complete) demoCardLink.current?.focus();
  }, [complete]);

  function fillSample() {
    if (firstName.current) firstName.current.value = "Alex";
    if (email.current) email.current.value = "alex@example.invalid";
    setError("");
    firstName.current?.focus();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || complete) return;

    const result = validateLoyaltyRegistration({
      firstName: firstName.current?.value,
      email: email.current?.value,
      marketingConsent: marketingConsent.current?.checked,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }

    setError("");
    setPending(true);
    const form = event.currentTarget;
    // Pause briefly so reviewers can see the pending state. This demo makes no request.
    window.setTimeout(() => {
      form.reset();
      setPending(false);
      setComplete(true);
    }, 500);
  }

  return (
    <div className={styles.registration}>
      <button type="button" className={styles.fillSample} onClick={fillSample} disabled={pending || complete}>Use sample details</button>
      <form autoComplete="off" onSubmit={submit} onInput={() => setError("")} aria-busy={pending}>
        <fieldset disabled={pending || complete} className={styles.fields}>
          <legend className="sr-only">Your details</legend>
          <label htmlFor="demo-first-name">First name</label>
          <input id="demo-first-name" ref={firstName} required minLength={2} maxLength={40} />
          <label htmlFor="demo-email">Email</label>
          <input id="demo-email" ref={email} type="email" required maxLength={160} aria-describedby="demo-email-help" />
          <p id="demo-email-help" className={styles.help}>Used to identify and recover your card with help from our team.</p>

          <fieldset className={styles.consent}>
            <legend>Optional marketing</legend>
            <label>
              <input ref={marketingConsent} type="checkbox" />
              <span>{MARKETING_CONSENT_TEXT}</span>
            </label>
            <p className={styles.help}>Your choice does not affect your loyalty card.</p>
          </fieldset>
        </fieldset>

        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.privacy}>
          One account per customer. We use your details to operate and recover your loyalty card. Read our{" "}
          <Link href="/privacy">privacy notice</Link>. Marketing is optional and separate from joining.
        </p>
        {complete ? (
          <Link ref={demoCardLink} className={styles.button} href="/preview/loyalty/card?new=1">Open demo card <span aria-hidden="true">↗</span></Link>
        ) : (
          <button type="submit" className={styles.button} disabled={pending}>{pending ? "Preparing demo card…" : "Create my demo card"}</button>
        )}
      </form>
      <p className={styles.feedback} role="status">
        {pending ? "Preparing your preview." : complete ? "Your demo card is ready. Your details were discarded." : ""}
      </p>
    </div>
  );
}
