import styles from "./hero.module.css";

export default function HeroWordmark({ experimental = false }: { experimental?: boolean }) {
  return (
    <div className={experimental ? styles.expressiveMark : styles.refinedMark}>
      <h1 className={styles.wordmark} id="home-heading" tabIndex={-1}>
        {experimental ? <>twenty <em>second</em><span>coffee</span></> : <>twenty second <span>coffee</span></>}
      </h1>
    </div>
  );
}
