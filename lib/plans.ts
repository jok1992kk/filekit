/**
 * Subscription plans as data, never in JSX — see CLAUDE.md.
 *
 * `features` is the condensed list the approved design renders on the home
 * page; `featuresFull` is the complete list from SPEC.md §5, for /pricing.
 */
export type PlanId = "starter" | "seller" | "pro";
export type BillingCycle = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  price: Record<BillingCycle, number>;
  monthlyTokens: number;
  cta: string;
  badge?: string;
  featured?: boolean;
  features: string[];
  featuresFull: string[];
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: { monthly: 5.99, yearly: 45.99 },
    monthlyTokens: 100,
    cta: "Start with Starter",
    features: [
      "All 10 tools",
      "Up to 20 images per batch",
      "Amazon, Etsy, Shopify and eBay presets",
      "7-day file history",
    ],
    featuresFull: [
      "100 monthly tokens",
      "All 10 tools",
      "Up to 20 images per batch",
      "Amazon, Etsy, Shopify and eBay presets",
      "Standard processing",
      "7-day file history",
    ],
  },
  {
    id: "seller",
    name: "Seller",
    price: { monthly: 12.99, yearly: 99.99 },
    monthlyTokens: 350,
    cta: "Choose Seller",
    badge: "Most Popular",
    featured: true,
    features: [
      "Everything in Starter",
      "Up to 100 images per batch",
      "Marketplace Pack and saved presets",
      "Bulk rename",
      "30-day file history, faster processing",
    ],
    featuresFull: [
      "350 monthly tokens",
      "Everything in Starter",
      "Up to 100 images per batch",
      "Marketplace Pack",
      "Saved presets",
      "Bulk rename",
      "30-day file history",
      "Faster processing",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 24.99, yearly: 189.99 },
    monthlyTokens: 1000,
    cta: "Go Pro",
    features: [
      "Everything in Seller",
      "Up to 500 images per batch",
      "Unlimited saved presets",
      "90-day history, priority processing",
    ],
    featuresFull: [
      "1,000 monthly tokens",
      "Everything in Seller",
      "Up to 500 images per batch",
      "Unlimited saved presets",
      "Larger bulk processing",
      "90-day file history",
      "Priority processing",
    ],
  },
];

export const cycleLabels: Record<BillingCycle, string> = {
  monthly: "Monthly",
  yearly: "Yearly · 2 months free",
};

export const perLabels: Record<BillingCycle, string> = {
  monthly: "/month",
  yearly: "/year",
};

/** What a yearly plan works out to per month. */
export function yearlyPerMonth(plan: Plan): number {
  return plan.price.yearly / 12;
}

export const pricingFineprint =
  "Cancel anytime. Extra tokens available on every plan — purchased tokens never expire.";

/** Shown on /pricing (SPEC.md §4). */
export const freeTokensLine = "Every account starts with 25 free tokens.";

export const SIGNUP_FREE_TOKENS = 25;

export function getPlan(id: PlanId): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}

/** How many subscription tokens a plan grants each cycle. `free` gets the
 * signup bonus and nothing more, so its allowance is that same number. */
export function monthlyAllowanceFor(plan: PlanId | "free"): number {
  if (plan === "free") return SIGNUP_FREE_TOKENS;
  return getPlan(plan)?.monthlyTokens ?? SIGNUP_FREE_TOKENS;
}

export function planLabel(plan: PlanId | "free"): string {
  if (plan === "free") return "Free";
  return getPlan(plan)?.name ?? "Free";
}
