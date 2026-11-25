import Image from "next/image";
import Link from "next/link";
import CoffeeBeanIntro from "@/components/CoffeeBeanIntro";
import { getUpcomingEvents } from "@/data/events";
import { BEANS_PER_REWARD } from "@/lib/loyalty/types";
import HeroWordmark from "./HeroWordmark";
import styles from "./hero.module.css";
import { site } from "@/data/site";

function HeroActions() {
  return (
    <div className={styles.actions}>
      <Link className={styles.primary} href="/menu">View Menu <span aria-hidden="true">↗</span></Link>
      <a className={styles.secondary} href={site.mapsUrl}>Find Us <span aria-hidden="true">↗</span></a>
    </div>
  );
}

export default function EditorialHome({ concept = "a", preview = false }: { concept?: "a" | "b"; preview?: boolean }) {
  const experimental = concept === "b";

  const events = getUpcomingEvents();

  return (
    <div className={`${styles.preview} ${experimental ? styles.experimentalPage : ""}`}>
      <CoffeeBeanIntro preview={preview} />
      {preview && <nav className={styles.switcher} aria-label="Homepage concepts">
        <a className={styles.replayOpening} href={`/preview/hero/${concept}?intro`}>Replay opening</a>
        <Link href="/preview/hero/a" aria-current={experimental ? undefined : "page"}>A · Refined</Link>
        <Link href="/preview/hero/b" aria-current={experimental ? "page" : undefined}>B · Experimental</Link>
      </nav>}

      {experimental ? (
        <section className={styles.experimental} aria-labelledby="home-heading">
          <div className={styles.edition}>
            <span>Royal Wharf, London</span>
            <Image src="/logo-small.png" alt="" width={60} height={44} />
          </div>
          <HeroWordmark experimental />
          <div className={styles.experimentalBody}>
            <div className={styles.experimentalCopy}>
              <p>Good coffee. A familiar face.<br />A seat whenever you need one.</p>
              <HeroActions />
            </div>
            <figure className={styles.counter}>
              <div className={styles.counterPhoto}>
                <Image src="/about-counter.jpeg" alt="A member of the café team behind the counter at Royal Wharf" fill sizes="(max-width: 680px) 92vw, (max-width: 1000px) 62vw, 56vw" preload />
              </div>
              <figcaption>Behind the counter, Royal Wharf</figcaption>
            </figure>
            <figure className={styles.espresso}>
              <Image src="/photo-espresso.jpg" alt="Espresso pouring into an enamel mug" fill sizes="(max-width: 680px) 28vw, 16vw" />
            </figure>
          </div>
        </section>
      ) : (
        <section className={styles.refined} aria-labelledby="home-heading">
          <div className={styles.refinedCopy}>
            <p className={styles.label}>Independent coffee · Royal Wharf</p>
            <HeroWordmark />
            <p className={styles.description}>Good coffee and a seat by the window.</p>
            <HeroActions />
          </div>
          <figure className={styles.window}>
            <div className={styles.windowPhoto}>
              <Image src="/home-hero.jpeg" alt="Teal chairs and a small timber table beside the café window" fill sizes="(max-width: 680px) 94vw, 55vw" preload />
            </div>
            <figcaption>The window seats at Twenty Second</figcaption>
          </figure>
        </section>
      )}

      <section className={experimental ? styles.darkContinuation : styles.continuation} aria-labelledby="counter-heading">
        <div className={styles.continuationInner}>
          <div>
            <h2 id="counter-heading">From the counter</h2>
            <p>Our house Bourbon Cream espresso, pastries from the counter, and a slower pace into the evening.</p>
            <Link className={styles.secondary} href="/menu">Explore the menu <span aria-hidden="true">↗</span></Link>
          </div>
          <div className={styles.pastries}>
            <Image src="/photo-pastries.jpg" alt="Muffins and cookies in the café display" fill sizes="(max-width: 680px) 90vw, 42vw" />
          </div>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="neighbourhood-heading">
        <div className={styles.storyLead}>
          <p className={styles.label}>Our corner of Royal Wharf</p>
          <h2 id="neighbourhood-heading">A place in <span>your day.</span></h2>
        </div>
        <figure className={styles.room}>
          <div className={styles.roomPhoto}>
            <Image src="/photo-hero.jpg" alt="The café seating area, with bookshelves and timber tables" fill sizes="(max-width: 680px) 92vw, 60vw" />
          </div>
          <figcaption>Inside Twenty Second Coffee</figcaption>
        </figure>
        <div className={styles.storyNote}>
          <p>Drop by for your usual, stay for a catch-up, or take the seat by the window. We’re an independent café on Royal Crest Avenue.</p>
          <Link className={styles.secondary} href="/about">About the café <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className={styles.regulars} aria-labelledby="regulars-heading">
        <div className={styles.regularsInner}>
          <div>
            <h2 id="regulars-heading">Your tenth cup, on us.</h2>
            <p>Collect {BEANS_PER_REWARD} beans and enjoy your next standard coffee on us.</p>
            <Link className={styles.secondary} href="/loyalty">Join the Coffee Club <span aria-hidden="true">↗</span></Link>
          </div>
          <div className={styles.stampStrip} aria-hidden="true">
            <span>Twenty Second Rewards</span>
            <span className={styles.stamps}>
              {Array.from({ length: BEANS_PER_REWARD }, (_, index) => <i key={index} />)}
            </span>
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section className={styles.eventListing} aria-labelledby="events-heading">
          <h2 id="events-heading">What’s on</h2>
          <ul>
            {events.map((event) => <li key={`${event.title}-${event.date}`}><span>{event.date}</span> <strong>{event.title}</strong></li>)}
          </ul>
          <Link className={styles.secondary} href="/events">See all events <span aria-hidden="true">↗</span></Link>
        </section>
      )}

      <section className={styles.visit} aria-labelledby="visit-heading">
        <div className={styles.visitInner}>
          <div className={styles.frontDoor}>
            <Image src="/photo-storefront.jpg" alt="The Twenty Second Coffee entrance on Royal Crest Avenue" fill sizes="(max-width: 680px) 92vw, 55vw" />
          </div>
          <div className={styles.visitDetails}>
            <Image className={styles.visitMark} src="/logo-light-small.png" alt="" width={78} height={58} />
            <h2 id="visit-heading">See you at<br />twenty second.</h2>
            <p>{site.address}</p>
            <dl>
              {site.hours.map(({ day, time }) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}
            </dl>
            <div className={styles.actions}>
              <a className={styles.secondary} href={site.mapsUrl}>Get directions <span aria-hidden="true">↗</span></a>
              <Link className={styles.secondary} href="/contact">Get in touch <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
