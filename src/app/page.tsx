import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { events } from "@/data/events";
import Reveal from "@/components/Reveal";
import EventCard from "@/components/EventCard";

export default function Home() {
  const nextEvents = events.slice(0, 2);

  return (
    <>
      {/* Hero — the logo mark is the hero, not a corner decoration */}
      <section className="bg-espresso-950 text-paper-50">
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-32 text-center md:pb-28 md:pt-40">
          <div
            className="reveal flex flex-wrap items-center justify-center gap-3"
            style={{ "--reveal-delay": "0ms" } as CSSProperties}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              {site.neighborhood}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-paper-50/10 px-3 py-1 text-xs font-semibold text-paper-100/80">
              ★ {site.googleRating.value} · {site.googleRating.count} Google reviews
            </span>
          </div>

          <div
            className="reveal mx-auto mt-10 w-full max-w-md sm:max-w-lg"
            style={{ "--reveal-delay": "160ms" } as CSSProperties}
          >
            <Image
              src="/logo-light.png"
              alt={`${site.name} — a hand-drawn coffee cup with a coffee-ring stain`}
              width={900}
              height={664}
              className="w-full"
              priority
            />
          </div>

          <h1
            className="reveal mt-8 font-display text-2xl font-semibold sm:text-3xl"
            style={{ "--reveal-delay": "340ms" } as CSSProperties}
          >
            Built by the community, for the community.
          </h1>

          <p
            className="reveal mx-auto mt-4 max-w-sm text-sm text-paper-100/65"
            style={{ "--reveal-delay": "460ms" } as CSSProperties}
          >
            Royal Wharf&rsquo;s neighbourhood spot for great coffee, familiar faces, and the
            kind of morning that starts a good day.
          </p>

          <div
            className="reveal mt-9 flex flex-wrap justify-center gap-4"
            style={{ "--reveal-delay": "560ms" } as CSSProperties}
          >
            <Link
              href="/menu"
              className="btn-press min-w-[180px] rounded-full bg-amber-500 px-6 py-3 text-center text-sm font-semibold text-espresso-950 transition-colors hover:bg-amber-300"
            >
              See the menu
            </Link>
            <Link
              href="/events"
              className="btn-press min-w-[180px] rounded-full border border-paper-50/25 px-6 py-3 text-center text-sm font-semibold text-paper-50 transition-colors hover:border-paper-50"
            >
              Upcoming events
            </Link>
          </div>
        </div>
      </section>

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

            <Reveal delayMs={120} className="rounded-2xl bg-espresso-950 p-8 text-paper-50">
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
      <section className="bg-paper-200">
        <div className="mx-auto max-w-6xl px-6 py-20">
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
      <section className="bg-espresso-950 text-paper-50">
        <Reveal className="mx-auto max-w-6xl px-6 py-24 text-center">
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
              className="btn-press min-w-[150px] rounded-full bg-amber-500 px-6 py-3 text-center text-sm font-semibold text-espresso-950 transition-colors hover:bg-amber-300"
            >
              Contact us
            </Link>
            <Link
              href="/about"
              className="btn-press min-w-[150px] rounded-full border border-paper-50/25 px-6 py-3 text-center text-sm font-semibold text-paper-50 transition-colors hover:border-paper-50"
            >
              Our story
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
