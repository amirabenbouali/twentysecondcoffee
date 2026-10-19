import Image from "next/image";
import Link from "next/link";
import CoffeeBeanIntro from "@/components/CoffeeBeanIntro";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";

const reasons = [
  {
    title: "Thoughtfully made",
    text: "Freshly roasted Pact coffee, carefully prepared from the first cup to the last.",
  },
  {
    title: "Proudly local",
    text: "Independent, familiar, and made for the people who call Royal Wharf home.",
  },
  {
    title: "Here all day",
    text: "Coffee and pastries in the morning; light bites, beer, and good company later on.",
  },
];

const moments = [
  {
    eyebrow: "First cup",
    title: "Coffee, your way.",
    text: "Our house Bourbon Cream blend, available regular or decaf.",
    image: "/photo-espresso.jpg",
    tone: "bg-[#ded0bd]",
  },
  {
    eyebrow: "Something to eat",
    title: "A reason to stay.",
    text: "Pastries, cakes, and convenient light bites from the counter.",
    image: "/photo-pastries.jpg",
    tone: "bg-[#c99991]",
  },
  {
    eyebrow: "From midday",
    title: "One more round.",
    text: "Draught beer, bottled favourites, and a slower pace into the evening.",
    image: "/photo-guinness.jpg",
    tone: "bg-[#c9b58f]",
  },
];

function FeatureIcon({ type }: { type: "cup" | "shop" | "day" }) {
  if (type === "cup") {
    return (
      <svg aria-hidden="true" viewBox="0 0 48 56" className="h-12 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 25h24v10c0 7-5 12-12 12s-12-5-12-12V25Z" />
        <path d="M35 29h3.5a5.5 5.5 0 0 1 0 11H35M8 50h31" />
        <path d="M17 19c-4-4 4-6 0-11M25 19c-4-4 4-6 0-11" />
        <circle cx="38.5" cy="12.5" r="3.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "shop") {
    return (
      <svg aria-hidden="true" viewBox="0 0 48 56" className="h-12 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h32l-3-10H11L8 22Z" />
        <path d="M11 22v25h26V22M18 47V33h12v14" />
        <path d="M8 22c0 4 6 5 8 1 2 4 8 4 10 0 2 4 8 3 10-1 1 3 4 3 4 0" />
        <path d="M5 50h38M16 8h16" />
        <circle cx="26" cy="39" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 48 56" className="h-12 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 35h24v8c0 5-4 9-12 9S8 48 8 43v-8Z" />
      <path d="M32 38h3a4.5 4.5 0 0 1 0 9h-4M5 53h34" />
      <path d="M28 22a9 9 0 1 1-2-17 10 10 0 0 0 2 17Z" />
      <path d="M11 28c-3-3 3-5 0-8M18 28c-3-3 3-5 0-8" />
      <path d="M38 10v5M35.5 12.5h5" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <CoffeeBeanIntro />
      <section className="relative min-h-[700px] overflow-hidden bg-ink-950 text-paper-50 sm:min-h-[780px]">
        <Image
          src="/home-hero.jpeg"
          alt="A quiet seating corner inside 22nd Coffee"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 54%" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,12,9,0.3),rgba(16,12,9,0.22)_35%,rgba(16,12,9,0.76))]" />

        <div className="relative mx-auto flex min-h-[700px] max-w-7xl flex-col items-center justify-end px-5 pb-16 pt-32 text-center sm:min-h-[780px] sm:px-8 sm:pb-20 lg:px-10">
          <p className="reveal text-[10px] font-semibold uppercase tracking-[0.3em] text-paper-50/80">
            Independent coffee · Royal Wharf
          </p>
          <h1 className="reveal mt-5 max-w-4xl font-display text-[clamp(4rem,9vw,8rem)] leading-[0.86] tracking-[-0.045em]">
            Coffee for your<br />kind of day.
          </h1>
          <p className="reveal mt-7 max-w-md text-sm leading-6 text-paper-50/78 sm:text-base">
            Carefully made coffee, familiar faces, and a place that feels easy from morning to evening.
          </p>
          <div className="reveal mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/menu" className="rounded-full bg-paper-50 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-950 transition-transform hover:-translate-y-0.5">
              Explore the menu
            </Link>
            <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-paper-50/65 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-950">
              Find the shop
            </a>
          </div>
        </div>
      </section>

      <section id="why-22nd" className="scroll-mt-20 border-b border-ink-950/15 bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-3 lg:px-10">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="grid grid-cols-[48px_1fr] gap-4 border-b border-ink-950/15 py-7 last:border-b-0 md:border-b-0 md:border-r md:px-7 md:py-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <div className="text-cherry-700">
                <FeatureIcon type={(["cup", "shop", "day"] as const)[index]} />
              </div>
              <div>
                <h2 className="font-display text-2xl leading-none">{reason.title}</h2>
                <p className="mt-3 max-w-xs text-xs leading-5 text-ink-900/60">{reason.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f5efe3] text-ink-950">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <Reveal className="grid gap-7 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">From the counter</p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-ink-900/60">A short menu, built around the things people come back for.</p>
            </div>
            <h2 className="max-w-3xl font-display text-5xl leading-[0.94] tracking-[-0.035em] sm:text-7xl lg:text-8xl">
              Your favourites,<br /><span className="italic">all day long.</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {moments.map((moment, index) => (
              <Reveal key={moment.title} delayMs={index * 90} className={`overflow-hidden rounded-[1.25rem] ${moment.tone}`}>
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={moment.image}
                    alt={moment.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                  />
                </div>
                <div className="flex min-h-64 flex-col p-7 sm:p-8">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-900/55">{moment.eyebrow}</p>
                  <h3 className="mt-5 font-display text-4xl leading-[0.95] tracking-[-0.025em]">{moment.title}</h3>
                  <p className="mt-4 max-w-xs text-sm leading-6 text-ink-900/65">{moment.text}</p>
                  <Link href="/menu" aria-label={`View ${moment.title} on the menu`} className="mt-auto flex h-10 w-10 items-center justify-center self-end rounded-full border border-ink-950/50 text-lg transition-colors hover:bg-ink-950 hover:text-paper-50">→</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper-50 text-ink-950">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <Reveal className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[760px]">
            <Image src="/photo-hero.jpg" alt="Inside 22nd Coffee in Royal Wharf" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <div className="flex items-center px-5 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
            <Reveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cherry-700">Our place</p>
              <h2 className="mt-6 max-w-xl font-display text-5xl leading-[0.92] tracking-[-0.035em] sm:text-7xl">
                Globally sourced.<br /><span className="italic">Locally known.</span>
              </h2>
              <p className="mt-7 max-w-md text-sm leading-7 text-ink-900/65 sm:text-base">
                Our coffee is roasted by Pact and made here in Royal Wharf. The rest is simple: a warm welcome, good food, and enough room to settle in.
              </p>
              <Link href="/about" className="mt-8 inline-flex items-center gap-3 border-b border-ink-950 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Read our story <span>↗</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink-950 text-paper-50">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="flex items-center px-5 py-20 sm:px-8 lg:px-10 lg:py-28 xl:pr-20">
            <Reveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-50/55">Come and see us</p>
              <h2 className="mt-6 font-display text-6xl leading-[0.9] tracking-[-0.04em] sm:text-8xl">Your table is waiting.</h2>
              <p className="mt-7 max-w-sm text-sm leading-7 text-paper-50/65">{site.address}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full bg-paper-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-950">Get directions</a>
                <Link href="/contact" className="rounded-full border border-paper-50/50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em]">Contact us</Link>
              </div>
            </Reveal>
          </div>
          <Reveal className="relative min-h-[440px] sm:min-h-[500px] lg:min-h-[680px]">
            <Image src="/photo-storefront.jpg" alt="The 22nd Coffee storefront" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
