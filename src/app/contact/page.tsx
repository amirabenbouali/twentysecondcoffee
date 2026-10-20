import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Contact | ${site.name}`,
  description: `Get in touch with ${site.name}. Feedback, event ideas, and business opportunities are welcome.`,
};

export default function ContactPage() {
  return (
    <>
      <section className="relative min-h-[680px] overflow-hidden bg-ink-950 pt-[72px] text-paper-50 sm:min-h-[740px]">
        <Image src="/contact-storefront.jpeg" alt="The twenty second coffee storefront on Royal Crest Avenue" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "50% 45%" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,12,9,0.16),rgba(16,12,9,0.28)_35%,rgba(16,12,9,0.84))]" />
        <div className="relative mx-auto flex min-h-[608px] max-w-7xl flex-col items-center justify-end px-5 pb-16 text-center sm:min-h-[668px] sm:px-8 sm:pb-20 lg:px-10">
          <p className="reveal text-[10px] font-semibold uppercase tracking-[0.3em] text-paper-50/72">Contact · Visit · Collaborate</p>
          <h1 className="reveal mt-5 max-w-5xl font-display text-[clamp(4.5rem,10vw,9rem)] leading-[0.84] tracking-[-0.045em]">Let&rsquo;s talk.</h1>
          <p className="reveal mt-7 max-w-lg text-sm leading-7 text-paper-50/72 sm:text-base">Feedback, an event idea, a local collaboration, or simply a question. We would love to hear from you.</p>
        </div>
      </section>

      <section className="border-b border-ink-950/15 bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-10">
          <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="grid grid-cols-[42px_1fr] gap-4 border-b border-ink-950/15 py-7 md:border-b-0 md:border-r md:px-7 md:py-8 md:first:pl-0">
            <span className="font-display text-3xl text-cherry-700" aria-hidden="true">⌖</span><div><h2 className="font-display text-2xl leading-none">Visit</h2><p className="mt-3 text-xs leading-5 text-ink-900/60">Royal Wharf, London E16 2TF</p></div>
          </a>
          <a href={`mailto:${site.email}`} className="grid grid-cols-[42px_1fr] gap-4 border-b border-ink-950/15 py-7 md:border-b-0 md:border-r md:px-7 md:py-8">
            <span className="font-display text-3xl text-cherry-700" aria-hidden="true">✉</span><div><h2 className="font-display text-2xl leading-none">Email</h2><p className="mt-3 text-xs leading-5 text-ink-900/60">{site.email}</p></div>
          </a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="grid grid-cols-[42px_1fr] gap-4 py-7 md:px-7 md:py-8 md:last:pr-0">
            <span className="font-display text-3xl text-cherry-700" aria-hidden="true">☏</span><div><h2 className="font-display text-2xl leading-none">Call</h2><p className="mt-3 text-xs leading-5 text-ink-900/60">{site.phone}</p></div>
          </a>
        </div>
      </section>

      <section className="bg-[#f5efe3] text-ink-950">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:px-10 lg:py-28">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">Find us</p>
            <h2 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-7xl">Right in the heart of Royal Wharf.</h2>
            <div className="mt-10 divide-y divide-ink-950/15 border-y border-ink-950/15">
              <div className="grid grid-cols-[82px_1fr] gap-5 py-6 text-sm"><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-900/42">Visit</p><div><p className="leading-6 text-ink-900/68">{site.address}</p><a href={site.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block border-b border-ink-950 text-xs font-semibold">Get directions ↗</a></div></div>
              <div className="grid grid-cols-[82px_1fr] gap-5 py-6 text-sm"><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-900/42">Hours</p><ul className="space-y-2 text-ink-900/68">{site.hours.map((hours) => <li key={hours.day} className="flex justify-between gap-5"><span>{hours.day}</span><span className="text-right">{hours.time}</span></li>)}</ul></div>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="border-t border-ink-950/25 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">Send a message</p>
              <h2 className="mt-5 font-display text-5xl leading-[0.94] tracking-[-0.035em] sm:text-6xl">What&rsquo;s on your mind?</h2>
              <p className="mt-5 max-w-lg text-sm leading-6 text-ink-900/58">Fill in the form and the team will get back to you as soon as possible.</p>
              <div className="mt-10"><ContactForm /></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink-950 px-5 py-20 text-center text-paper-50 sm:px-8 sm:py-24">
        <Reveal className="mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-50/48">Prefer to drop in?</p>
          <h2 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-8xl">Coffee is always a good place to start.</h2>
          <p className="mt-7 text-sm text-paper-50/55">Open seven days a week.</p>
        </Reveal>
      </section>
    </>
  );
}
