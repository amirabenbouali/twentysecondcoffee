import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import styles from "./about.module.css";

const details = [
  {
    src: "/events-host.jpeg",
    alt: "The brass Guinness harp and glassware at the café bar",
    caption: "At the bar",
    style: styles.bar,
  },
  {
    src: "/menu-pastries.jpeg",
    alt: "Ceramic plates beside the café’s muffin and cookie display",
    caption: "From the pastry counter",
    style: styles.pastries,
  },
];

function MugCutout() {
  return (
    <svg className={styles.mug} viewBox="28 19 349 323" role="img" aria-label="The café’s yellow enamel espresso mug">
      <defs>
        <filter id="about-mug-detail" filterUnits="userSpaceOnUse" x="28" y="19" width="349" height="323" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.75" result="softened" />
          <feComposite in="SourceGraphic" in2="softened" operator="arithmetic" k2="1.65" k3="-0.65" />
        </filter>
        <clipPath id="about-mug-outline">
          {/* The opening follows the inside of the handle without cutting into the mug wall. */}
          <path
            clipRule="evenodd"
            d="M39 58C40 45 79 31 120 27C173 21 242 23 283 30C308 34 329 43 329 56C330 66 319 72 313 76L311 107C339 105 353 122 360 155C368 185 365 223 358 250C345 285 314 298 285 307C263 320 223 327 174 329C118 331 83 327 66 314C57 307 53 283 52 256L49 105C48 93 48 80 45 71C41 68 37 62 39 58ZM307 155C317 166 321 187 318 211C316 233 308 255 295 269C301 250 304 229 306 209C307 186 308 168 307 155Z"
          />
        </clipPath>
      </defs>
      <g clipPath="url(#about-mug-outline)">
        <image href="/events-coffee.jpeg" x="-490" y="-958" width="1280" height="1600" filter="url(#about-mug-detail)" />
      </g>
    </svg>
  );
}

export default function EditorialAbout() {
  return (
    <div className={styles.about}>
      <section className={styles.cover} aria-labelledby="about-heading">
        <div className={styles.frame}>
          <div className={styles.folio}><span>Twenty Second Coffee</span><span>Royal Wharf · London</span></div>
          <h1 id="about-heading">About <em>us.</em></h1>
          <div className={styles.coverComposition}>
            <p className={styles.coverIntro}>A familiar place to pause, connect, and feel part of Royal Wharf.</p>
            <div className={styles.heroObject}>
              <span className={styles.ring} aria-hidden="true" />
              <MugCutout />
            </div>
            <p className={styles.coverNote}>Independent coffee on<br />Royal Crest Avenue.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.frame} ${styles.cafe}`} aria-labelledby="the-cafe">
        <header className={styles.cafeLead}>
          <p className={styles.chapter}><span>01</span> The café</p>
          <h2 id="the-cafe">A coffee shop should feel like <em>part of your day.</em></h2>
        </header>
        <figure className={styles.room}>
          <div className={styles.photo}>
            <Image src="/about-hero.jpeg" alt="Leather chairs, timber tables and the bookcase inside the café" fill sizes="(max-width: 720px) 92vw, 620px" />
          </div>
          <figcaption>Inside Twenty Second Coffee</figcaption>
        </figure>
        <p className={styles.cafeText}>Twenty Second Coffee began with a simple ambition: genuinely good coffee and a warm, familiar welcome for the people who live and work around us.</p>
      </section>

      <section className={styles.detailBand} aria-labelledby="the-details">
        <div className={`${styles.frame} ${styles.detailSpread}`}>
          <header className={styles.detailCopy}>
            <p className={styles.chapter}><span>02</span> The little details</p>
            <h2 id="the-details">Coffee with <em>character.</em></h2>
            <p>Our house coffee is Bourbon Cream, a smooth, balanced Brazil and Colombia blend from Pact Coffee. It’s available regular or decaf.</p>
            <Link href="/menu" className={styles.textLink}>Explore the menu <span aria-hidden="true">↗</span></Link>
          </header>
          {details.map(({ src, alt, caption, style }) => (
            <figure className={style} key={src}>
              <div className={styles.photo}><Image src={src} alt={alt} fill sizes="(max-width: 720px) 47vw, 300px" /></div>
              <figcaption>{caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={`${styles.frame} ${styles.neighbourhood}`} aria-labelledby="the-neighbourhood">
        <header>
          <p className={styles.chapter}><span>03</span> The neighbourhood</p>
          <h2 id="the-neighbourhood">Our corner of<br /><em>Royal Wharf.</em></h2>
        </header>
        <figure className={styles.street}>
          <div className={styles.photo}>
            <Image src="/about-sign.jpeg" alt="The round Twenty Second Coffee sign on a brick wall along Royal Crest Avenue" fill sizes="(max-width: 720px) 92vw, 560px" />
          </div>
          <figcaption>Look for our sign on Royal Crest Avenue</figcaption>
        </figure>
        <p className={styles.streetText}>Royal Wharf is a growing community. We’ve grown alongside it, learning names, supporting local ideas, and giving neighbours a reason to bump into each other.</p>
      </section>

      <section className={styles.visit} aria-labelledby="come-by">
        <div className={`${styles.frame} ${styles.visitInner}`}>
          <div>
            <p className={styles.chapter}><span>04</span> Come by</p>
            <h2 id="come-by">There’s always room for <em>one more.</em></h2>
          </div>
          <div className={styles.visitDetails}>
            <p>{site.address}</p>
            <a href={site.mapsUrl} className={styles.textLink}>Get directions <span aria-hidden="true">↗</span></a>
            <Link href="/contact" className={styles.textLink}>Get in touch <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
