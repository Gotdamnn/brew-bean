/**
 * Brew & Shot Café — official menu, transcribed from the printed "Special Menu" photographs.
 * This file is the single source of truth for prices. The order API recomputes every
 * total from this file on the server, so client-side prices can never be trusted or tampered with.
 * To change a price, edit it here and redeploy.
 */

export type CategoryId =
  | 'coffee'
  | 'blended-coffee'
  | 'blended-non-coffee'
  | 'refreshers'
  | 'non-coffee'
  | 'cocktails'
  | 'beers'
  | 'snacks'
  | 'rice-meals'
  | 'pasta'
  | 'pastries';

export type VariantId = 'hot' | 'iced' | 'regular';

export interface Variant {
  id: VariantId;
  label: string; // "Hot · 12 oz"
  price: number; // PHP
}

export type AddOnGroup = 'drink' | 'food';

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  variants: Variant[];
  addOns?: AddOnGroup;
  alcoholic?: boolean;
  bestSeller?: boolean;
  /** Accent colour used by the illustrated product art (liquid tone). */
  tone: string;
  /** Optional real photo (put files in /public/products/ and set e.g. "/products/spanish-latte.jpg"). */
  image?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  note?: string;
  group: 'drinks' | 'bar' | 'food';
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  group: AddOnGroup;
}

export const CATEGORIES: Category[] = [
  { id: 'coffee', name: 'Coffee', short: 'Espresso classics & signature lattes', note: '12 oz Hot · 16 oz Iced', group: 'drinks' },
  { id: 'blended-coffee', name: 'Blended Coffee', short: 'Thick, icy espresso blends', note: '16 oz', group: 'drinks' },
  { id: 'blended-non-coffee', name: 'Blended Non-Coffee', short: 'Creamy blends, no caffeine kick', note: '16 oz', group: 'drinks' },
  { id: 'refreshers', name: 'Refreshers', short: 'Bright, fruity & ice-cold', note: '16 oz', group: 'drinks' },
  { id: 'non-coffee', name: 'Non-Coffee', short: 'Matcha, cocoa & milk favourites', note: '12 oz Hot · 16 oz Iced', group: 'drinks' },
  { id: 'cocktails', name: 'Cocktails', short: 'Sangrias & house mixes', note: '18+ only · valid ID required', group: 'bar' },
  { id: 'beers', name: 'Imported Beers & Soju', short: 'Per bottle', note: '18+ only · valid ID required', group: 'bar' },
  { id: 'snacks', name: 'Snacks', short: 'Good for sharing', group: 'food' },
  { id: 'rice-meals', name: 'Rice Meals', short: 'Hearty all-day plates', group: 'food' },
  { id: 'pasta', name: 'Pasta', short: 'Comforting bowls', group: 'food' },
  { id: 'pastries', name: 'Pastries', short: 'Baked treats & desserts', group: 'food' },
];

export const ADD_ONS: AddOn[] = [
  { id: 'oatside', name: 'Oatside (oat milk)', price: 65, group: 'drink' },
  { id: 'extra-shot', name: 'Extra Espresso Shot', price: 60, group: 'drink' },
  { id: 'syrup', name: 'Syrup', price: 20, group: 'drink' },
  { id: 'steam-rice', name: 'Steam Rice', price: 35, group: 'food' },
  { id: 'fried-rice', name: 'Fried Rice', price: 55, group: 'food' },
  { id: 'garlic-mayo', name: 'Garlic Mayo', price: 25, group: 'food' },
  { id: 'fried-egg', name: 'Fried Egg', price: 35, group: 'food' },
];

/** Take-out fees printed on the food menu. Applied once per order when the order is Take Away. */
export const TAKEOUT_FEES = {
  food: { label: 'Food take-out fee', price: 20, categories: ['snacks', 'rice-meals', 'pasta'] as CategoryId[] },
  pastries: { label: 'Pastries take-out fee', price: 15, categories: ['pastries'] as CategoryId[] },
};

export const ALCOHOL_NOTICE =
  'Drinks are strictly for adults aged 18 years old and above. A valid government-issued ID must be presented upon ordering to verify your age. No valid ID, no service. Please drink responsibly.';

const hotIced = (hot: number, iced: number): Variant[] => [
  { id: 'hot', label: 'Hot · 12 oz', price: hot },
  { id: 'iced', label: 'Iced · 16 oz', price: iced },
];
const icedOnly = (iced: number): Variant[] => [{ id: 'iced', label: 'Iced · 16 oz', price: iced }];
const blended = (p: number): Variant[] => [{ id: 'regular', label: '16 oz', price: p }];
const single = (p: number, label = 'Regular'): Variant[] => [{ id: 'regular', label, price: p }];

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

type Raw = Omit<Product, 'id'> & { id?: string };
const p = (r: Raw): Product => ({ ...r, id: r.id ?? `${r.category}-${slug(r.name)}` });

export const PRODUCTS: Product[] = [
  // ── COFFEE ─────────────────────────────────────────────
  p({ name: 'Americano', category: 'coffee', description: 'Espresso + water. Clean, bold and simple.', variants: hotIced(120, 130), addOns: 'drink', tone: '#3B2418' }),
  p({ name: 'Aerocano', category: 'coffee', description: 'Steamed iced Americano with a silky, aerated finish.', variants: icedOnly(148), addOns: 'drink', tone: '#4A2E1F' }),
  p({ name: 'Latte', category: 'coffee', description: 'Espresso + milk. The smooth everyday classic.', variants: hotIced(138, 148), addOns: 'drink', tone: '#B88A64' }),
  p({ name: 'Spanish Latte', category: 'coffee', description: 'Espresso + condensed milk + milk. Sweet, creamy and rich.', variants: hotIced(148, 158), addOns: 'drink', bestSeller: true, tone: '#C49A6C' }),
  p({ name: 'Caramel Macchiato', category: 'coffee', description: 'Caramel + latte, layered and finished with caramel.', variants: hotIced(158, 168), addOns: 'drink', bestSeller: true, tone: '#B9824F' }),
  p({ name: 'Salted Caramel Latte', id: 'coffee-salted-caramel', category: 'coffee', description: 'Salted caramel + latte. Sweet with a savoury edge.', variants: hotIced(158, 168), addOns: 'drink', tone: '#B27B4C' }),
  p({ name: 'French Vanilla', category: 'coffee', description: 'French vanilla + latte. Soft, fragrant and mellow.', variants: hotIced(158, 168), addOns: 'drink', tone: '#CFAE85' }),
  p({ name: 'Hazelnut Latte', category: 'coffee', description: 'Hazelnut + latte. Nutty, toasty comfort.', variants: hotIced(158, 168), addOns: 'drink', tone: '#A87650' }),
  p({ name: 'Mocha Latte', category: 'coffee', description: 'Chocolate + latte. Coffee meets cocoa.', variants: hotIced(158, 168), addOns: 'drink', tone: '#6B4430' }),
  p({ name: 'White Mocha Latte', category: 'coffee', description: 'White chocolate + latte. Velvety and sweet.', variants: hotIced(168, 178), addOns: 'drink', tone: '#DCC3A1' }),
  p({ name: 'Sea Salt Latte', category: 'coffee', description: 'Sea salt foam + latte. A creamy, salty-sweet cap.', variants: icedOnly(178), addOns: 'drink', tone: '#C9A77F' }),
  p({ name: 'Blue Breve Latte', category: 'coffee', description: 'Heavy cream + full cream milk + espresso. Indulgently rich.', variants: icedOnly(188), addOns: 'drink', tone: '#BFA387' }),
  p({ name: 'Choco Pistachio Latte', category: 'coffee', description: 'Pistachio sauce + chocolate + espresso.', variants: icedOnly(288), addOns: 'drink', tone: '#8E8A4E' }),

  // ── BLENDED COFFEE ─────────────────────────────────────
  p({ name: 'Dark Mocha', category: 'blended-coffee', description: 'Dark chocolate + espresso, blended thick and icy.', variants: blended(198), addOns: 'drink', bestSeller: true, tone: '#4E2F22' }),
  p({ name: 'Java Chips', category: 'blended-coffee', description: 'Chocolate chips + chocolate + espresso, blended.', variants: blended(218), addOns: 'drink', tone: '#5A3828' }),
  p({ name: 'Choco Puff', category: 'blended-coffee', description: 'Marshmallow + chocolate + espresso, blended.', variants: blended(218), addOns: 'drink', tone: '#7A5038' }),
  p({ name: 'Salted Caramel Frappe', id: 'blended-coffee-salted-caramel', category: 'blended-coffee', description: 'Salted caramel + espresso, blended.', variants: blended(198), addOns: 'drink', tone: '#B9824F' }),
  p({ name: 'Golden Hour', category: 'blended-coffee', description: 'Biscoff + espresso, blended. Our caramelised-cookie signature.', variants: blended(228), addOns: 'drink', bestSeller: true, tone: '#C48A4A' }),

  // ── BLENDED NON-COFFEE ─────────────────────────────────
  p({ name: 'Cookies & Cream', category: 'blended-non-coffee', description: 'Oreo + cream, blended.', variants: blended(198), addOns: 'drink', tone: '#8F8A86' }),
  p({ name: 'Chocolate Cream', category: 'blended-non-coffee', description: 'Chocolate + cream, blended.', variants: blended(198), addOns: 'drink', tone: '#6B4430' }),
  p({ name: 'Strawberry Cream', category: 'blended-non-coffee', description: 'Strawberry + cream, blended.', variants: blended(198), addOns: 'drink', tone: '#E79AA6' }),
  p({ name: 'Matcha Craze', category: 'blended-non-coffee', description: 'Pure matcha + cream, blended.', variants: blended(198), addOns: 'drink', tone: '#8FA45A' }),
  p({ name: 'Strawberry Matcha Cream', id: 'blended-non-coffee-strawberry-matcha', category: 'blended-non-coffee', description: 'Matcha + strawberry + cream, blended.', variants: blended(208), addOns: 'drink', tone: '#9BAE66' }),

  // ── REFRESHERS ─────────────────────────────────────────
  ...(
    [
      ['Peach', '#F2B27E'],
      ['Lychee', '#F3DCD6'],
      ['Passion Fruit', '#F2C14E'],
      ['Green Grape', '#B9D27A'],
      ['Cucumber', '#C9DFAE'],
      ['Strawberry', '#E8798A'],
      ['Lemon', '#F4DF7A'],
    ] as const
  ).map(([name, tone]) =>
    p({ name: `${name} Refresher`, id: `refreshers-${slug(name)}`, category: 'refreshers', description: `A light, fruity ${name.toLowerCase()} cooler served over ice.`, variants: blended(148), addOns: 'drink', tone }),
  ),

  // ── NON-COFFEE ─────────────────────────────────────────
  p({ name: 'Strawberry Milk', category: 'non-coffee', description: 'Strawberry + fresh milk, served iced.', variants: icedOnly(168), addOns: 'drink', tone: '#F0A9B4' }),
  p({ name: 'Cocoa Milk', category: 'non-coffee', description: 'Chocolate + milk. A cosy classic.', variants: hotIced(158, 168), addOns: 'drink', tone: '#7A5038' }),
  p({ name: 'Matcha Latte', category: 'non-coffee', description: 'Matcha + milk. Earthy, smooth and creamy.', variants: hotIced(168, 178), addOns: 'drink', bestSeller: true, tone: '#97AE62' }),
  p({ name: 'Strawberry Matcha', category: 'non-coffee', description: 'Strawberry + matcha + milk, layered and served iced.', variants: icedOnly(198), addOns: 'drink', bestSeller: true, tone: '#A3B56C' }),
  p({ name: 'Oreo Milk', category: 'non-coffee', description: 'Crushed Oreo + milk, served iced.', variants: icedOnly(168), addOns: 'drink', tone: '#A39C96' }),
  p({ name: 'Choco Pistachio', category: 'non-coffee', description: 'Pistachio sauce + chocolate + milk, served iced.', variants: icedOnly(288), addOns: 'drink', tone: '#9A9456' }),

  // ── COCKTAILS ──────────────────────────────────────────
  p({ name: 'Red Sangria', category: 'cocktails', description: 'Red wine based.', variants: single(189, 'Glass'), alcoholic: true, tone: '#8E2B3A' }),
  p({ name: 'White Sangria', category: 'cocktails', description: 'White wine based.', variants: single(189, 'Glass'), alcoholic: true, tone: '#E9D79A' }),
  p({ name: 'Ichigo Blossom', category: 'cocktails', description: 'Gin & soju based.', variants: single(179, 'Glass'), alcoholic: true, tone: '#EE9BAE' }),
  p({ name: 'Passion Fusion', category: 'cocktails', description: 'Tequila based.', variants: single(179, 'Glass'), alcoholic: true, tone: '#F0B547' }),
  p({ name: 'Blue Lagoon', category: 'cocktails', description: 'Gin based.', variants: single(179, 'Glass'), alcoholic: true, tone: '#4F9FD6' }),
  p({ name: 'Margarita', category: 'cocktails', description: 'Tequila based.', variants: single(179, 'Glass'), alcoholic: true, tone: '#D8E08A' }),

  // ── BEERS & SOJU ───────────────────────────────────────
  p({ name: 'Stella Artois', category: 'beers', description: 'Imported lager, per bottle.', variants: single(220, 'Bottle'), alcoholic: true, tone: '#D9A441' }),
  p({ name: 'Corona Extra', category: 'beers', description: 'Imported lager, per bottle.', variants: single(178, 'Bottle'), alcoholic: true, tone: '#EBC65A' }),
  p({ name: 'Heineken', category: 'beers', description: 'Imported lager, per bottle.', variants: single(168, 'Bottle'), alcoholic: true, tone: '#D9A441' }),
  p({ name: 'Engkanto Lager', category: 'beers', description: 'Craft lager, per bottle.', variants: single(188, 'Bottle'), alcoholic: true, tone: '#E0AE4A' }),
  p({ name: 'Engkanto Hazy IPA', category: 'beers', description: 'Hazy IPA, per bottle.', variants: single(220, 'Bottle'), alcoholic: true, tone: '#E9A23B' }),
  p({ name: 'Soju', category: 'beers', description: 'Per bottle.', variants: single(185, 'Bottle'), alcoholic: true, tone: '#CFE3D4' }),

  // ── SNACKS ─────────────────────────────────────────────
  ...(
    [
      ['Crinkle Fries', 168],
      ['Twister Fries', 178],
      ['Nuggets & Fries', 198],
      ['Mojo', 188],
      ['Potato Chips', 168],
      ['Chicken Poppers', 188],
      ['Nachos', 300],
    ] as const
  ).map(([name, price]) =>
    p({ name, category: 'snacks', description: 'Good for sharing.', variants: single(price), addOns: 'food', tone: '#E2B25A' }),
  ),

  // ── RICE MEALS ─────────────────────────────────────────
  p({ name: 'Chicken Drumellets', category: 'rice-meals', description: 'Steamed rice + brined chicken + garlic mayo.', variants: single(178), addOns: 'food', tone: '#C98B4B' }),
  p({ name: 'Longganisa', category: 'rice-meals', description: 'Fried rice + egg + mixed veggies.', variants: single(188), addOns: 'food', tone: '#B5553A' }),
  p({ name: 'Spam', category: 'rice-meals', description: 'Fried rice + egg + mixed veggies.', variants: single(198), addOns: 'food', tone: '#C77A62' }),
  p({ name: 'Frankfurter', category: 'rice-meals', description: 'Fried rice + egg + mixed veggies.', variants: single(198), addOns: 'food', tone: '#B8643F' }),
  p({ name: 'Liempo', category: 'rice-meals', description: 'Fried rice + egg + mixed veggies.', variants: single(288), addOns: 'food', tone: '#A9603A' }),

  // ── PASTA ──────────────────────────────────────────────
  p({ name: 'Meatball Pasta', category: 'pasta', description: 'Beef meatball + tomato pasta.', variants: single(285), addOns: 'food', tone: '#B5432F' }),
  p({ name: 'Pesto Pasta', category: 'pasta', description: 'Chicken breast + herb pasta.', variants: single(285), addOns: 'food', tone: '#7E9445' }),

  // ── PASTRIES ───────────────────────────────────────────
  ...(
    [
      ['Cheese Roll', 88],
      ['Tuna Melt', 88],
      ['Hamilton', 108],
      ['Flatbread', 168],
      ['Matcha Tiramisu', 188],
      ['Burnt Cheesecake', 228],
      ['Croffles w/ Flavor', 168],
    ] as const
  ).map(([name, price]) =>
    p({ name, category: 'pastries', description: 'Freshly baked — ask our team about today’s batch.', variants: single(price), tone: '#D7A866' }),
  ),
];

/** Homepage best sellers, in the order requested. */
export const BEST_SELLER_IDS = [
  'coffee-spanish-latte',
  'coffee-caramel-macchiato',
  'non-coffee-matcha-latte',
  'non-coffee-strawberry-matcha',
  'blended-coffee-dark-mocha',
  'blended-coffee-golden-hour',
];

export const getProduct = (id: string) => PRODUCTS.find((x) => x.id === id);
export const getCategory = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;
export const getAddOn = (id: string) => ADD_ONS.find((a) => a.id === id);
export const addOnsFor = (product: Product) =>
  product.addOns ? ADD_ONS.filter((a) => a.group === product.addOns) : [];
export const minPrice = (product: Product) => Math.min(...product.variants.map((v) => v.price));
export const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

/** Unique item names for the "What did you order?" dropdown on the review form. */
export const REVIEW_ITEM_OPTIONS = PRODUCTS.map((x) => ({ value: x.name, group: getCategory(x.category).name }));
