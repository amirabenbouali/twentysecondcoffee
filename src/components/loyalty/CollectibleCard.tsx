import Image from "next/image";
import type { ReactNode } from "react";
import { BEANS_PER_REWARD } from "@/lib/loyalty/types";
import styles from "./loyalty.module.css";

type Props = {
  beans: number;
  rewards: number;
  sample?: boolean;
  qrCode?: string;
  member?: { firstName: string; code: string };
  children?: ReactNode;
};

export default function CollectibleCard({ beans, rewards, sample = false, qrCode, member, children }: Props) {
  const remaining = BEANS_PER_REWARD - beans;
  const cardLabel = sample ? "Sample card" : member ? "Member card" : "Demo card";
  const cardTitle = sample ? "The Coffee Club" : `${member?.firstName ?? "Alex"}’s coffee card`;
  const memberCode = member?.code ?? "DEMO-ONLY";

  return (
    <article className={styles.collectible} aria-label={cardLabel}>
      <div className={styles.cardFace}>
        <svg aria-hidden="true" className={styles.ring} viewBox="0 0 200 200" fill="none">
          <path d="M182 129c-9 39-43 63-84 60C45 185 9 151 10 100 11 49 48 13 100 12c50-1 87 34 90 83 1 13-2 25-8 34Z" strokeWidth="4" />
          <path d="M175 59c12 27 14 59 0 84-17 29-48 44-82 40-48-5-79-37-77-83 2-46 36-79 83-81 22-1 41 5 56 17" strokeWidth="1" />
        </svg>
        <div className={styles.cardTop}>
          <p className={styles.cardBrand}>twenty second coffee</p>
          <p className={styles.label}>{cardLabel}</p>
        </div>
        <p className={styles.cardTitle}>{cardTitle}</p>
        <div className={styles.stamps} aria-hidden="true">
          {Array.from({ length: BEANS_PER_REWARD }, (_, index) => (
            <div className={styles.stamp} key={index} data-filled={index < beans}>
              <svg viewBox="0 0 36 44" fill="none">
                <path className={styles.beanBody} d="M30 5c7 6 4 19-3 28C20 42 9 46 4 39c-6-7-3-18 4-27C16 2 24 0 30 5Z" />
                <path className={styles.beanSeam} d="M28 7c-8 6-7 12-11 18-3 4-7 7-11 12" />
              </svg>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
        <div className={styles.balance} aria-live={sample ? undefined : "polite"} aria-atomic="true">
          <p><strong>{beans} / {BEANS_PER_REWARD}</strong> beans collected</p>
          <p><strong>{rewards}</strong> {rewards === 1 ? "reward" : "rewards"} available</p>
        </div>
      </div>
      {qrCode ? (
        <div className={styles.stub}>
          <div className={styles.stubText}>
            <p className={styles.label}>At the counter</p>
            <p className={styles.stubTitle}>{rewards > 0 ? "Your coffee is on us." : remaining === 1 ? "One bean to go." : `${remaining} beans to your next reward.`}</p>
            <p>{rewards > 0 ? "Show your card before ordering to redeem a standard coffee." : "Show your QR after paying for a qualifying coffee, or give the team your member code."}</p>
            <p className={styles.memberCode}><span className={styles.label}>Member code</span><strong>{memberCode}</strong></p>
          </div>
          <div className={styles.qr}>
            <Image src={qrCode} width={256} height={256} unoptimized alt={member ? "Loyalty QR code" : "Demo QR code"} />
            {!member && <p>Demo QR · no live account</p>}
          </div>
          {children && <div className={styles.cardActions}>{children}</div>}
        </div>
      ) : (
        <p className={styles.sampleStub}><span>Royal Wharf, London</span><span>{BEANS_PER_REWARD} beans for a coffee</span></p>
      )}
    </article>
  );
}
