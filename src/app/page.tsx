import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { events } from "@/data/events";
import Reveal from "@/components/Reveal";
import EventCard from "@/components/EventCard";
import BeanField from "@/components/BeanField";

export default function Home() {
  const nextEvents = events.slice(0, 2);

  return (
    <>
      {/* Hero — full-bleed photo, editorial overlay */}
      <section className="relative flex min-h-screen items-end overflow-hidden bg-espresso-950 text-paper-50">
        <div className="absolute inset-0">
          <Image
            src="/photo-hero.jpg"
            alt="Inside 22nd Coffee — regulars settled into the leather armchairs by our chalkboard sign"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "50% 38%" }}
          />
          {/* Scrim only behind the text zone — keep the photo itself bright and visible */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-espresso-950 via-espresso-950/45 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-espresso-950/60 via-transparent to-transparent lg:w-2/3" />
        </div>

        <div className="relative w-full px-6 pb-20 pt-40 sm:px-10 md:pb-24 lg:px-16">
          <div className="max-w-xl">
            <div
              className="reveal flex flex-wrap items-center gap-3"
              style={{ "--reveal-delay": "0ms" } as CSSProperties}
            >
              <Image
                src="/logo-light-small.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                {site.neighborhood}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-paper-50/10 px-3 py-1 text-xs font-semibold text-paper-100/80 backdrop-blur-sm">
                ★ {site.googleRating.value} · {site.googleRating.count} reviews
              </span>
            </div>

            <h1
              className="reveal mt-6 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl"
              style={{ "--reveal-delay": "160ms" } as CSSProperties}
            >
              Built by the <span className="font-script text-amber-300">community</span>,
              for the community.
            </h1>

            <p
              className="reveal mt-5 max-w-md text-paper-100/80"
              style={{ "--reveal-delay": "320ms" } as CSSProperties}
            >
              {site.name} is Royal Wharf&rsquo;s neighbourhood spot for great coffee,
              familiar faces, and the kind of morning that starts a good day.
            </p>

            <div
              className="reveal mt-9 flex flex-wrap gap-4"
              style={{ "--reveal-delay": "460ms" } as CSSProperties}
            >
              <Link
                href="/menu"
                className="btn-press min-w-[180px] rounded-full bg-amber-500 px-6 py-3 text-center text-sm font-semibold text-espresso-950 transition-colors hover:bg-amber-300"
              >
                See the menu
              </Link>
              <Link
                href="/events"
                className="btn-press min-w-[180px] rounded-full border border-paper-50/40 px-6 py-3 text-center text-sm font-semibold text-paper-50 transition-colors hover:border-paper-50"
              >
                Upcoming events
              </Link>
            </div>
          </div>
        </div>

        <div
          className="scroll-cue absolute bottom-8 right-8 hidden flex-col items-center gap-3 text-paper-50/70 sm:flex"
          aria-hidden="true"
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ writingMode: "vertical-rl" } as CSSProperties}
          >
            Scroll
          </span>
          <span className="h-8 w-px bg-paper-50/40" />
        </div>
      </section>

      {/* Info strip */}
      <div className="border-b border-ink-950/10 bg-amber-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-4 text-sm">
          <p className="font-semibold uppercase tracking-wide text-ink-950">
            {site.neighborhood}
          </p>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-amber-700 hover:underline"
          >
            {site.address} →
          </a>
          <p className="text-ink-900/70">Mon–Sat 8am–8pm · Sun 10am–6pm</p>
        </div>
      </div>

      {/* Every bean — "22" traced in coffee beans */}
      <section className="bg-paper-100">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16">
          <BeanField className="mx-auto max-w-md text-ink-950" creaseColor="var(--color-paper-100)" />

          <Reveal delayMs={80}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              The coffee line
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
              Every bean, sourced with care.
            </h2>
            <p className="mt-4 max-w-md text-ink-900/70">
              We pour Bourbon Cream, a Brazil/Colombia blend roasted weekly by{" "}
              <a
                href="https://www.pactcoffee.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-amber-700 hover:underline"
              >
                Pact Coffee
              </a>
              . Regular or decaf — always your choice.
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-block text-sm font-semibold text-amber-700 hover:underline"
            >
              See the full menu →
            </Link>
          </Reveal>
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

            <Reveal delayMs={120} className="relative overflow-hidden rounded-2xl p-8 text-paper-50">
              <Image
                src="/photo-espresso.jpg"
                alt="Espresso pouring at 22nd Coffee"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/70 to-espresso-950/20" />
              <div className="relative">
                <h2 className="font-display text-2xl font-semibold">Fresh drinks, always</h2>
                <p className="mt-3 text-sm leading-relaxed text-paper-100/80">
                  Our baristas are always working on something new. Check the menu for our
                  current lineup and seasonal specials.
                </p>
                <Link
                  href="/menu"
                  className="mt-4 inline-block text-sm font-semibold text-amber-300 hover:underline"
                >
                  See the menu →
                </Link>
              </div>
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
