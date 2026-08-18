import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/data/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: `${site.name} is a community coffee shop in ${site.neighborhood}. See our menu, upcoming events, and get in touch.`,
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-180.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper-50 text-ink-950">
        <Header />
        <div className="flex min-h-full flex-1 flex-col md:pl-20">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
