export type PriceOption = {
  label: string;
  price: string;
};

export type MenuItem = {
  name: string;
  description?: string;
  /** Use for a single flat price. */
  price?: string;
  /** Use instead of `price` when an item comes in multiple sizes. */
  sizes?: PriceOption[];
};

export type MenuSection = {
  title: string;
  description?: string;
  /** When every item in the section costs the same, set this instead of
   *  pricing each item individually — it's shown once next to the title. */
  sharedPrice?: string;
  items: MenuItem[];
};

// Transcribed from the in-store menu board (Aug 2026) — the board was
// shot at a steep angle, so a couple of values (Cappuccino's single
// price, Macchiato's second size) are a best reconstruction. Double
// check against the board in person and correct here if needed.
export const menu: MenuSection[] = [
  {
    title: "Coffee",
    description: "Bourbon Cream beans from Pact Coffee — decaf available",
    items: [
      {
        name: "Latte",
        sizes: [
          { label: "S", price: "£3.90" },
          { label: "M", price: "£4.20" },
          { label: "L / Iced", price: "£4.50" },
        ],
      },
      { name: "Cappuccino", price: "£4.00" },
      { name: "Flat White", price: "£3.70" },
      {
        name: "Americano",
        sizes: [
          { label: "S", price: "£3.85" },
          { label: "M", price: "£4.20" },
        ],
      },
      {
        name: "Mocha",
        sizes: [
          { label: "S", price: "£4.30" },
          { label: "M", price: "£4.60" },
          { label: "L / Iced", price: "£5.00" },
        ],
      },
      { name: "Piccolo", price: "£3.20" },
      {
        name: "Espresso",
        sizes: [
          { label: "Single", price: "£2.80" },
          { label: "Double", price: "£3.20" },
          { label: "Triple", price: "£3.50" },
        ],
      },
      {
        name: "Con Panna",
        sizes: [
          { label: "Single", price: "£3.25" },
          { label: "Double", price: "£3.65" },
        ],
      },
      {
        name: "Macchiato",
        sizes: [
          { label: "Single", price: "£3.15" },
          { label: "Double", price: "£3.65" },
        ],
      },
    ],
  },
  {
    title: "Speciality",
    items: [
      {
        name: "Hot Chocolate",
        sizes: [
          { label: "S", price: "£3.90" },
          { label: "M", price: "£4.50" },
          { label: "L", price: "£4.85" },
        ],
      },
      {
        name: "White Chocolate",
        description: "A white chocolate twist on our hot chocolate",
        sizes: [
          { label: "S", price: "£3.90" },
          { label: "M", price: "£4.50" },
          { label: "L", price: "£4.85" },
        ],
      },
      {
        name: "Chai Latte",
        sizes: [
          { label: "S", price: "£4.30" },
          { label: "M", price: "£4.60" },
          { label: "L", price: "£5.00" },
        ],
      },
    ],
  },
  {
    title: "Tea",
    sharedPrice: "£3.00",
    items: [
      { name: "English Breakfast" },
      { name: "Decaf Breakfast" },
      { name: "Mint" },
      { name: "Lemongrass & Ginger" },
      { name: "Earl Grey" },
      { name: "Fruit" },
      { name: "Camomile" },
      { name: "Green" },
    ],
  },
  {
    title: "Super Food Lattes",
    description: "Iced available — add white chocolate +£1.00",
    items: [
      {
        name: "Matcha",
        sizes: [
          { label: "S", price: "£4.85" },
          { label: "M", price: "£5.55" },
        ],
      },
      {
        name: "Beetroot Latte",
        sizes: [
          { label: "S", price: "£4.85" },
          { label: "M", price: "£5.55" },
        ],
      },
      {
        name: "Turmeric Latte",
        sizes: [
          { label: "S", price: "£4.85" },
          { label: "M", price: "£5.55" },
        ],
      },
    ],
  },
  {
    title: "Ice Teas",
    sharedPrice: "£4.90",
    items: [{ name: "Peach" }, { name: "Berry" }],
  },
  {
    title: "Frappes",
    sharedPrice: "£5.90",
    description: "Add whipped cream +£0.60",
    items: [
      { name: "Banoffee" },
      { name: "Matcha White Choc" },
      { name: "Peaches" },
      { name: "Banana Bread" },
      { name: "Biscoff" },
      { name: "Salted Caramel" },
      { name: "Berry & White Chocolate" },
      { name: "Oreo" },
    ],
  },
  {
    title: "Crushed Ice",
    sharedPrice: "£5.60",
    items: [
      { name: "Pineapple & Passionfruit" },
      { name: "Mango & Passionfruit" },
      { name: "Lemonade" },
      { name: "Strawberry Lemonade" },
    ],
  },
  {
    title: "Food",
    items: [
      { name: "Almond Croissant", price: "£3.50" },
      { name: "Banana Bread", price: "£3.20" },
      { name: "Avocado Toast", price: "£6.50" },
      { name: "Breakfast Bagel", price: "£5.50" },
    ],
  },
  {
    title: "Extras",
    items: [
      { name: "1 Pump Syrup", price: "£1.00" },
      { name: "Whipped Cream", price: "£0.60" },
      { name: "1 Extra Shot", price: "£1.50" },
      { name: "Paper Cup", price: "£0.50" },
      { name: "Choc-cino", description: "Kids' hot chocolate", price: "Ask instore" },
      { name: "Puppyccino", description: "On the house for your dog", price: "Free" },
    ],
  },
  {
    title: "Beer & Cider",
    description: "On tap from 12pm",
    items: [
      { name: "Guinness", description: "Draught", price: "£5.80" },
      { name: "Asahi", description: "Draught", price: "£5.60" },
      { name: "Peroni", description: "Draught", price: "£5.40" },
      { name: "Hawkstone Lager", description: "Draught", price: "£5.60" },
      { name: "Hawkstone Cider", description: "Draught", price: "£5.60" },
    ],
  },
  {
    title: "Cocktails",
    description: "On demand from 12pm",
    items: [
      {
        name: "Ask your bartender",
        description: "Classic or seasonal — made to order, tell us what you fancy",
        price: "Ask instore",
      },
    ],
  },
];
