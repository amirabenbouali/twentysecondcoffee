import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import LoyaltyCard from "@/components/loyalty/LoyaltyCard";
import styles from "@/components/loyalty/loyalty.module.css";
import { getPublicLoyaltyMember } from "@/lib/loyalty/db";
import { createGoogleWalletSaveUrl } from "@/lib/loyalty/google-wallet";

export async function generateMetadata({ params }: PageProps<"/loyalty/[code]">): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "My loyalty card | twenty second coffee",
    robots: { index: false, follow: false },
    manifest: `/api/loyalty/${code}/manifest`,
    appleWebApp: {
      capable: true,
      title: "Rewards card",
      statusBarStyle: "black-translucent",
    },
  };
}

export default async function CustomerLoyaltyCardPage({ params }: PageProps<"/loyalty/[code]">) {
  const { code } = await params;
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(code)) notFound();

  const member = await getPublicLoyaltyMember(code);
  if (!member) notFound();

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const cardUrl = `${protocol}://${host}/loyalty/${member.public_code}`;
  const qrCode = await QRCode.toDataURL(`TSC:${member.public_code}`, {
    width: 256,
    margin: 1,
    color: { dark: "#1c1613", light: "#ffffff" },
  });
  const googleWalletUrl = createGoogleWalletSaveUrl(member, cardUrl);

  return (
    <div className={styles.royalWharf}>
      <section className={styles.cardPage}>
        <div className={styles.cardPageTop}>
          <Link href="/loyalty" className={styles.textLink}>← Coffee Club</Link>
          <p className={styles.label}>Save this page</p>
        </div>
        <h1 className={styles.pageTitle}>Your coffee card<em>.</em></h1>
        <LoyaltyCard member={member} qrCode={qrCode} googleWalletUrl={googleWalletUrl} />
        <p className={styles.cardNote}>Keep this page private. Anyone with your card code can display it at the counter.</p>
      </section>
    </div>
  );
}
