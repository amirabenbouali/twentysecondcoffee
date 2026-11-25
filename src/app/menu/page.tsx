import type { Metadata } from "next";
import DrinksMenu from "@/components/menu/DrinksMenu";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `Menu | ${site.name}`,
  description: `Coffee, tea, and drinks available at ${site.name} in ${site.neighborhood}.`,
};

export default function MenuPage() {
  return <DrinksMenu />;
}
