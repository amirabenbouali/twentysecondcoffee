import type { Metadata } from "next";
import EditorialAbout from "@/components/about/EditorialAbout";

export const metadata: Metadata = {
  title: "About design preview | twenty second coffee",
  description: "An editorial portrait of Twenty Second Coffee in Royal Wharf.",
  robots: { index: false, follow: false },
};

export default function AboutPreview() {
  return <EditorialAbout />;
}
