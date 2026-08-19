import type { Metadata } from "next";
import { site } from "@/data/site";
import { menu } from "@/data/menu";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: `Menu — ${site.name}`,
  description: `Coffee, tea, and drinks available at ${site.name} in ${site.neighborhood}.`,
};

export default function MenuPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-32">
        <p className="reveal text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Menu
        </p>
        <h1 className="reveal mt-4 font-display text-5xl font-semibold text-ink-950 sm:text-6xl">
          What we&rsquo;re pouring
        </h1>
        <p className="reveal mt-4 max-w-xl text-ink-900/70">
          Straight off our menu board — check back often, and prices may vary in-store.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
          {menu.map((section, i) => (
            <Reveal key={section.title} delayMs={i * 60}>
              <div className="border-b-2 border-ink-950 pb-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-sans text-lg font-bold uppercase tracking-[0.12em] text-ink-950">
                    {section.title}
                  </h2>
                  {section.sharedPrice && (
                    <p className="whitespace-nowrap text-sm font-bold text-amber-700">
                      {section.sharedPrice} each
                    </p>
                  )}
                </div>
                {section.description && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {section.description}
                  </p>
                )}
              </div>

              <ul className="divide-y divide-ink-950/10">
                {section.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4"
                  >
                    <div>
                      <p className="font-display text-lg italic text-ink-950">{item.name}</p>
                      {item.description && (
                        <p className="mt-1 text-sm text-ink-900/60">{item.description}</p>
                      )}
                    </div>

                    {!section.sharedPrice &&
                      (item.sizes ? (
                        <p className="whitespace-nowrap text-sm font-semibold text-amber-700">
                          {item.sizes.map((s, idx) => (
                            <span key={s.label}>
                              {idx > 0 && <span className="mx-1.5 text-ink-950/20">·</span>}
                              <span className="text-[10px] font-normal uppercase text-ink-900/40">
                                {s.label}{" "}
                              </span>
                              {s.price}
                            </span>
                          ))}
                        </p>
                      ) : (
                        item.price && (
                          <p className="whitespace-nowrap font-semibold text-amber-700">
                            {item.price}
                          </p>
                        )
                      ))}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
