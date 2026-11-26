import CafeHome from "@/components/home/CafeHome";
import { cafeStructuredData, publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/");
export const revalidate = 3600;

export default function Home() {
  const cafe = cafeStructuredData();
  return (
    <>
      {cafe && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(cafe).replace(/</g, "\\u003c") }}
        />
      )}
      <CafeHome />
    </>
  );
}
