import type { Metadata } from "next";
import { site } from "@/data/site";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: `Contact — ${site.name}`,
  description: `Get in touch with ${site.name} — feedback, event ideas, and business opportunities welcome.`,
};

export default function ContactPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-32">
        <p className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Contact
        </p>
        <h1 className="reveal mt-4 font-display text-5xl font-semibold text-ink-950 sm:text-6xl">
          Get in touch
        </h1>
        <p className="reveal mt-4 max-w-xl text-ink-900/70">
          Feedback on your last visit, an idea for a community event, or a business
          opportunity you&rsquo;d like to bring to us — we&rsquo;d love to hear it.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 md:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delayMs={140} className="space-y-8 border-t border-ink-950/10 pt-8 md:border-t-0 md:border-l md:pl-10 md:pt-0">
          <div>
            <p className="text-sm font-semibold text-amber-700">Visit us</p>
            <p className="mt-2 text-sm text-ink-900/70">{site.address}</p>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline"
            >
              Get directions →
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700">Email</p>
            <a
              href={`mailto:${site.email}`}
              className="mt-2 block text-sm text-ink-900/70 hover:text-amber-700"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700">Phone</p>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="mt-2 block text-sm text-ink-900/70 hover:text-amber-700"
            >
              {site.phone}
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700">Hours</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-900/70">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </>
  );
}
