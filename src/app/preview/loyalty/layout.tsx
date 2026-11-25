import type { Metadata } from "next";
import styles from "@/components/loyalty/loyalty.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoyaltyPreviewLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.royalWharf}>{children}</div>;
}
