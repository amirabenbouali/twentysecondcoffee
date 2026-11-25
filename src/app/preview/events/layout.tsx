import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events design preview | twenty second coffee",
  robots: { index: false, follow: false },
};

export default function EventsPreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
