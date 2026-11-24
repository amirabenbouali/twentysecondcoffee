"use client";

export default function StaffLoyaltyError({ reset }: { reset: () => void }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f5efe3] px-5 text-ink-950">
      <div className="max-w-lg rounded-[1.5rem] border border-ink-950/15 bg-paper-50 p-8 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cherry-700">Loyalty desk unavailable</p>
        <h1 className="mt-4 font-display text-5xl leading-none">Do not repeat an uncertain action.</h1>
        <p className="mt-5 text-sm leading-6 text-ink-900/58">The desk could not confirm the latest balances. Try again and check the customer history before adding another bean or redeeming a reward.</p>
        <button onClick={reset} className="mt-7 rounded-full bg-ink-950 px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-paper-50">Try again</button>
      </div>
    </section>
  );
}
