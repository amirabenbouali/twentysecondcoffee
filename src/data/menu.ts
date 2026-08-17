export type MenuItem = {
  name: string;
  description?: string;
  price: string;
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

// Placeholder menu — swap in real drinks/prices whenever you're ready.
// Staff can add a new drink by adding a new object to the relevant `items` array below.
export const menu: MenuSection[] = [
  {
    title: "Coffee",
    items: [
      { name: "Espresso", price: "£2.60" },
      { name: "Americano", price: "£2.90" },
      { name: "Flat White", price: "£3.30" },
      { name: "Cappuccino", price: "£3.30" },
      { name: "Latte", price: "£3.40" },
      { name: "Mocha", price: "£3.70" },
    ],
  },
  {
    title: "Seasonal & Specials",
    items: [
      {
        name: "22nd House Blend",
        description: "Our signature roast, rotated seasonally",
        price: "£3.50",
      },
      {
        name: "Iced Honey Oat Latte",
        description: "Espresso, oat milk, honey, over ice",
        price: "£3.90",
      },
    ],
  },
  {
    title: "Tea & Other Drinks",
    items: [
      { name: "English Breakfast", price: "£2.60" },
      { name: "Green Tea", price: "£2.60" },
      { name: "Hot Chocolate", price: "£3.20" },
      { name: "Chai Latte", price: "£3.40" },
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
];
