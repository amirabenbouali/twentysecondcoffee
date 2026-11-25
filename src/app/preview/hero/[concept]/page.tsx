import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorialHome from "@/components/home/EditorialHome";

export const metadata: Metadata = {
  title: "Homepage design previews | twenty second coffee",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return [{ concept: "a" }, { concept: "b" }];
}

export const dynamicParams = false;

export const revalidate = 3600;

export default async function HeroPreview({ params }: PageProps<"/preview/hero/[concept]">) {
  const { concept } = await params;
  if (concept !== "a" && concept !== "b") notFound();
  return <EditorialHome concept={concept} preview />;
}
