import type { CommunityEvent } from "@/data/events";
import styles from "./workshop-poster.module.css";

const posterDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/London",
});

export default function WorkshopPoster({ event }: { event: CommunityEvent }) {
  return (
    <figure className={styles.poster}>
      <p className={styles.organiser}>{event.organiser}</p>
      <div className={styles.art} aria-hidden="true">
        <span className={styles.sparkOne}>✦</span>
        <span className={styles.sparkTwo}>✦</span>
        <span className={styles.candle}><span className={styles.flame} /><span className={styles.label} /></span>
        <span className={styles.envelope}><span className={styles.seal} /></span>
      </div>
      <p className={styles.title}>Personalise your candle this <em>Christmas</em></p>
      <p className={styles.subtitle}>A candle-making workshop with a note hidden inside the wax.</p>
      <figcaption className={styles.details}>
        <p><time dateTime={event.date}>{posterDate.format(new Date(event.date))}</time><br />{event.time}</p>
        <p>Twenty Second Coffee<br />Royal Wharf, London</p>
        {event.price && <p className={styles.price}>{event.price}</p>}
      </figcaption>
    </figure>
  );
}
