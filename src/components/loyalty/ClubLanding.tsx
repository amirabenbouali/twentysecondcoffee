import Link from "next/link";
import { BEANS_PER_REWARD } from "@/lib/loyalty/types";
import CollectibleCard from "@/components/loyalty/CollectibleCard";
import type { ReactNode } from "react";
import styles from "./loyalty.module.css";

export default function ClubLanding({ joinForm, preview = false }: { joinForm: ReactNode; preview?: boolean }) {
  return (
    <>
      <section className={styles.masthead}>
        <div className={styles.frame}>
          <div className={styles.folio}>
            <p className={styles.label}>The Coffee Club</p>
            <p className={styles.label}>Royal Wharf · London</p>
          </div>
          <div className={styles.hero}>
            <div className={styles.intro}>
              <h1>Your coffee,<br /><em>your little ritual.</em></h1>
              <p className={styles.lede}>Collect {BEANS_PER_REWARD} beans and we’ll make your next standard coffee on us.</p>
              <div className={styles.actions}>
                <a className={styles.button} href="#join">Join the Club <span aria-hidden="true">↓</span></a>
                {preview && <Link className={styles.textLink} href="/preview/loyalty/card">See the demo card <span aria-hidden="true">↗</span></Link>}
              </div>
            </div>
            <div className={styles.heroCard}>
              <CollectibleCard beans={5} rewards={0} sample />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.rules} aria-labelledby="club-rules">
        <div className={styles.ruleNumber} aria-hidden="true">{String(BEANS_PER_REWARD).padStart(2, "0")}<span>→</span>{BEANS_PER_REWARD + 1}</div>
        <div>
          <h2 id="club-rules">Nine beans. <em>The tenth is on us.</em></h2>
          <p>Show your QR or member code when you buy a qualifying coffee. We’ll add a bean. Once you’ve collected nine, show your card before ordering to redeem one standard coffee.</p>
          <p className={styles.finePrint}>Ask the team which drinks qualify. Alternative milks, syrups and other extras are charged separately.</p>
        </div>
      </section>

      <section id="join" tabIndex={-1} className={styles.join} aria-labelledby="join-title">
        <div className={styles.joinInner}>
          <header className={styles.joinHeader}>
            <p className={styles.label}>{preview ? "Design preview" : "Join free"}</p>
            <h2 id="join-title">Start <em>your card.</em></h2>
            <p>{preview ? "Try the registration with sample details. The preview doesn’t send or save anything." : "Keep your card on your phone and have it ready for your next coffee."}</p>
          </header>
          {joinForm}
        </div>
      </section>

      <div className={styles.endnote}>
        <p>Already a member? <Link className={styles.textLink} href="/contact">Ask the team for help finding your card</Link>.</p>
        {preview && <Link className={styles.textLink} href="/loyalty">Current loyalty programme ↗</Link>}
      </div>
    </>
  );
}
