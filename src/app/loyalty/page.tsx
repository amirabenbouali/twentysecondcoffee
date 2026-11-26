import { publicPageMetadata } from "@/lib/seo";
import ClubLanding from "@/components/loyalty/ClubLanding";
import JoinForm from "@/components/loyalty/JoinForm";
import styles from "@/components/loyalty/loyalty.module.css";

export const metadata = publicPageMetadata("/loyalty");

export default function LoyaltyPage() {
  return <div className={styles.royalWharf}><ClubLanding joinForm={<JoinForm />} /></div>;
}
