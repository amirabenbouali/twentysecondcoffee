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

    const response = await fetch("/api/loyalty/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Unable to sign in.");
      setPending(false);
      return;
    }

    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-[1.5rem] border border-ink-950/15 bg-paper-50 p-7 shadow-[0_25px_70px_rgba(38,25,15,0.08)] sm:p-9">
      <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-cherry-700">Private access</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.035em]">Staff loyalty desk</h1>
      <p className="mt-4 text-sm leading-6 text-ink-900/58">Use the shared staff password to manage customer cards.</p>
      <label className="mt-7 block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-900/65">Password</span>
        <input name="password" type="password" autoComplete="current-password" required autoFocus className="mt-2 w-full rounded-xl border border-ink-950/18 bg-transparent px-4 py-3 outline-none focus:border-cherry-700" />
      </label>
      {error && <p className="mt-4 rounded-xl bg-blush-100 px-4 py-3 text-sm text-rust-600" role="alert">{error}</p>}
      <button type="submit" disabled={pending} className="mt-6 w-full rounded-full bg-ink-950 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50 disabled:opacity-50">
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
