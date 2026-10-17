export type CommunityEvent = {
  title: string;
  date: string;
  time: string;
  description: string;
};

// Add confirmed events here as they are scheduled. Expired placeholder dates
// were removed in October 2026 so the public page never advertises old events.
export const events: CommunityEvent[] = [];
