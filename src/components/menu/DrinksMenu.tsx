import Image from "next/image";
import Link from "next/link";
import { menu, type MenuSection } from "@/data/menu";
import { site } from "@/data/site";
import CategoryIndex from "./CategoryIndex";
import styles from "./menu-study.module.css";

const categories = menu.map(({ title }, index) => ({
  title,
  number: String(index + 1).padStart(2, "0"),
  id: title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
}));

function DrinksChapter({ section, category }: { section: MenuSection; category: (typeof categories)[number] }) {
  const heading = `${category.id}-title`;

  return (
    <section id={category.id} tabIndex={-1} aria-labelledby={heading} className={styles.chapter}>
      <div className={styles.chapterLead}>
        <span className={styles.folio} aria-hidden="true">{category.number}</span>
        <div className={styles.chapterLabel}>
          <h2 id={heading}>{section.title}</h2>
          {section.description && <p>{section.description}</p>}
        </div>
        {section.sharedPrice && <p className={styles.eachPrice}>{section.sharedPrice} <span>each</span></p>}
      </div>

      <ul className={styles.rows}>
        {section.items.map((item) => (
          <li key={item.name} className={styles.row}>
            <div className={styles.item}>
              <span>{item.name}</span>
              {item.description && <p>{item.description}</p>}
            </div>
            {!section.sharedPrice && (item.sizes ? (
              <dl className={styles.variants}>
                {item.sizes.map(({ label, price }) => (
                  <div key={label}><dt>{label}</dt><dd>{price}</dd></div>
                ))}
              </dl>
            ) : <span className={styles.price}>{item.price}</span>)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DrinksMenu() {
  return (
    <div className={styles.study}>
      <div className={styles.masthead}>
        <div className={styles.cover}>
          <p className={styles.location}><span>Twenty Second Coffee</span><span>Royal Wharf, London</span></p>
          <h1 className={styles.title}><span className={styles.titleLabel}>Drinks</span>{" "}<span className={styles.titleWord}>menu</span></h1>
          <p className={styles.coverNote}>Coffee and tea all day.<br />{" "}The bar opens at noon.</p>
        </div>
      </div>

      <CategoryIndex categories={categories} />

      <div className={styles.gallery} aria-label="Explore the drinks menu" role="group">
        <a href="#coffee">
          <span className={styles.galleryImage}><Image src="/about-counter.jpeg" alt="" fill sizes="(max-width: 620px) 45vw, 300px" /></span>
          <span className={styles.galleryCaption}>From the espresso machine <span aria-hidden="true">↘</span></span>
        </a>
        <a href="#tea" className={styles.teaPanel}>
          <span className={styles.galleryImage}><span>Time for <em>tea.</em></span></span>
          <span className={styles.galleryCaption}>Explore the teas <span aria-hidden="true">↘</span></span>
        </a>
        <a href="#beer-and-cider">
          <span className={styles.galleryImage}><Image src="/events-popup.jpeg" alt="" fill sizes="(max-width: 620px) 45vw, 300px" /></span>
          <span className={styles.galleryCaption}>From the bar <span aria-hidden="true">↘</span></span>
        </a>
      </div>

      <div id="menu-list" className={styles.edition}>
        {menu.map((section, index) => <DrinksChapter key={section.title} section={section} category={categories[index]} />)}
        <div className={styles.colophon}>
          <p>Ask the team about dietary options and current specials.</p>
          <a href={site.mapsUrl}>Get directions <span aria-hidden="true">↗</span></a>
          <Link href="/contact">Get in touch <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>
  );
}
