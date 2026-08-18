import type { Metadata } from "next";
import { site } from "@/data/site";
import { menu } from "@/data/menu";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: `Menu — ${site.name}`,
  description: `Coffee, tea, and food available at ${site.name} in ${site.neighborhood}.`,
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
          Our menu changes as our baristas dream up new drinks — check back often. Prices
          below are indicative and may vary in-store.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
          {menu.map((section, i) => (
            <Reveal key={section.title} delayMs={i * 80}>
              <h2 className="font-display text-2xl font-semibold text-ink-950">
                {section.title}
              </h2>
              <ul className="mt-6 divide-y divide-ink-950/10">
                {section.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline justify-between gap-6 py-4"
                  >
                    <div>
                      <p className="font-medium text-ink-950">{item.name}</p>
                      {item.description && (
                        <p className="mt-1 text-sm text-ink-900/60">{item.description}</p>
                      )}
                    </div>
                    <p className="whitespace-nowrap font-semibold text-amber-700">
                      {item.price}
                    </p>
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
