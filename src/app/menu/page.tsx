import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { site } from "@/data/site";
import { menu } from "@/data/menu";
import CoffeeRing from "@/components/CoffeeRing";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: `Menu — ${site.name}`,
  description: `Coffee, tea, and food available at ${site.name} in ${site.neighborhood}.`,
};

export default function MenuPage() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-espresso-950 text-paper-50">
        <CoffeeRing
          seed={5}
          delayMs={200}
          className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 opacity-40"
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-28">
          <p className="reveal text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Menu
          </p>
          <h1
            className="reveal mt-4 font-display text-4xl font-semibold sm:text-5xl"
            style={{ "--reveal-delay": "140ms" } as CSSProperties}
          >
            What we&rsquo;re pouring
          </h1>
          <p
            className="reveal mt-4 max-w-xl text-paper-100/70"
            style={{ "--reveal-delay": "260ms" } as CSSProperties}
          >
            Our menu changes as our baristas dream up new drinks — check back often. Prices
            below are indicative and may vary in-store.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-14">
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
