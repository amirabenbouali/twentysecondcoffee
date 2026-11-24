// Address, phone, rating, maps URL, and hours below came from the shop's public
// Google Business listing in Aug 2026. The owner must confirm them before
// launch because public listings can go stale. Email and Instagram remain null
// until the owner supplies and approves the public details.
export const site = {
  name: "twenty second coffee",
  tagline: "Royal Wharf's community coffee shop",
  neighborhood: "Royal Wharf, London",
  address: "38 Royal Crest Avenue, Royal Wharf, London E16 2TF",
  email: null as string | null,
  phone: "+44 20 3990 6642",
  mapsUrl: "https://maps.google.com/?q=Twenty+Second+Coffee+Royal+Wharf",
  instagram: null as string | null,
  googleRating: { value: 4.4, count: 388 },
  hours: [
    { day: "Sunday", time: "10:00am to 6:00pm" },
    { day: "Monday to Thursday", time: "8:00am to 8:00pm" },
    { day: "Friday and Saturday", time: "8:00am to 9:00pm" },
  ],
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/loyalty", label: "Loyalty" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
