// Address, phone, and hours below are pulled from the shop's public Google
// Business listing (Aug 2026). Double-check with the owner before relying
// on them, since listings can go stale. Email and Instagram are still
// placeholders: no public email or confirmed current Instagram handle was
// found, so get the real ones from the owner.
export const site = {
  name: "22nd Coffee",
  tagline: "Royal Wharf's community coffee shop",
  neighborhood: "Royal Wharf, London",
  address: "38 Royal Crest Avenue, Royal Wharf, London E16 2TF",
  email: "hello@22ndcoffee.co.uk",
  phone: "+44 20 3990 6642",
  mapsUrl: "https://maps.google.com/?q=Twenty+Second+Coffee+Royal+Wharf",
  instagram: "https://instagram.com/22ndcoffee",
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
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
