import Image from "next/image";
import BeanMark from "./BeanMark";
import WalletActions from "./WalletActions";
import { BEANS_PER_REWARD, type PublicLoyaltyMember } from "@/lib/loyalty/types";

type LoyaltyCardProps = {
  member: PublicLoyaltyMember;
  qrCode?: string;
  googleWalletUrl?: string | null;
};

export default function LoyaltyCard({ member, qrCode, googleWalletUrl }: LoyaltyCardProps) {
  const hasReward = member.rewards_available > 0;

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-ink-950/15 bg-[#f7efe2] shadow-[0_30px_80px_rgba(38,25,15,0.12)]">
      <div className="border-b border-ink-950/15 bg-cherry-700 px-6 py-5 text-paper-50 sm:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          <p className="font-display text-2xl tracking-[-0.03em]">twenty second rewards</p>
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="24" cy="24" r="18" />
            <circle cx="24" cy="24" r="14" opacity=".5" />
            <path d="M17 26c5-7 9-10 15-12-1 8-5 14-12 18" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-2 border-b border-ink-950/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cherry-700">Member</p>
            <h1 className="mt-2 font-display text-4xl leading-none tracking-[-0.03em]">{member.first_name}&apos;s card</h1>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/55">{member.member_code}</p>
        </div>

        {hasReward ? (
          <div className="my-7 rounded-2xl bg-ink-950 px-6 py-7 text-paper-50">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-300">Reward ready</p>
            <p className="mt-3 font-display text-4xl leading-none">Your next coffee is on us.</p>
            <p className="mt-4 text-xs leading-5 text-paper-50/60">Show this card to the team before ordering. Paid extras are not included.</p>
          </div>
        ) : (
          <div className="my-7">
            <p className="text-sm leading-6 text-ink-900/65">
              {BEANS_PER_REWARD - member.beans === 1
                ? "One more bean until your free coffee."
                : `${BEANS_PER_REWARD - member.beans} more beans until your free coffee.`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-9" aria-label={`${member.beans} of ${BEANS_PER_REWARD} beans collected`}>
          {Array.from({ length: BEANS_PER_REWARD }, (_, index) => {
            const filled = index < member.beans;
            return (
              <div
                key={index}
                className={`flex aspect-square items-center justify-center rounded-full border p-3 transition-colors sm:p-2.5 ${
                  filled
                    ? "border-cherry-700 bg-cherry-700 text-paper-50"
                    : "border-ink-950/18 bg-paper-50/55 text-ink-950/22"
                }`}
              >
                <BeanMark filled={filled} />
                <span className="sr-only">{filled ? "Collected" : "Not yet collected"}</span>
              </div>
            );
          })}
        </div>

        {qrCode && (
          <div className="mt-8 border-t border-ink-950/15 pt-7">
            <div className="grid gap-5 sm:grid-cols-[1fr_116px] sm:items-center">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cherry-700">At the counter</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-ink-900/62">Show this code after paying and the team will add your next bean.</p>
              </div>
              <div className="w-fit rounded-xl border border-ink-950/12 bg-white p-2.5">
                <Image src={qrCode} alt={`Loyalty card code ${member.member_code}`} width={96} height={96} unoptimized />
              </div>
            </div>
            <WalletActions googleWalletUrl={googleWalletUrl} />
          </div>
        )}
      </div>
    </article>
  );
}
