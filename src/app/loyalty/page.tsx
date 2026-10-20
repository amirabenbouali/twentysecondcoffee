import type { Metadata } from "next";
import Link from "next/link";
import BeanMark from "@/components/loyalty/BeanMark";
import JoinForm from "@/components/loyalty/JoinForm";
import { BEANS_PER_REWARD } from "@/lib/loyalty/types";

export const metadata: Metadata = {
  title: "Loyalty | twenty second coffee",
  description: "Collect nine beans and enjoy your next coffee on us with Twenty Second Rewards.",
};

const steps = [
  {
    number: "01",
    title: "Join in a moment",
    text: "Create your free card online and keep it saved on your phone.",
  },
  {
    number: "02",
    title: "Collect a bean",
    text: "Show your card after buying a qualifying coffee and we will add a bean.",
  },
  {
    number: "03",
    title: "Enjoy the tenth",
    text: "Nine beans unlock your next standard coffee, made just the way you like it.",
  },
];

export default function LoyaltyPage() {
  return (
    <>
      <section className="border-b border-ink-950/15 bg-[#ead8c0] pt-[72px] text-ink-950">
        <div className="mx-auto grid min-h-[680px] max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:py-24">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cherry-700">Twenty Second Rewards</p>
            <h1 className="mt-6 max-w-3xl font-display text-[clamp(4.5rem,8.5vw,8.5rem)] leading-[0.82] tracking-[-0.05em]">
              Your tenth cup,<br /><span className="italic">on us.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-ink-900/65">A simple thank you for coming back. Collect nine coffee beans and your next standard coffee is free.</p>
            <a href="#join" className="mt-8 inline-flex rounded-full bg-ink-950 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50">Start collecting</a>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:justify-self-end">
            <div className="absolute -left-5 -top-5 h-32 w-32 rounded-full border border-cherry-700/30" />
            <div className="relative rotate-[2deg] rounded-[1.5rem] bg-cherry-700 p-7 text-paper-50 shadow-[0_35px_90px_rgba(80,29,17,0.22)] sm:p-9">
              <div className="flex flex-col items-start gap-2 border-b border-paper-50/25 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <p className="font-display text-[1.7rem] tracking-[-0.035em] sm:text-3xl">twenty second rewards</p>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">Member card</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {Array.from({ length: BEANS_PER_REWARD }, (_, index) => (
                  <span key={index} className={`flex aspect-square items-center justify-center rounded-full border p-4 ${index < 5 ? "border-paper-50 bg-paper-50 text-cherry-700" : "border-paper-50/40 text-paper-50/38"}`}>
                    <BeanMark filled={index < 5} />
                  </span>
                ))}
              </div>
              <div className="mt-8 flex items-end justify-between gap-6">
                <p className="max-w-[13rem] font-display text-3xl leading-none">Four more beans until your free coffee.</p>
                <span className="font-mono text-[9px] tracking-[0.16em] text-paper-50/60">COFFEE01</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink-950/15 bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-10">
          {steps.map((step) => (
            <article key={step.number} className="border-b border-ink-950/15 py-9 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-12 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <p className="font-mono text-[10px] tracking-[0.18em] text-cherry-700">{step.number}</p>
              <h2 className="mt-5 font-display text-3xl leading-none">{step.title}</h2>
              <p className="mt-4 max-w-xs text-sm leading-6 text-ink-900/58">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="join" className="scroll-mt-24 bg-[#f5efe3] text-ink-950">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-10 lg:py-28">
          <div className="lg:sticky lg:top-28">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">Keep it close</p>
            <h2 className="mt-5 max-w-xl font-display text-6xl leading-[0.9] tracking-[-0.04em] sm:text-8xl">One card.<br /><span className="italic">No app.</span></h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-ink-900/62">Your card lives in the browser, so there is nothing to download. Bookmark it, add it to your home screen or keep a screenshot of the QR code.</p>
            <div className="mt-8 border-t border-ink-950/15 pt-6 text-xs leading-6 text-ink-900/50">
              <p>Qualifying drinks are confirmed by the team at the counter. The reward covers one standard coffee. Alternative milks, syrups and other extras remain chargeable.</p>
            </div>
          </div>
          <JoinForm />
        </div>
      </section>

      <section className="bg-ink-950 px-5 py-12 text-center text-paper-50 sm:px-8">
        <p className="text-sm text-paper-50/58">Already joined but cannot find your card?</p>
        <Link href="/contact" className="mt-3 inline-flex border-b border-paper-50/45 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em]">Ask the team for help</Link>
      </section>
    </>
  );
}
