import { publicPageMetadata } from "@/lib/seo";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site";
import styles from "./contact.module.css";

export const metadata = publicPageMetadata("/contact");

function DirectionsLink({ className }: { className: string }) {
  return (
    <a href={site.mapsUrl} className={className}>
      Get directions <span aria-hidden="true">↗</span>
    </a>
  );
}

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { topic } = await searchParams;
  const initialTopic = topic === "privacy" ? "privacy" : "feedback";

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <div className={styles.frame}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Contact <span aria-hidden="true">·</span> Royal Wharf</p>
              <h1 id="contact-title">Come <em>on in.</em></h1>
              <p>Drop by for a coffee or send us a note. You’ll find us on Royal Crest Avenue.</p>
            </div>
            <figure className={styles.heroPhoto}>
              <div className={styles.storefront}>
                <Image
                  src="/contact-storefront.jpeg"
                  alt="Street view of the Twenty Second Coffee entrance"
                  fill
                  preload
                  sizes="(max-width: 719px) 94vw, (max-width: 1260px) 62vw, 760px"
                />
              </div>
              <figcaption>Outside Twenty Second Coffee</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <div className={`${styles.frame} ${styles.enquiries}`}>
        <section className={styles.visit} aria-labelledby="visit-title">
          <h2 id="visit-title">Find us.</h2>
          <div className={styles.details}>
            <div className={styles.detail}>
              <h3>Address</h3>
              <div>
                <address>{site.address}</address>
                <DirectionsLink className={styles.directionLink} />
              </div>
            </div>
            <div className={styles.detail}>
              <h3>Hours</h3>
              <dl className={styles.hours}>
                {site.hours.map(({ day, time }) => (
                  <div key={day}>
                    <dt>{day}</dt>
                    <dd>{time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.detail}>
              <h3>Phone</h3>
              <a className={styles.detailLink} href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            </div>
            {site.email && (
              <div className={styles.detail}>
                <h3>Email</h3>
                <a className={styles.detailLink} href={`mailto:${site.email}`}>{site.email}</a>
              </div>
            )}
            {site.instagram && (
              <div className={styles.detail}>
                <h3>Social</h3>
                <a className={styles.detailLink} href={site.instagram}>Instagram</a>
              </div>
            )}
          </div>
        </section>

        <section className={styles.letter} aria-labelledby="message-title">
          <Image className={styles.stamp} src="/logo-small.png" width={60} height={60} alt="" />
          <h2 id="message-title">Write to us.</h2>
          <p className={styles.formIntro}>A question, a suggestion or just a hello.</p>
          <ContactForm fallbackEmail={site.email} initialTopic={initialTopic} subjectLabel="Subject" />
        </section>
      </div>

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.closingPhoto}>
          <Image
            src="/about-interior.jpeg"
            alt=""
            fill
            sizes="(max-width: 719px) 100vw, 60vw"
          />
        </div>
        <div className={styles.closingCopy}>
          <h2 id="closing-title">Your seat’s <em>waiting.</em></h2>
          <DirectionsLink className={styles.closingLink} />
        </div>
      </section>
    </div>
  );
}
