import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/data/site";

export default function Footer() {
  return (
    <footer id="site-footer" className="scroll-mt-20 mt-auto bg-[#171310] text-paper-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 border-b border-paper-50/15 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:py-24">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-50/50">
              Coffee, food & good company
            </p>
            <p className="mt-5 max-w-4xl font-display text-6xl leading-[0.88] tracking-[-0.045em] sm:text-8xl lg:text-[7.5rem]">
              See you at 22nd.
            </p>
          </div>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-5 rounded-full border border-paper-50/45 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-paper-50 hover:text-ink-950"
          >
            Get directions <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="grid gap-12 border-b border-paper-50/15 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr] lg:gap-10 lg:py-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label={`${site.name} home`}>
              <Image src="/logo-light-small.png" alt="" width={38} height={38} className="h-9 w-9 object-contain" />
              <span className="font-display text-3xl tracking-[-0.03em]">{site.name}</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-paper-50/50">{site.tagline}. Made for mornings, afternoons, and everything in between.</p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-paper-50/40">Visit</p>
            <p className="mt-5 max-w-[15rem] text-sm leading-6 text-paper-50/72">{site.address}</p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-paper-50/40">Opening hours</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-paper-50/72">
              {site.hours.map((hours) => (
                <li key={hours.day}>
                  <span className="block text-paper-50">{hours.day}</span>
                  <span>{hours.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-paper-50/40">Say hello</p>
            <div className="mt-5 space-y-3 text-sm text-paper-50/72">
              <a href={`mailto:${site.email}`} className="block transition-colors hover:text-paper-50">{site.email}</a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="block transition-colors hover:text-paper-50">{site.phone}</a>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-paper-50/30 pb-1 transition-colors hover:border-paper-50 hover:text-paper-50">
                Instagram <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-7 py-7 text-[10px] uppercase tracking-[0.14em] text-paper-50/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-paper-50">
                {item.label}
              </Link>
            ))}
          </nav>
          <p>Royal Wharf · London</p>
        </div>
      </div>
    </footer>
  );
}
