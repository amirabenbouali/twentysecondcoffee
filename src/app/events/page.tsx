import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { events } from "@/data/events";
import CoffeeRing from "@/components/CoffeeRing";
import EventCard from "@/components/EventCard";

export const metadata: Metadata = {
  title: `Events — ${site.name}`,
  description: `Upcoming community events at ${site.name} in ${site.neighborhood}.`,
};

export default function EventsPage() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-espresso-950 text-paper-50">
        <CoffeeRing
          seed={8}
          delayMs={200}
          className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 opacity-40"
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-28">
          <p className="reveal text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Events
          </p>
          <h1
            className="reveal mt-4 font-display text-4xl font-semibold sm:text-5xl"
            style={{ "--reveal-delay": "140ms" } as CSSProperties}
          >
            What&rsquo;s happening at {site.name}
          </h1>
          <p
            className="reveal mt-4 max-w-xl text-paper-100/70"
            style={{ "--reveal-delay": "260ms" } as CSSProperties}
          >
            From tastings to community meetups, here&rsquo;s what&rsquo;s coming up. Got an
            idea for an event? <Link href="/contact" className="underline hover:text-white">Let us know</Link>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        {events.length === 0 ? (
          <p className="text-ink-900/60">No events scheduled right now — check back soon.</p>
        ) : (
          <div className="space-y-10">
            {events.map((event, i) => (
              <EventCard
                key={event.title}
                event={event}
                notchColor="var(--color-paper-50)"
                delayMs={i * 100}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
