import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { indexableSite, siteOrigin } from "@/lib/seo";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  robots: indexableSite ? undefined : { index: false, follow: false },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-180.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper-50 text-ink-950">
        <Header />
        <div className="flex min-h-full flex-1 flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
