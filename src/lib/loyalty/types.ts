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

export type StaffLoyaltyMember = Pick<
  LoyaltyMember,
  | "id"
  | "member_code"
  | "first_name"
  | "email"
  | "beans"
  | "rewards_available"
  | "created_at"
  | "updated_at"
>;

export type LoyaltyAction = "stamp" | "redeem" | "undo";

export type StaffRole = "barista" | "manager";

export type LoyaltyStaff = {
  id: string;
  username: string;
  display_name: string;
  role: StaffRole;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type LoyaltyStaffWithPassword = LoyaltyStaff & {
  password_hash: string;
};

export type LoyaltyStaffSession = {
  id: string;
  staff_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string;
  last_seen_at: string;
  revoked_at: string | null;
};

export type LoyaltyMemberPage = {
  members: StaffLoyaltyMember[];
  nextCursor: string | null;
};

export type LoyaltyActivity = {
  id: number;
  action: LoyaltyAction;
  before_beans: number;
  before_rewards: number;
  after_beans: number;
  after_rewards: number;
  voided_at: string | null;
  created_at: string;
  staff_display_name: string;
  request_source: string | null;
};

export type WalletSyncJob = Pick<
  LoyaltyMember,
  "public_code" | "member_code" | "first_name" | "beans" | "rewards_available"
> & {
  member_id: string;
  attempts: number;
};
