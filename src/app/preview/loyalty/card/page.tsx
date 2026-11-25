import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import CardDemo from "./CardDemo";
import styles from "@/components/loyalty/loyalty.module.css";

export const metadata: Metadata = {
  title: "Coffee Club card preview | twenty second coffee",
};

export default async function CardPreviewPage({ searchParams }: PageProps<"/preview/loyalty/card">) {
  const { new: startNew } = await searchParams;
  const qrCode = await QRCode.toDataURL("Twenty Second Coffee design preview only", {
    width: 256,
    margin: 4,
    color: { dark: "#1c1613", light: "#ffffff" },
  });

  return (
    <section className={styles.cardPage}>
      <div className={styles.cardPageTop}>
        <Link href="/preview/loyalty" className={styles.textLink}>← Coffee Club</Link>
        <p className={styles.label}>Design preview</p>
      </div>
      <h1 className={styles.pageTitle}>Your coffee card<em>.</em></h1>
      <p className={styles.cardIntro}>A sample of what you’ll show at the counter. The balance, reward and code below are examples.</p>
      <CardDemo qrCode={qrCode} startNew={startNew === "1"} />
      <p className={styles.cardNote}>On a real card, keep your QR and member code private. You can save the page to your phone so it’s ready for your next visit.</p>
    </section>
  );
}
