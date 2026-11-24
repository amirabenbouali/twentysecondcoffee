"use client";

import { FormEvent, useState } from "react";
import BeanMark from "./BeanMark";
import StaffScanner from "./StaffScanner";
import {
  BEANS_PER_REWARD,
  type LoyaltyAction,
  type LoyaltyActivity,
  type LoyaltyMemberPage,
  type LoyaltyStaff,
  type StaffLoyaltyMember,
} from "@/lib/loyalty/types";

export default function StaffDashboard({
  initialPage,
  staff,
}: {
  initialPage: LoyaltyMemberPage;
  staff: LoyaltyStaff;
}) {
  const [members, setMembers] = useState(initialPage.members);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [scannedMemberId, setScannedMemberId] = useState<string | null>(null);
  const [activity, setActivity] = useState<{
    member: StaffLoyaltyMember;
    rows: LoyaltyActivity[];
  } | null>(null);

  async function loadPage(search: string, cursor?: string | null, append = false) {
    setBusy(append ? "load-more" : "search");
    setMessage("");
    try {
      const parameters = new URLSearchParams();
      if (search) parameters.set("q", search);
      if (cursor) parameters.set("cursor", cursor);
      const response = await fetch(`/api/loyalty/staff/members?${parameters}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as LoyaltyMemberPage & { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "Customer cards could not be loaded.");
        return;
      }
      setMembers((current) => (append ? [...current, ...result.members] : result.members));
      setNextCursor(result.nextCursor);
      setActiveQuery(search);
      setScannedMemberId(null);
    } catch {
      setMessage("The loyalty desk could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadPage(query.trim());
  }

  function showScannedMember(member: StaffLoyaltyMember) {
    setMembers((current) => [member, ...current.filter((item) => item.id !== member.id)]);
    setNextCursor(null);
    setActiveQuery("");
    setQuery("");
    setScannedMemberId(member.id);
    setMessage(`Card found for ${member.first_name}.`);
  }

  async function act(member: StaffLoyaltyMember, action: LoyaltyAction) {
    if (
      action === "redeem" &&
      !window.confirm(`Redeem one free coffee for ${member.first_name}?`)
    ) return;

    const key = `${member.id}:${action}`;
    setBusy(key);
    setMessage("");
    try {
      const response = await fetch(
        `/api/loyalty/staff/members/${member.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            source: scannedMemberId === member.id ? "scanner" : "staff_desk",
          }),
        },
      );
      const result = (await response.json()) as { member?: StaffLoyaltyMember; error?: string };
      if (!response.ok || !result.member) {
        setMessage(result.error ?? "That action could not be completed.");
        return;
      }
      setMembers((current) =>
        current.map((item) => (item.id === result.member?.id ? result.member : item)),
      );
    } catch {
      setMessage("The action may not have reached the server. Refresh the card before retrying.");
    } finally {
      setBusy(null);
    }
  }

  async function showActivity(member: StaffLoyaltyMember) {
    setBusy(`${member.id}:activity`);
    setMessage("");
    try {
      const response = await fetch(
        `/api/loyalty/staff/members/${member.id}/activity`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as {
        activity?: LoyaltyActivity[];
        error?: string;
      };
      if (!response.ok || !result.activity) {
        setMessage(result.error ?? "The action history could not be loaded.");
        return;
      }
      setActivity({ member, rows: result.activity });
    } catch {
      setMessage("The action history could not be loaded.");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/loyalty/staff/logout", { method: "POST" }).catch(() => null);
    window.location.reload();
  }

  return (
    <div>
      <div className="flex flex-col gap-7 border-b border-ink-950/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-cherry-700">
            Signed in as {staff.display_name} · {staff.role}
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-[-0.035em] sm:text-6xl">Loyalty desk</h1>
          <p className="mt-4 text-sm text-ink-900/55">{members.length} customer {members.length === 1 ? "card" : "cards"} loaded</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StaffScanner onMember={showScannedMember} />
          <button onClick={logout} className="rounded-full border border-ink-950/25 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] hover:bg-ink-950 hover:text-paper-50">Sign out</button>
        </div>
      </div>

      <form onSubmit={search} className="mt-8">
        <label htmlFor="member-search" className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-900/60">Find a card</label>
        <div className="mt-2 flex gap-2">
          <input id="member-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or card code" className="min-w-0 flex-1 rounded-xl border border-ink-950/18 bg-paper-50 px-4 py-3.5 text-base outline-none focus:border-cherry-700" />
          <button disabled={busy !== null} className="rounded-xl bg-ink-950 px-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-paper-50 disabled:opacity-40">Search</button>
        </div>
      </form>

      {message && <p className="mt-5 rounded-xl bg-blush-100 px-4 py-3 text-sm text-rust-600" role="status">{message}</p>}

      <div className="mt-7 space-y-4">
        {members.map((member) => (
          <article key={member.id} className={`rounded-[1.25rem] border bg-paper-50 p-5 sm:p-6 ${scannedMemberId === member.id ? "border-cherry-700 shadow-[0_0_0_3px_rgba(165,31,27,0.08)]" : "border-ink-950/14"}`}>
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
                {staff.role === "manager" && <button onClick={() => act(member, "undo")} disabled={busy !== null} className="rounded-full border border-ink-950/22 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] disabled:opacity-30">Undo last</button>}
                {staff.role === "manager" && <button onClick={() => showActivity(member)} disabled={busy !== null} className="rounded-full border border-ink-950/22 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] disabled:opacity-30">History</button>}
              </div>
            </div>
          </article>
        ))}

        {members.length === 0 && <div className="rounded-[1.25rem] border border-dashed border-ink-950/20 py-14 text-center"><p className="font-display text-3xl">No card found.</p><p className="mt-2 text-sm text-ink-900/50">Check the name, email or card code.</p></div>}
      </div>

      {nextCursor && (
        <button onClick={() => loadPage(activeQuery, nextCursor, true)} disabled={busy !== null} className="mx-auto mt-8 block rounded-full border border-ink-950/25 px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.15em] disabled:opacity-40">
          {busy === "load-more" ? "Loading" : "Load more"}
        </button>
      )}

      {activity && (
        <div className="fixed inset-0 z-[80] flex items-end bg-ink-950/60 p-4 backdrop-blur-sm sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="activity-title">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] bg-paper-50 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cherry-700">Manager audit</p><h2 id="activity-title" className="mt-2 font-display text-4xl">{activity.member.first_name}&apos;s history</h2></div><button onClick={() => setActivity(null)} aria-label="Close action history" className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-950/20 text-lg">×</button></div>
            <ol className="mt-6 divide-y divide-ink-950/12 border-y border-ink-950/12">
              {activity.rows.map((row) => <li key={row.id} className="grid gap-2 py-4 text-xs sm:grid-cols-[1fr_auto]"><div><span className="font-semibold uppercase tracking-[0.12em] text-ink-950">{row.action}</span>{row.voided_at && <span className="ml-2 text-rust-600">Reversed</span>}<p className="mt-1 text-ink-900/55">{row.before_beans} beans, {row.before_rewards} rewards to {row.after_beans} beans, {row.after_rewards} rewards</p></div><div className="text-ink-900/48 sm:text-right"><p>{row.staff_display_name}</p><time>{new Date(row.created_at).toLocaleString("en-GB")}</time></div></li>)}
              {activity.rows.length === 0 && <li className="py-8 text-center text-sm text-ink-900/50">No actions recorded.</li>}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
