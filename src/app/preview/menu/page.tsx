import type { Metadata } from "next";
import DrinksMenu from "@/components/menu/DrinksMenu";

export const metadata: Metadata = {
  title: "Drinks menu study | twenty second coffee",
  robots: { index: false, follow: false },
};

export default function MenuPreview() {
  return <DrinksMenu />;
}
