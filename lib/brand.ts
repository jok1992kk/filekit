/**
 * The single place that knows what this product is called. A rebrand is an
 * edit to this file and nothing else — see CLAUDE.md.
 */
export const brand = {
  name: "WareSnap",
  domain: "waresnap.online",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://waresnap.online",
  tagline: "Every product photo, ready to list.",
  description:
    "Resize, optimize and prepare product photos for Amazon, Etsy, Shopify and eBay.",
} as const;

/** Header navigation, in the order the approved design lists it. Tools,
 * Pricing and Examples point at their standalone pages now that Stage 6
 * built them; FAQ stays a same-page anchor since there's no dedicated page. */
export const primaryNav = [
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: "/examples", label: "Examples" },
  { href: "/#faq", label: "FAQ" },
] as const;

/** The storefronts WareSnap prepares images for, with their target sizes.
 * Real published specs, not rounded guesses — see sources in SPEC.md §3. */
export const marketplaces = [
  { id: "amazon", name: "Amazon", width: 2000, height: 2000, ratio: "1:1" },
  { id: "etsy", name: "Etsy", width: 2000, height: 1600, ratio: "5:4" },
  { id: "shopify", name: "Shopify", width: 2048, height: 2048, ratio: "1:1" },
  { id: "ebay", name: "eBay", width: 1600, height: 1600, ratio: "1:1" },
  { id: "walmart", name: "Walmart", width: 2000, height: 2000, ratio: "1:1" },
  { id: "tiktok-shop", name: "TikTok Shop", width: 1000, height: 1000, ratio: "1:1" },
  { id: "poshmark", name: "Poshmark", width: 1200, height: 1200, ratio: "1:1" },
  { id: "depop", name: "Depop", width: 1080, height: 1080, ratio: "1:1" },
  { id: "mercari", name: "Mercari", width: 1200, height: 1500, ratio: "4:5" },
] as const;

export type Marketplace = (typeof marketplaces)[number];
