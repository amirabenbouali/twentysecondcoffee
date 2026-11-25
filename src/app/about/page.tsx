import type { Metadata } from "next";
import EditorialAbout from "@/components/about/EditorialAbout";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `About | ${site.name}`,
  description: `The story behind ${site.name}, a community coffee shop in ${site.neighborhood}.`,
};

export default function AboutPage() {
  return <EditorialAbout />;
}
