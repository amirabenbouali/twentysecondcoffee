"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import styles from "./menu-study.module.css";

type Category = { id: string; number: string; title: string };

export default function CategoryIndex({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState(categories[0].id);
  const nav = useRef<HTMLElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const current = categories.find(({ id }) => id === activeId) ?? categories[0];

  useEffect(() => {
    const sections = categories.flatMap(({ id }) => {
      const section = document.getElementById(id);
      return section ? [section] : [];
    });

    let frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const indexBottom = nav.current?.getBoundingClientRect().bottom ?? 0;
        const line = indexBottom + 36;
        let active = sections[0];
        for (const section of sections) {
          if (section.getBoundingClientRect().top > line) break;
          active = section;
        }
        if (active) setActiveId(active.id);
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, [categories]);

  function closeOnEscape(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== "Escape" || !disclosure.current?.open) return;
    event.preventDefault();
    disclosure.current.open = false;
    summary.current?.focus();
  }

  function choose(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    setActiveId(id);
    if (!disclosure.current?.open) return;

    disclosure.current.open = false;
    // The native link sets the fragment and focus. Realign once the index has collapsed.
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
  }

  function links() {
    return categories.map(({ id, number, title }) => (
      <li key={id}>
        <a href={`#${id}`} aria-current={id === activeId ? "location" : undefined} onClick={(event) => choose(event, id)}>
          <span className={styles.indexNumber} aria-hidden="true">{number}</span>
          <span>{title}</span>
        </a>
      </li>
    ));
  }

  return (
    <nav ref={nav} className={styles.index} aria-label="Menu categories">
      <ol className={styles.desktopIndex}>{links()}</ol>
      <details ref={disclosure} className={styles.mobileIndex} onKeyDown={closeOnEscape}>
        <summary ref={summary}>
          <span>Menu index</span>
          <span className={styles.currentLabel}>{current.number} <strong>{current.title}</strong></span>
          <span className={styles.indexCaret} aria-hidden="true" />
        </summary>
        <ol>{links()}</ol>
      </details>
    </nav>
  );
}
