import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import LoyaltyCard from "@/components/loyalty/LoyaltyCard";
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
    <section className="min-h-screen bg-[#e7d8c6] px-5 pb-20 pt-32 text-ink-950 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/loyalty" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/55 hover:text-ink-950">← Rewards</Link>
          <p className="text-[9px] uppercase tracking-[0.18em] text-ink-900/42">Save this page</p>
        </div>
        <LoyaltyCard member={member} qrCode={qrCode} googleWalletUrl={googleWalletUrl} />
        <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-5 text-ink-900/46">Keep this page private. Anyone with your card code can display it at the counter.</p>
      </div>
    </section>
  );
}
