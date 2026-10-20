import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import Reveal from "@/components/Reveal";
import { events } from "@/data/events";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Events | ${site.name}`,
  description: `Coffee mornings, tastings, pop-ups, and neighbourhood gatherings at ${site.name} in ${site.neighborhood}.`,
};

const eventTypes = [
  { eyebrow: "Meet", title: "Coffee mornings", text: "Easy-going gatherings for neighbours, regulars, and anyone new to Royal Wharf.", image: "/events-coffee.jpeg", alt: "Espresso pouring into a cup at twenty second coffee", tone: "bg-[#ded0bd]" },
  { eyebrow: "Learn", title: "Tastings & workshops", text: "Small sessions built around coffee, conversation, and learning something together.", image: "/events-workshop.jpeg", alt: "Pastries on display at twenty second coffee", tone: "bg-[#c99991]" },
  { eyebrow: "Discover", title: "Local pop-ups", text: "A welcoming space for independent makers, creative ideas, and local collaborations.", image: "/events-popup.jpeg", alt: "The bar taps at twenty second coffee", tone: "bg-[#c9b58f]" },
];

function EventDetailIcon({ type }: { type: "gather" | "local" | "stay" }) {
  if (type === "gather") {
    return (
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="17" cy="15" r="5" />
        <circle cx="32" cy="17" r="4" />
        <path d="M7 37c1-8 5-12 10-12s9 4 10 12M27 27c7-1 11 3 12 10" />
        <path d="M10 42h29" />
      </svg>
    );
  }

  if (type === "local") {
    return (
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 20h30l-3-9H12l-3 9Z" />
        <path d="M12 20v20h24V20M19 40V29h10v11" />
        <path d="M9 20c1 4 6 4 8 1 2 4 7 4 9 0 2 4 7 3 10-1" />
        <path d="M7 43h34" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="17" />
      <path d="M24 13v12l8 5" />
      <path d="M18 6h12M18 42h12" />
      <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function EventsPage() {
  const hasEvents = events.length > 0;

  return (
    <>
      <section className="relative min-h-[680px] overflow-hidden bg-ink-950 pt-[72px] text-paper-50 sm:min-h-[740px]">
        <Image src="/events-hero.jpeg" alt="A cosy reading corner inside twenty second coffee" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "50% 48%" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,12,9,0.18),rgba(16,12,9,0.24)_35%,rgba(16,12,9,0.82))]" />
        <div className="relative mx-auto flex min-h-[608px] max-w-7xl flex-col items-center justify-end px-5 pb-16 text-center sm:min-h-[668px] sm:px-8 sm:pb-20 lg:px-10">
          <p className="reveal text-[10px] font-semibold uppercase tracking-[0.3em] text-paper-50/72">Around our table</p>
          <h1 className="reveal mt-5 max-w-5xl font-display text-[clamp(4rem,9vw,8rem)] leading-[0.86] tracking-[-0.045em]">More than a coffee date.</h1>
          <p className="reveal mt-7 max-w-lg text-sm leading-7 text-paper-50/72 sm:text-base">Gatherings, ideas, and good reasons to stay for one more cup, all in the heart of Royal Wharf.</p>
          <a href="#whats-on" className="reveal mt-8 rounded-full bg-paper-50 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-950">See what&rsquo;s on</a>
        </div>
      </section>

      <section id="event-details" className="scroll-mt-20 border-b border-ink-950/15 bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-10">
          {[{ icon: "gather" as const, title: "Small gatherings", text: "Relaxed events with room to talk." }, { icon: "local" as const, title: "Local ideas", text: "Made with and for the neighbourhood." }, { icon: "stay" as const, title: "Worth staying for", text: "Good company and one more cup." }].map((item) => (
            <div key={item.title} className="grid grid-cols-[42px_1fr] gap-4 border-b border-ink-950/15 py-7 last:border-b-0 md:border-b-0 md:border-r md:px-7 md:py-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <div className="text-cherry-700"><EventDetailIcon type={item.icon} /></div>
              <div><h2 className="font-display text-2xl leading-none">{item.title}</h2><p className="mt-3 text-xs leading-5 text-ink-900/60">{item.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="whats-on" className="scroll-mt-24 bg-[#f5efe3] text-ink-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <Reveal className="grid gap-8 border-b border-ink-950/20 pb-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">Coming up</p><p className="mt-4 max-w-xs text-sm leading-6 text-ink-900/55">Dates, gatherings, and reasons to get together.</p></div>
            <h2 className="font-display text-5xl leading-[0.94] tracking-[-0.035em] sm:text-7xl lg:text-8xl">{hasEvents ? "Save yourself a seat." : "The next dates are brewing."}</h2>
          </Reveal>

          {hasEvents ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {events.map((event, index) => <EventCard key={`${event.title}-${event.date}`} event={event} notchColor="#f5efe3" delayMs={index * 90} />)}
            </div>
          ) : (
            <Reveal className="mt-10 grid border-y border-ink-950/18 py-9 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14 lg:py-12">
              <div className="max-w-2xl">
                <p className="font-display text-4xl tracking-[-0.025em] sm:text-5xl">Nothing announced just yet.</p>
                <p className="mt-5 max-w-xl text-sm leading-7 text-ink-900/62 sm:text-base">We are shaping our next round of neighbourhood gatherings. Have an idea, or want to bring something special to the space? Tell us about it.</p>
              </div>
              <Link href="/contact" className="mt-8 inline-flex rounded-full bg-ink-950 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-50 lg:mt-0">Share an idea</Link>
            </Reveal>
          )}
        </div>
      </section>

      <section id="event-types" className="scroll-mt-24 bg-paper-50 text-ink-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <Reveal className="grid gap-7 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">Made for the neighbourhood</p>
            <h2 className="font-display text-5xl leading-[0.94] tracking-[-0.035em] sm:text-7xl lg:text-8xl">What happens here?</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {eventTypes.map((type, index) => (
              <Reveal key={type.title} delayMs={index * 90} className={`overflow-hidden rounded-[1.25rem] ${type.tone}`}>
                <div className="relative aspect-[5/4] overflow-hidden"><Image src={type.image} alt={type.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.025]" /></div>
                <div className="min-h-64 p-7 sm:p-8"><p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-900/50">{type.eyebrow}</p><h3 className="mt-5 font-display text-4xl leading-[0.95]">{type.title}</h3><p className="mt-4 max-w-xs text-sm leading-6 text-ink-900/62">{type.text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 text-paper-50">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[420px] sm:min-h-[460px] lg:min-h-[680px]"><Image src="/events-host.jpeg" alt="The bar area at twenty second coffee" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" /></div>
          <div className="flex items-center px-5 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
            <Reveal><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-50/48">Bring an idea to life</p><h2 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-7xl">Something worth gathering for?</h2><p className="mt-7 max-w-lg text-sm leading-7 text-paper-50/62 sm:text-base">We love hearing from local makers, organisers, and neighbours. If you have a thoughtful idea for the community, let&rsquo;s start a conversation.</p><Link href="/contact" className="mt-8 inline-flex rounded-full bg-paper-50 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-950">Get in touch</Link></Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
