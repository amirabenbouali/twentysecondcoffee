export const BEANS_PER_REWARD = 9;

export type LoyaltyMember = {
  id: string;
  public_code: string;
  member_code: string;
  first_name: string;
  email: string;
  beans: number;
  rewards_available: number;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicLoyaltyMember = Pick<
  LoyaltyMember,
  | "public_code"
  | "member_code"
  | "first_name"
  | "beans"
  | "rewards_available"
  | "created_at"
>;

export type LoyaltyAction = "stamp" | "redeem" | "undo";
