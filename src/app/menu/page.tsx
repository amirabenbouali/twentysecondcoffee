import { publicPageMetadata } from "@/lib/seo";
import DrinksMenu from "@/components/menu/DrinksMenu";

export const metadata = publicPageMetadata("/menu");

export default function MenuPage() {
  return <DrinksMenu />;
}
