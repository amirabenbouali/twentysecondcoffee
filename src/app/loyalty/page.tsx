import type { Metadata } from "next";
import ClubLanding from "@/components/loyalty/ClubLanding";
import JoinForm from "@/components/loyalty/JoinForm";
import styles from "@/components/loyalty/loyalty.module.css";

export const metadata: Metadata = {
  title: "Loyalty | twenty second coffee",
  description: "Collect nine beans and enjoy your next standard coffee on us with Twenty Second Rewards.",
};

export default function LoyaltyPage() {
  return <div className={styles.royalWharf}><ClubLanding joinForm={<JoinForm />} /></div>;
}
