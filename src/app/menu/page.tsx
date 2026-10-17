import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { menu } from "@/data/menu";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Menu — ${site.name}`,
  description: `Coffee, tea, and drinks available at ${site.name} in ${site.neighborhood}.`,
};

function sectionId(title: string) {
  return title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function MenuPage() {
  return (
    <>
      <section className="relative min-h-[720px] overflow-hidden bg-ink-950 pt-[72px] text-paper-50">
        <Image src="/menu-drinks.jpeg" alt="A draught drink being poured behind the bar at 22nd Coffee" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "50% 40%" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,12,9,0.2),rgba(16,12,9,0.2)_30%,rgba(16,12,9,0.82))]" />
        <div className="relative mx-auto flex min-h-[648px] max-w-7xl flex-col items-center justify-end px-5 pb-20 text-center sm:px-8 sm:pb-24 lg:px-10">
          <p className="reveal text-[10px] font-semibold uppercase tracking-[0.3em] text-paper-50/72">Coffee · Tea · Bar</p>
          <h1 className="reveal mt-5 max-w-5xl font-display text-[clamp(4rem,9vw,8rem)] leading-[0.86] tracking-[-0.045em]">What are you having?</h1>
          <p className="reveal mt-7 max-w-lg text-sm leading-7 text-paper-50/72 sm:text-base">Coffee and tea all day, iced favourites, and something stronger from midday. Stay awhile or take it with you.</p>
          <a href="#menu-list" className="reveal mt-8 rounded-full bg-paper-50 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-950">View the menu</a>
        </div>
      </section>

      <section className="border-b border-ink-950/15 bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 text-xs sm:grid-cols-3 sm:px-8 lg:px-10">
          <p><span className="mr-2 font-display text-xl text-cherry-700">☕</span><span className="mr-2 font-semibold uppercase tracking-[0.16em]">Coffee</span>Pact Bourbon Cream</p>
          <p className="sm:text-center"><span className="mr-2 font-display text-xl text-cherry-700">♨</span><span className="mr-2 font-semibold uppercase tracking-[0.16em]">Tea</span>Classic + speciality</p>
          <p className="sm:text-right"><span className="mr-2 font-display text-xl text-cherry-700">✦</span><span className="mr-2 font-semibold uppercase tracking-[0.16em]">Bar</span>From 12pm</p>
        </div>
      </section>

      <nav className="sticky top-[72px] z-30 overflow-x-auto border-b border-ink-950/12 bg-[#f5efe3]/95 backdrop-blur-lg" aria-label="Menu categories">
        <div className="mx-auto flex w-max min-w-full max-w-7xl gap-2 px-5 py-3 sm:px-8 lg:px-10">
          {menu.map((section) => (
            <a
              key={section.title}
              href={`#${sectionId(section.title)}`}
              className="whitespace-nowrap rounded-full border border-ink-950/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-950 transition-colors hover:border-ink-950 hover:bg-ink-950 hover:text-paper-50"
            >
              {section.title}
            </a>
          ))}
        </div>
      </nav>

      <section id="menu-list" className="scroll-mt-36 bg-[#f5efe3] text-ink-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid items-start gap-x-16 gap-y-20 lg:grid-cols-2">
            {menu.map((section, index) => {
              const featured = section.title === "Coffee" || section.title === "Frappes";

              return (
                <Reveal
                  key={section.title}
                  delayMs={(index % 2) * 80}
                  className={featured ? "lg:col-span-2" : ""}
                >
                  <article id={sectionId(section.title)} className="scroll-mt-40 border-t border-ink-950/35 pt-5">
                    <header className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-900/40">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h2 className="mt-2 font-display text-5xl tracking-[-0.035em] text-ink-950 sm:text-6xl">
                          {section.title}
                        </h2>
                      </div>
                      {section.sharedPrice && (
                        <p className="rounded-full border border-ink-950/25 px-4 py-2 text-xs font-semibold text-ink-950">
                          {section.sharedPrice} each
                        </p>
                      )}
                    </header>

                    {section.description && (
                      <p className="mt-4 max-w-xl text-xs font-medium uppercase leading-5 tracking-[0.12em] text-ink-900/55">
                        {section.description}
                      </p>
                    )}

                    <ul className={`mt-7 grid gap-x-12 ${featured ? "sm:grid-cols-2" : ""}`}>
                      {section.items.map((item) => (
                        <li key={item.name} className="flex items-start justify-between gap-5 border-b border-ink-950/12 py-4 first:pt-0">
                          <div className="min-w-0">
                            <h3 className="font-display text-xl font-medium text-ink-950">{item.name}</h3>
                            {item.description && <p className="mt-1 text-xs leading-5 text-ink-900/55">{item.description}</p>}
                          </div>

                          {!section.sharedPrice && (
                            <div className="shrink-0 text-right text-xs font-semibold text-ink-950">
                              {item.sizes ? (
                                <div className="space-y-1">
                                  {item.sizes.map((size) => (
                                    <p key={size.label}>
                                      <span className="mr-2 text-[9px] font-medium uppercase tracking-[0.12em] text-ink-900/40">{size.label}</span>
                                      {size.price}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                item.price
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 text-paper-50">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative min-h-[460px] lg:min-h-[650px]">
            <Image
              src="/menu-pastries.jpeg"
              alt="Muffins and cookies on the counter at 22nd Coffee"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <Reveal className="flex flex-col justify-center px-5 py-20 sm:px-12 lg:px-16 xl:px-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-50/50">A note from us</p>
            <h2 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-7xl">See something you like?</h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-paper-50/65">
              Our selection changes with the seasons, so ask the team about dietary
              options, current specials, and anything new we are pouring.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full bg-paper-50 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-950">Get directions</a>
              <Link href="/contact" className="rounded-full border border-paper-50/35 px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.14em]">Ask us a question</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
