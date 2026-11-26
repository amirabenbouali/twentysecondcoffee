"use client";

import { FormEvent, useState } from "react";

export default function StaffLogin() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/loyalty/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || result?.ok !== true) {
        setError(result?.error ?? "Unable to sign in. Please try again.");
        return;
      }

      window.location.reload();
    } catch {
      setError("The loyalty desk could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form method="post" action="/api/loyalty/staff/login" onSubmit={submit} aria-busy={pending} className="mx-auto max-w-md rounded-[1.5rem] border border-ink-950/15 bg-paper-50 p-6 shadow-[0_25px_70px_rgba(38,25,15,0.08)] sm:p-9">
      <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-cherry-700">Private access</p>
      <h1 className="mt-4 font-display text-[clamp(2.75rem,14vw,3rem)] leading-none tracking-[-0.035em]">Staff loyalty desk</h1>
      <p className="mt-4 text-sm leading-6 text-ink-700">Sign in with your individual staff account to manage customer cards.</p>
      <label className="mt-7 block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-900/65">Username</span>
        <input name="username" type="text" autoComplete="username" minLength={3} maxLength={50} required autoFocus className="mt-2 w-full rounded-xl border border-ink-950/18 bg-transparent px-4 py-3 outline-none focus:border-cherry-700" />
      </label>
      <label className="mt-5 block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-900/65">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-ink-950/18 bg-transparent px-4 py-3 outline-none focus:border-cherry-700" />
      </label>
      <div aria-live="polite" aria-atomic="true">
        {error && <p className="mt-4 rounded-xl bg-blush-100 px-4 py-3 text-sm text-rust-600" role="alert">{error}</p>}
        {pending && <p className="mt-4 text-sm text-ink-700" role="status">Signing in securely.</p>}
      </div>
      <button type="submit" disabled={pending} className="mt-6 w-full rounded-full bg-ink-950 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50 disabled:opacity-50">
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
