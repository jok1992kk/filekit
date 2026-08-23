/**
 * One-off token packs (SPEC.md §4). Purchased tokens never expire and are
 * spent only after the plan's monthly tokens run out.
 */
export type PackId = "p100" | "p250" | "p500" | "p1000" | "p2500" | "p5000";

export type TokenPack = {
  id: PackId;
  tokens: number;
  price: number;
  badge?: string;
};

export const tokenPacks: TokenPack[] = [
  { id: "p100", tokens: 100, price: 4.99 },
  { id: "p250", tokens: 250, price: 9.99 },
  { id: "p500", tokens: 500, price: 17.99 },
  { id: "p1000", tokens: 1000, price: 33.99, badge: "Most Popular" },
  { id: "p2500", tokens: 2500, price: 79.99, badge: "Best value" },
  { id: "p5000", tokens: 5000, price: 149.99 },
];

/** The 100-token pack is the baseline every "Save X%" is measured against. */
const basePack = tokenPacks[0];

export function pricePerToken(pack: TokenPack): number {
  return pack.price / pack.tokens;
}

/** "$0.030 per token" — three decimals, as in the spec's table. */
export function pricePerTokenLabel(pack: TokenPack): string {
  return `$${pricePerToken(pack).toFixed(3)} per token`;
}

/** Whole-percent saving against the 100-token pack, or null for the baseline. */
export function savingPercent(pack: TokenPack): number | null {
  if (pack.id === basePack.id) return null;
  const saving = 1 - pricePerToken(pack) / pricePerToken(basePack);
  return Math.round(saving * 100);
}

export const packsFineprint = "Purchased tokens never expire.";
