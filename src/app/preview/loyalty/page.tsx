import type { Metadata } from "next";
import ClubLanding from "@/components/loyalty/ClubLanding";
import DemoJoinForm from "./DemoJoinForm";

export const metadata: Metadata = {
  title: "The Coffee Club preview | twenty second coffee",
};

export default function LoyaltyPreviewPage() {
  return <ClubLanding preview joinForm={<DemoJoinForm />} />;
}
