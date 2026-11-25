import CollectibleCard from "./CollectibleCard";
import WalletActions from "./WalletActions";
import type { PublicLoyaltyMember } from "@/lib/loyalty/types";

type LoyaltyCardProps = {
  member: PublicLoyaltyMember;
  qrCode: string;
  googleWalletUrl?: string | null;
};

export default function LoyaltyCard({ member, qrCode, googleWalletUrl }: LoyaltyCardProps) {
  return (
    <CollectibleCard
      beans={member.beans}
      rewards={member.rewards_available}
      member={{ firstName: member.first_name, code: member.member_code }}
      qrCode={qrCode}
    >
      <WalletActions googleWalletUrl={googleWalletUrl} />
    </CollectibleCard>
  );
}
