import Image from "next/image";
import Link from "next/link";
import CoffeeBeanIntro from "@/components/CoffeeBeanIntro";
import { getUpcomingEvents } from "@/data/events";
import { site } from "@/data/site";
import { BEANS_PER_REWARD } from "@/lib/loyalty/types";
import styles from "./cafe-home.module.css";

export default function CafeHome() {
  const events = getUpcomingEvents();

  return (
    <div className={styles.home}>
      <CoffeeBeanIntro />

      <section className={styles.opening} aria-labelledby="home-heading">
        <Image
          className={styles.heroPhoto}
          src="/home-hero.jpeg"
          alt="Teal chairs around a timber table by the café window"
          fill
          preload
          sizes="100vw"
        />
        <div className={styles.hero}>
          <div className={styles.heroTitle}>
            <p className={styles.label}>Independent neighbourhood café</p>
            <h1 id="home-heading" tabIndex={-1}>A seat at <em>Royal Wharf.</em></h1>
          </div>

          <div className={styles.heroDetails}>
            <p>Drop in for your usual, stay for a catch-up, or take the seat by the window.</p>
            <Link className={styles.action} href="/menu">View menu <span aria-hidden="true">↗</span></Link>
            <a className={styles.action} href={site.mapsUrl}>Find us <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <ul className={styles.strip} aria-label="What we serve">
        <li>Pact Bourbon Cream coffee</li>
        <li>Pastries and light bites</li>
        <li>Bar from noon</li>
      </ul>

      <section className={styles.features} aria-labelledby="counter-heading">
        <div className={styles.sectionTitle}>
          <h2 id="counter-heading">From the counter</h2>
          <svg className={styles.ring} viewBox="0 0 96 96" fill="none" aria-hidden="true">
            <path d="M88 54C84 75 66 91 45 88c-22-2-40-18-39-41C7 24 22 7 46 7c25-1 45 19 44 43l-2 4Z" strokeWidth="1.8" />
            <path d="M85 39c4 15-2 28-11 36-10 9-22 11-33 8C19 78 9 65 10 46 12 26 24 14 43 12c16-2 28 3 38 15" />
            <path d="M56 33c7 3 4 15-2 22-6 8-16 13-20 8-4-4-1-14 5-21 6-8 12-12 17-9Zm-2 2c-7 5-6 10-9 16-2 4-6 7-9 11" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.spread}>
          <article className={styles.panel}>
            <div className={styles.panelPhoto}>
              <Image src="/photo-pastries.jpg" alt="Muffins and cookies at the café counter" fill sizes="(max-width: 560px) 76vw, 300px" />
            </div>
            <h3>With your coffee</h3>
            <p>Pastries, cakes and light bites from the counter.</p>
            <Link className={styles.action} href="/menu#coffee">Coffee menu <span aria-hidden="true">↗</span></Link>
          </article>
          <article className={styles.panel}>
            <div className={styles.panelPhoto}>
              <Image src="/photo-guinness.jpg" alt="A member of the café team pouring a pint at the bar" fill sizes="(max-width: 560px) 76vw, 300px" />
            </div>
            <h3>After noon</h3>
            <p>Draught beers, bottled favourites and cocktails.</p>
            <Link className={styles.action} href="/menu#beer-and-cider">Drinks menu <span aria-hidden="true">↗</span></Link>
          </article>
        </div>
      </section>

      <section className={styles.neighbourhood} aria-labelledby="regulars-heading">
        <div>
          <p className={styles.label}>The Coffee Club</p>
          <h2 id="regulars-heading">Your tenth cup, <em>on us.</em></h2>
          <p>Collect {BEANS_PER_REWARD} beans and enjoy your next standard coffee on us.</p>
          <Link className={styles.action} href="/loyalty">Join the Coffee Club <span aria-hidden="true">↗</span></Link>
        </div>
        <nav className={styles.localLinks} aria-label="At Twenty Second Coffee">
          <Link href="/about">Our place in Royal Wharf <span aria-hidden="true">↗</span></Link>
          <Link href="/events">What’s on <span aria-hidden="true">↗</span></Link>
          <Link href="/contact">Opening hours &amp; contact <span aria-hidden="true">↗</span></Link>
        </nav>
      </section>

      {events.length > 0 && (
        <section className={styles.eventListing} aria-labelledby="home-events-heading">
          <h2 id="home-events-heading">Coming up</h2>
          <ul>
            {events.map((event) => <li key={`${event.date}-${event.title}`}><span>{event.date}</span> <strong>{event.title}</strong></li>)}
          </ul>
          <Link className={styles.action} href="/events">See all events <span aria-hidden="true">↗</span></Link>
        </section>
      )}
    </div>
  );
}
