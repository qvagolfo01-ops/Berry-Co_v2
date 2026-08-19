export const CATEGORIES = [
  "Cards",
  "Figurines",
  "Accessories",
  "Collectibles",
] as const;

export type Category = (typeof CATEGORIES)[number];