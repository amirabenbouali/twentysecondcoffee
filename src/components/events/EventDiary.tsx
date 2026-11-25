import Image from "next/image";
import Link from "next/link";
import type { CommunityEvent } from "@/data/events";
import { site } from "@/data/site";
import WorkshopPoster from "./WorkshopPoster";
import styles from "./events.module.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function EventDate({ date }: { date: string }) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const words = /^(?:[A-Za-z]+\s+)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(date);
  const year = iso?.[1] ?? words?.[3];
  const month = iso ? months[Number(iso[2]) - 1] : months.find((name) => name === words?.[2]);
  const day = Number(iso?.[3] ?? words?.[1]);

  if (!year || !month || !(day >= 1 && day <= 31)) {
    return <p className={styles.dateFallback}>{date}</p>;
  }

  const monthNumber = String(months.indexOf(month) + 1).padStart(2, "0");
  const dateTime = `${year}-${monthNumber}-${String(day).padStart(2, "0")}`;

  if (new Date(dateTime).getUTCDate() !== day) {
    return <p className={styles.dateFallback}>{date}</p>;
  }

  return (
    <time className={styles.date} dateTime={dateTime}>
      <span className={styles.srOnly}>{iso ? `${day} ${month} ${year}` : date}</span>
      <span className={styles.day} aria-hidden="true">{day}</span>
      <span className={styles.month} aria-hidden="true">{month}<span>{year}</span></span>
    </time>
  );
}

function Flyer({ src, label, size = { width: 1013, height: 1350 } }: {
  src: string;
  label: string;
  size?: CommunityEvent["flyerSize"];
}) {
  return (
    <a href={src} className={styles.flyer} aria-label={`View the flyer for ${label}`}>
      <Image src={src} alt="" width={size.width} height={size.height} sizes="(max-width: 680px) 78vw, 255px" />
    </a>
  );
}

function EventDetails({ event, sample = false }: { event: CommunityEvent; sample?: boolean }) {
  return (
    <div className={styles.eventDetails}>
      {event.time && <p><strong>{event.time}</strong></p>}
      {event.price && <p>{event.price}</p>}
      <p>{sample ? "Sample venue" : site.name}</p>
      {!sample && (event.bookingUrl ? (
        <a className={styles.booking} href={event.bookingUrl}>Book with the organiser <span aria-hidden="true">↗</span></a>
      ) : event.detailsUrl ? (
        <a className={styles.textLink} href={event.detailsUrl}>Organiser’s event details <span aria-hidden="true">↗</span></a>
      ) : (
        <Link className={styles.textLink} href="/contact">Ask about this event <span aria-hidden="true">↗</span></Link>
      ))}
    </div>
  );
}

type EventDiaryProps = {
  entries: CommunityEvent[];
  preview?: "current" | "sample";
};

export default function EventDiary({ entries, preview }: EventDiaryProps) {
  const sample = preview === "sample";
  const featured = entries.find((event) => event.bookingUrl && event.flyer);
  const groups = new Map<string, CommunityEvent[]>();
  for (const event of entries) {
    if (event === featured) continue;
    const sameDay = groups.get(event.date) ?? [];
    sameDay.push(event);
    groups.set(event.date, sameDay);
  }
  return (
    <div className={styles.diary}>
      <div className={styles.opening}>
        <section className={`${styles.frame} ${styles.masthead}`} aria-labelledby="diary-title">
          <div className={styles.folio}>
            <p>Twenty Second Coffee · Events</p>
            <p>Royal Wharf, London</p>
          </div>
          <div className={styles.titleGrid}>
            <div>
              <p className={styles.kicker}>More than coffee</p>
              <h1 id="diary-title">Good coffee.<br /><em>Better company.</em></h1>
              <a className={styles.jump} href="#whats-on">See what’s on <span aria-hidden="true">↓</span></a>
            </div>
            <svg className={styles.ring} aria-hidden="true" viewBox="0 0 132 120" fill="none">
              <path d="M108 86c-10 21-37 31-61 25C18 104 7 80 12 53 18 23 41 10 67 12c29 2 50 24 48 50-1 8-2 16-7 24Z" strokeWidth="2.2" />
              <path d="M110 53c3 18-4 36-20 47-13 9-32 11-49 4C23 96 13 79 16 57c3-23 21-38 43-41 24-3 44 9 51 29M112 40l4-8m-3 58 9-5" strokeWidth=".85" />
              <path d="M71 47c6-2 8 4 6 10-2 7-10 16-16 17-6 1-9-3-7-9 3-7 10-16 17-18Z" strokeWidth="1.6" />
              <path d="M74 49c-7 3-6 9-12 15l-5 7" strokeWidth="1.2" />
            </svg>
          </div>
        </section>
      </div>
      <div className={styles.frame}>
        <section id="whats-on" tabIndex={-1} className={styles.listings} aria-labelledby="listing-title">
          <div className={styles.listingBar}>
            <h2 id="listing-title">What’s on</h2>
            <p>{sample ? "Sample diary" : "Upcoming dates"}</p>
          </div>

          {sample && <p className={styles.sampleNotice}>Design preview only. These example dates and times are fictional.</p>}

          {featured?.flyer && (
            <article className={styles.featured}>
              <div className={styles.featureCopy}>
                <EventDate date={featured.date} />
                <div className={styles.eventCopy}>
                  <h3>{featured.title}</h3>
                  <p>{featured.description}</p>
                  {featured.organiser && <p>With {featured.organiser}</p>}
                </div>
                <EventDetails event={featured} />
                {featured.poster === "christmas-candle" && (
                  <a href={featured.flyer} className={styles.textLink}>View original flyer <span aria-hidden="true">↗</span></a>
                )}
              </div>
              {featured.poster === "christmas-candle" ? <WorkshopPoster event={featured} /> : <Flyer src={featured.flyer} label={featured.title} size={featured.flyerSize} />}
            </article>
          )}

          {entries.length ? (
            <ul className={styles.rows}>
              {[...groups].map(([date, dayEntries]) => {
                const flyerEvent = dayEntries.find((event) => event.flyer);
                return (
                  <li id={`event-${date}`} className={styles.eventRow} key={date}>
                    <EventDate date={date} />
                    <div className={styles.dayEntries}>
                      {dayEntries.map((event) => (
                        <article className={styles.dayEvent} key={event.title}>
                          <div className={styles.eventCopy}>
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            {event.organiser && <p>With {event.organiser}</p>}
                          </div>
                          <EventDetails event={event} sample={sample} />
                        </article>
                      ))}
                    </div>
                    {flyerEvent?.flyer && <Flyer src={flyerEvent.flyer} label={dayEntries.map(({ title }) => title).join(" and ")} size={flyerEvent.flyerSize} />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyCopy}>
                <h3>No dates in <em>the diary yet.</em></h3>
                <p>Drop in for your usual and a catch-up on Royal Crest Avenue.</p>
                <Link className={styles.textLink} href="/contact">Get in touch <span aria-hidden="true">↗</span></Link>
              </div>
              <figure className={styles.photo}>
                <div>
                  <Image src="/events-hero.jpeg" alt="Books and leather seats in the café’s reading corner" fill sizes="(max-width: 560px) 164px, 218px" />
                </div>
                <figcaption>Inside Twenty Second Coffee</figcaption>
              </figure>
            </div>
          )}
        </section>

        {preview && (
          <nav className={styles.previewNav} aria-label="Events preview views">
            <Link className={styles.textLink} href="/preview/events" aria-current={sample ? undefined : "page"}>Current diary</Link>
            <Link className={styles.textLink} href="/preview/events/sample" aria-current={sample ? "page" : undefined}>Sample listings</Link>
          </nav>
        )}
      </div>
    </div>
  );
}
