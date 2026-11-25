export type CommunityEvent = {
  title: string;
  date: string;
  time: string;
  description: string;
  organiser?: string;
  price?: string;
  bookingUrl?: string;
  detailsUrl?: string;
  flyer?: string;
  flyerSize?: { width: number; height: number };
  poster?: "christmas-candle";
};

export const events: CommunityEvent[] = [
  {
    title: "Christmas Candle Workshop",
    date: "2026-12-06",
    time: "2pm to 4pm",
    description: "Make a Christmas candle with a personal message tucked inside the wax.",
    organiser: "Tempus & Jubilo",
    price: "From £28 per person",
    bookingUrl: "https://tempusandjubilo.com/wrkshp/dec6",
    flyer: "/events/december-candle-workshop.jpg",
    poster: "christmas-candle",
  },
  {
    title: "Festive Get-together",
    date: "2026-12-07",
    time: "6:30pm to 8pm",
    description: "Meet your neighbours over drinks and mince pies. Open to Royal Wharf and Riverscape residents. The first 50 eligible Residents’ Association members on the night get a free drink. Members can check their email for RSVP details.",
    organiser: "Royal Wharf Residents’ Association",
    detailsUrl: "https://royalwharfresidents.com/news/christmas-drinks",
    flyer: "/events/december-festive-get-together.png",
    flyerSize: { width: 1664, height: 1678 },
  },
  {
    title: "Community Games Night",
    date: "2026-12-11",
    time: "From 6pm",
    description: "An evening of board games and good company, presented by Echo Church in partnership with Twenty Second Coffee.",
    flyer: "/events/december-community-night.jpg",
  },
  {
    title: "Christmas Card Making",
    date: "2026-12-11",
    time: "From 6pm",
    description: "Grab a drink and join in at one of the café tables. Craft supplies are provided and everyone is welcome.",
    price: "Free card making",
  },
];

export function getUpcomingEvents(now = new Date()) {
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/London", dateStyle: "short" }).format(now);
  return events.filter(({ date }) => date >= today);
}
