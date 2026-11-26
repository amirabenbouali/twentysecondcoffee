import { publicPageMetadata } from "@/lib/seo";
import EditorialAbout from "@/components/about/EditorialAbout";

export const metadata = publicPageMetadata("/about");

export default function AboutPage() {
  return <EditorialAbout />;
}
