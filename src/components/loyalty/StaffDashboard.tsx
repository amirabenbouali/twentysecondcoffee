"use client";

import { useMemo, useState } from "react";
import BeanMark from "./BeanMark";
import { BEANS_PER_REWARD, type LoyaltyAction, type LoyaltyMember } from "@/lib/loyalty/types";

export default function StaffDashboard({ initialMembers }: { initialMembers: LoyaltyMember[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return members;
    return members.filter((member) =>
      [member.first_name, member.email, member.member_code].some((field) =>
        field.toLowerCase().includes(value),
      ),
    );
  }, [members, query]);

  async function act(member: LoyaltyMember, action: LoyaltyAction) {
    if (action === "redeem" && !window.confirm(`Redeem one free coffee for ${member.first_name}?`)) return;

    setBusy(`${member.id}:${action}`);
    setMessage("");
    const response = await fetch(`/api/loyalty/staff/members/${member.id}/${action}`, { method: "POST" });
    const result = (await response.json()) as { member?: LoyaltyMember; error?: string };

    if (!response.ok || !result.member) {
      setMessage(result.error ?? "That action could not be completed.");
      setBusy(null);
      return;
    }

    setMembers((current) => current.map((item) => (item.id === result.member?.id ? result.member : item)));
    setBusy(null);
  }

  async function logout() {
    await fetch("/api/loyalty/staff/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div>
      <div className="flex flex-col gap-7 border-b border-ink-950/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-cherry-700">Staff only</p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-[-0.035em] sm:text-6xl">Loyalty desk</h1>
          <p className="mt-4 text-sm text-ink-900/55">{members.length} customer {members.length === 1 ? "card" : "cards"}</p>
        </div>
        <button onClick={logout} className="w-fit rounded-full border border-ink-950/25 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] hover:bg-ink-950 hover:text-paper-50">Sign out</button>
      </div>

      <div className="mt-8">
        <label htmlFor="member-search" className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-900/60">Find a card</label>
        <input id="member-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or card code" className="mt-2 w-full rounded-xl border border-ink-950/18 bg-paper-50 px-4 py-3.5 text-base outline-none focus:border-cherry-700" />
      </div>

      {message && <p className="mt-5 rounded-xl bg-blush-100 px-4 py-3 text-sm text-rust-600" role="alert">{message}</p>}

      <div className="mt-7 space-y-4">
        {filtered.map((member) => (
          <article key={member.id} className="rounded-[1.25rem] border border-ink-950/14 bg-paper-50 p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="font-display text-3xl tracking-[-0.025em]">{member.first_name}</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-900/45">{member.member_code}</span>
                </div>
                <p className="mt-1 text-xs text-ink-900/52">{member.email}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2" aria-label={`${member.beans} beans collected`}>
                  {Array.from({ length: BEANS_PER_REWARD }, (_, index) => (
                    <span key={index} className={`flex h-7 w-7 items-center justify-center rounded-full border p-1.5 ${index < member.beans ? "border-cherry-700 bg-cherry-700 text-paper-50" : "border-ink-950/16 text-ink-950/18"}`}>
                      <BeanMark filled={index < member.beans} />
                    </span>
                  ))}
                  {member.rewards_available > 0 && <span className="ml-2 rounded-full bg-amber-100 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-700">{member.rewards_available} free coffee</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button onClick={() => act(member, "stamp")} disabled={busy !== null} className="rounded-full bg-ink-950 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-paper-50 disabled:opacity-40">{busy === `${member.id}:stamp` ? "Adding" : "Add bean"}</button>
                <button onClick={() => act(member, "redeem")} disabled={busy !== null || member.rewards_available < 1} className="rounded-full bg-cherry-700 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-paper-50 disabled:cursor-not-allowed disabled:opacity-30">{busy === `${member.id}:redeem` ? "Redeeming" : "Redeem"}</button>
                <button onClick={() => act(member, "undo")} disabled={busy !== null} className="rounded-full border border-ink-950/22 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] disabled:opacity-30">Undo last</button>
                <a href={`/loyalty/${member.public_code}`} target="_blank" rel="noreferrer" className="rounded-full border border-ink-950/22 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em]">Open card</a>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && <div className="rounded-[1.25rem] border border-dashed border-ink-950/20 py-14 text-center"><p className="font-display text-3xl">No card found.</p><p className="mt-2 text-sm text-ink-900/50">Check the name, email or eight-character card code.</p></div>}
      </div>
    </div>
  );
}
