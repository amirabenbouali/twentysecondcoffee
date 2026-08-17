export type CommunityEvent = {
  title: string;
  date: string;
  time: string;
  description: string;
};

// Placeholder events — replace with real dates as they're scheduled.
export const events: CommunityEvent[] = [
  {
    title: "Latte Art Morning",
    date: "Saturday 30 August 2026",
    time: "9:00am – 11:00am",
    description:
      "Drop in and learn a few latte art basics from our baristas. Free with any drink purchase.",
  },
  {
    title: "Royal Wharf Community Coffee Morning",
    date: "Sunday 7 September 2026",
    time: "10:00am – 12:00pm",
    description:
      "A relaxed monthly meetup for neighbours — come say hello, meet local faces, first coffee on us.",
  },
  {
    title: "Local Makers Market",
    date: "Saturday 20 September 2026",
    time: "11:00am – 3:00pm",
    description:
      "We're hosting a small pop-up of local makers and independent sellers right outside the shop.",
  },
];
