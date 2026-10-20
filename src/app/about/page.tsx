import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `About | ${site.name}`,
  description: `The story behind ${site.name}, a community coffee shop in ${site.neighborhood}.`,
};

const values = [
  { symbol: "⌂", title: "Local", text: "Independent, familiar, and proudly rooted in Royal Wharf." },
  { symbol: "◡", title: "Welcoming", text: "A place for regulars, newcomers, and everyone in between." },
  { symbol: "✦", title: "Thoughtful", text: "Care in the coffee, the details, and the way people are treated." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative min-h-[680px] overflow-hidden bg-ink-950 pt-[72px] text-paper-50 sm:min-h-[740px]">
        <Image src="/about-hero.jpeg" alt="The welcoming interior of twenty second coffee" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "50% 48%" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,13,10,0.18),rgba(18,13,10,0.24)_35%,rgba(18,13,10,0.82))]" />
        <div className="relative mx-auto flex min-h-[608px] max-w-7xl flex-col items-center justify-end px-5 pb-16 text-center sm:min-h-[668px] sm:px-8 sm:pb-20 lg:px-10">
          <p className="reveal text-[10px] font-semibold uppercase tracking-[0.3em] text-paper-50/72">Our story · Royal Wharf</p>
          <h1 className="reveal mt-5 max-w-5xl font-display text-[clamp(4rem,9vw,8rem)] leading-[0.86] tracking-[-0.045em]">Built for the neighbourhood.</h1>
          <p className="reveal mt-7 max-w-lg text-sm leading-7 text-paper-50/72 sm:text-base">More than somewhere to collect a coffee. A familiar place to pause, connect, and feel part of Royal Wharf.</p>
        </div>
      </section>

      <section className="border-b border-ink-950/15 bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-10">
          {values.map((value) => (
            <div key={value.title} className="grid grid-cols-[42px_1fr] gap-4 border-b border-ink-950/15 py-7 last:border-b-0 md:border-b-0 md:border-r md:px-7 md:py-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <span className="font-display text-3xl text-cherry-700" aria-hidden="true">{value.symbol}</span>
              <div>
                <h2 className="font-display text-2xl leading-none">{value.title}</h2>
                <p className="mt-3 max-w-xs text-xs leading-5 text-ink-900/60">{value.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f5efe3] text-ink-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16 lg:px-10 lg:py-28">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">Why we opened</p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-ink-900/55">A simple idea, shaped by the people around us.</p>
          </Reveal>
          <Reveal delayMs={100}>
            <h2 className="max-w-4xl font-display text-5xl leading-[0.94] tracking-[-0.035em] sm:text-7xl lg:text-8xl">A coffee shop should feel like part of your day.</h2>
            <div className="mt-10 grid gap-7 border-t border-ink-950/20 pt-8 text-sm leading-7 text-ink-900/65 sm:grid-cols-2">
              <p>{site.name} began with a simple ambition: genuinely good coffee and a warm, familiar welcome for the people who live and work around us.</p>
              <p>Royal Wharf is a growing community. We have grown alongside it, learning names, supporting local ideas, and giving neighbours a reason to bump into each other.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <Reveal className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[760px]">
            <Image src="/about-counter.jpeg" alt="A view along the counter at twenty second coffee" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <div className="flex items-center px-5 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
            <Reveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">What we pour</p>
              <h2 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-7xl">Coffee with <span className="italic">character.</span></h2>
              <p className="mt-7 max-w-lg text-sm leading-7 text-ink-900/65 sm:text-base">Our house coffee is Bourbon Cream, a smooth and balanced Brazil and Colombia blend from Pact Coffee. It is available regular or decaf.</p>
              <div className="mt-8 grid grid-cols-2 border-y border-ink-950/18 py-6 text-xs">
                <div className="border-r border-ink-950/18 pr-5"><p className="uppercase tracking-[0.2em] text-ink-900/42">Roaster</p><p className="mt-2 font-semibold">Pact Coffee</p></div>
                <div className="pl-6"><p className="uppercase tracking-[0.2em] text-ink-900/42">Origin</p><p className="mt-2 font-semibold">Brazil + Colombia</p></div>
              </div>
              <Link href="/menu" className="mt-8 inline-flex items-center gap-3 border-b border-ink-950 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">Explore the menu <span>↗</span></Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink-950 text-paper-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <Reveal className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-50/48">What matters here</p>
            <h2 className="max-w-4xl font-display text-5xl leading-[0.94] tracking-[-0.035em] sm:text-7xl">Small things make a place feel special.</h2>
          </Reveal>
          <div className="mt-12 grid border-t border-paper-50/18 md:grid-cols-3">
            {values.map((value, index) => (
              <Reveal key={value.title} delayMs={index * 90} className="border-b border-paper-50/18 py-9 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <p className="font-display text-4xl text-paper-50/35">0{index + 1}</p>
                <h3 className="mt-10 font-display text-4xl">{value.title}</h3>
                <p className="mt-4 max-w-xs text-sm leading-6 text-paper-50/58">{value.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5efe3] text-ink-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-5 sm:grid-cols-[0.78fr_1.22fr]">
            <Reveal className="relative min-h-[360px] overflow-hidden rounded-[1.25rem] sm:min-h-[560px]"><Image src="/about-sign.jpeg" alt="The round twenty second coffee sign outside the shop" fill sizes="(min-width: 640px) 40vw, 100vw" className="object-cover" /></Reveal>
            <Reveal delayMs={100} className="relative min-h-[360px] overflow-hidden rounded-[1.25rem] sm:min-h-[560px]"><Image src="/about-interior.jpeg" alt="The seating and illustrated feature wall inside twenty second coffee" fill sizes="(min-width: 640px) 60vw, 100vw" className="object-cover" /></Reveal>
          </div>
          <Reveal className="mx-auto mt-16 max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">The next chapter</p>
            <h2 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-7xl">There is always room for one more.</h2>
            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-ink-900/62 sm:text-base">Have an event idea, a local collaboration, or simply something you think we should know? We would love to hear from you.</p>
            <Link href="/contact" className="mt-8 inline-flex rounded-full border border-ink-950 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-ink-950 hover:text-paper-50">Get in touch</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
