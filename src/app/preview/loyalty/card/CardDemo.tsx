"use client";

import { useState } from "react";
import { BEANS_PER_REWARD } from "@/lib/loyalty/types";
import CollectibleCard from "@/components/loyalty/CollectibleCard";
import styles from "@/components/loyalty/loyalty.module.css";

const examples = [
  { name: "New card", beans: 0, rewards: 0 },
  { name: "Collecting beans", beans: BEANS_PER_REWARD - 1, rewards: 0 },
  { name: "Reward ready", beans: 0, rewards: 1 },
];

export default function CardDemo({ qrCode, startNew }: { qrCode: string; startNew: boolean }) {
  const [selected, setSelected] = useState(startNew ? 0 : 1);
  const { beans, rewards } = examples[selected];

  return (
    <>
      <CollectibleCard beans={beans} rewards={rewards} qrCode={qrCode} />
      <fieldset className={styles.states}>
        <legend className={styles.label}>Preview a card state</legend>
        {examples.map(({ name }, index) => (
          <button className={styles.state} type="button" key={name} aria-pressed={index === selected} onClick={() => setSelected(index)}>{name}</button>
        ))}
      </fieldset>
    </>
  );
}
