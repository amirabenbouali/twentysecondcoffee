import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { events } from "@/data/events";
import CoffeeRing from "@/components/CoffeeRing";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import TornEdge from "@/components/TornEdge";
import EventCard from "@/components/EventCard";

const tickerItems = [
  site.neighborhood.toUpperCase(),
  "COMMUNITY COFFEE SHOP",
  "FRESH ROASTS, WEEKLY",
  "COME AS A STRANGER, LEAVE AS A REGULAR",
];

export default function Home() {
  const nextEvents = events.slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-espresso-950 text-paper-50">
        <span
          aria-hidden="true"
          className="ghost-numeral font-display pointer-events-none absolute -right-[8vw] -top-[10vw] select-none text-[46vw] font-bold leading-none text-paper-50"
        >
          22
        </span>
        <CoffeeRing
          seed={4}
          delayMs={300}
          className="pointer-events-none absolute -right-24 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 opacity-70 md:block md:right-[-8%]"
        />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-28 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-14 md:py-32">
          <div>
            <div
              className="reveal flex flex-wrap items-center gap-3"
              style={{ "--reveal-delay": "80ms" } as CSSProperties}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                {site.neighborhood}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-paper-50/10 px-3 py-1 text-xs font-semibold text-paper-100/80">
                ★ {site.googleRating.value} · {site.googleRating.count} Google reviews
              </span>
            </div>

            <h1
              className="reveal mt-5 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl"
              style={{ "--reveal-delay": "220ms" } as CSSProperties}
            >
              A coffee shop built by the{" "}
              <span className="font-script text-amber-300">community</span>, for the
              community.
            </h1>

            <p
              className="reveal mt-6 max-w-md text-paper-100/70"
              style={{ "--reveal-delay": "380ms" } as CSSProperties}
            >
              {site.name} is Royal Wharf&rsquo;s neighbourhood spot for great coffee, familiar
              faces, and the kind of morning that starts a good day. Come as a stranger,
              leave as a regular.
            </p>

            <div
              className="reveal mt-9 flex flex-wrap gap-4"
              style={{ "--reveal-delay": "520ms" } as CSSProperties}
            >
              <Link
                href="/menu"
                className="btn-press rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-espresso-950 transition-colors hover:bg-amber-300"
              >
                See the menu
              </Link>
              <Link
                href="/events"
                className="btn-press rounded-full border border-paper-50/25 px-6 py-3 text-sm font-semibold text-paper-50 transition-colors hover:border-paper-50"
              >
                Upcoming events
              </Link>
            </div>
          </div>

          <div
            className="reveal relative mx-auto aspect-square w-full max-w-sm"
            style={{ "--reveal-delay": "260ms" } as CSSProperties}
          >
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src="/logo-light.png"
                alt={`${site.name} logo — a hand-drawn coffee cup with a coffee-ring stain`}
                width={900}
                height={664}
                className="w-full drop-shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                priority
              />
            </div>
          </div>
        </div>

        <TornEdge
          fill="var(--color-paper-50)"
          className="pointer-events-none absolute -bottom-px left-0 h-8 w-full md:h-12"
        />
      </section>

      {/* Ticker */}
      <div className="border-y border-ink-950/10 bg-paper-100 py-3">
        <Marquee items={tickerItems} className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-900/60" />
      </div>

      {/* Community intro — asymmetric bento, not matched cards */}
      <section className="bg-paper-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal className="rounded-2xl bg-paper-100 p-8 md:row-span-2 md:p-10">
              <p className="font-script text-3xl leading-none text-amber-700">
                &ldquo;Come as a stranger,
                <br />
                leave as a regular.&rdquo;
              </p>
              <h2 className="mt-6 font-display text-2xl font-semibold text-ink-950">
                More than a coffee shop
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-900/70">
                We&rsquo;re proud to be part of Royal Wharf. Whether you&rsquo;re grabbing a
                quick espresso before work or settling in for the afternoon, this is a
                place to slow down and connect with your neighbours.
              </p>
            </Reveal>

            <Reveal delayMs={120} className="grain rounded-2xl bg-espresso-950 p-8 text-paper-50">
              <h2 className="font-display text-2xl font-semibold">Fresh drinks, always</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-100/70">
                Our baristas are always working on something new. Check the menu for our
                current lineup and seasonal specials.
              </p>
              <Link
                href="/menu"
                className="mt-4 inline-block text-sm font-semibold text-amber-300 hover:underline"
              >
                See the menu →
              </Link>
            </Reveal>

            <Reveal delayMs={220} className="rounded-2xl bg-amber-100 p-8">
              <h2 className="font-display text-2xl font-semibold text-ink-950">
                We want to hear from you
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-900/70">
                Feedback, event ideas, or a business opportunity? We read every message.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-block text-sm font-semibold text-amber-700 hover:underline"
              >
                Get in touch →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="relative overflow-hidden bg-paper-200">
        <CoffeeRing
          seed={11}
          className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 opacity-40"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              What&rsquo;s coming up
            </h2>
            <Link href="/events" className="text-sm font-semibold text-amber-700 hover:underline">
              View all events →
            </Link>
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2">
            {nextEvents.map((event, i) => (
              <EventCard
                key={event.title}
                event={event}
                notchColor="var(--color-paper-200)"
                delayMs={i * 120}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="grain relative overflow-hidden bg-espresso-950 text-paper-50">
        <TornEdge
          fill="var(--color-paper-200)"
          className="pointer-events-none absolute -top-px left-0 h-8 w-full rotate-180 md:h-12"
        />
        <CoffeeRing
          seed={19}
          className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 opacity-50"
        />
        <Reveal className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="font-script text-5xl text-amber-300 sm:text-6xl">
            Come say hello
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-paper-100/70">
            Find us in {site.neighborhood}. Open every day — see our full hours and get in
            touch below.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="btn-press rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-espresso-950 transition-colors hover:bg-amber-300"
            >
              Contact us
            </Link>
            <Link
              href="/about"
              className="btn-press rounded-full border border-paper-50/25 px-6 py-3 text-sm font-semibold text-paper-50 transition-colors hover:border-paper-50"
            >
              Our story
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
