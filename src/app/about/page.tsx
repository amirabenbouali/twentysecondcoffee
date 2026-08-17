import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { site } from "@/data/site";
import CoffeeRing from "@/components/CoffeeRing";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: `About — ${site.name}`,
  description: `The story behind ${site.name}, a community coffee shop in ${site.neighborhood}.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-espresso-950 text-paper-50">
        <CoffeeRing
          seed={2}
          delayMs={200}
          className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 opacity-40"
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-28">
          <p className="reveal text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            About us
          </p>
          <h1
            className="reveal mt-4 font-display text-4xl font-semibold sm:text-5xl"
            style={{ "--reveal-delay": "140ms" } as CSSProperties}
          >
            Our story
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal className="space-y-6 text-ink-900/80">
          <p>
            {site.name} opened its doors in {site.neighborhood} with a simple idea: a
            coffee shop should feel like part of the neighbourhood, not just a place you
            pass through. We wanted somewhere locals could rely on for a genuinely good
            coffee and a familiar, friendly welcome.
          </p>
          <p>
            Royal Wharf is a young, growing community, and we&rsquo;ve tried to grow
            alongside it — getting to know our regulars, supporting local events, and
            giving neighbours a reason to bump into each other. Every cup we serve is
            about more than the coffee itself.
          </p>
          <p>
            We&rsquo;re always looking for ways to do more for the community around
            us — whether that&rsquo;s hosting a local market, running a free workshop, or
            simply keeping the lights on a little later for a evening catch-up. If you
            have an idea, we&rsquo;d love to hear it.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          <Reveal delayMs={0} className="flex flex-col items-center text-center">
            <div className="flex aspect-square w-28 -rotate-3 items-center justify-center rounded-full border-2 border-dashed border-amber-600/50 bg-amber-100">
              <p className="font-display text-lg font-semibold uppercase tracking-wide text-amber-700">
                Local
              </p>
            </div>
            <p className="mt-4 text-sm text-ink-900/70">
              Proudly independent and rooted in Royal Wharf.
            </p>
          </Reveal>
          <Reveal delayMs={100} className="flex flex-col items-center text-center">
            <div className="flex aspect-square w-28 rotate-2 items-center justify-center rounded-full border-2 border-dashed border-amber-600/50 bg-amber-100">
              <p className="font-display text-base font-semibold uppercase tracking-wide text-amber-700">
                Welcoming
              </p>
            </div>
            <p className="mt-4 text-sm text-ink-900/70">
              A place for regulars, newcomers, and everyone in between.
            </p>
          </Reveal>
          <Reveal delayMs={200} className="flex flex-col items-center text-center">
            <div className="flex aspect-square w-28 -rotate-2 items-center justify-center rounded-full border-2 border-dashed border-amber-600/50 bg-amber-100">
              <p className="font-display text-sm font-semibold uppercase leading-tight tracking-wide text-amber-700">
                Community
                <br />
                first
              </p>
            </div>
            <p className="mt-4 text-sm text-ink-900/70">
              Events, collaborations, and open ears — always.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
