/**
 * The five standalone tool landing pages at /tools/[slug] (CODE-PROMPTS.md
 * Stage 6) — one template, data-driven, same as every other list in this
 * project. `toolSlug` points at the `lib/tools.ts` entry the page demos;
 * `marketplaceId` presets the editor for the marketplace-flavoured pages.
 */
import { getTool, tools } from "@/lib/tools";

export type ToolPageEntry = {
  slug: string;
  title: string;
  metaDescription: string;
  intro: string;
  toolSlug: string;
  marketplaceId?: string;
};

export const toolPages: ToolPageEntry[] = [
  {
    slug: "amazon-image-resizer",
    title: "Amazon Image Resizer",
    metaDescription:
      "Resize product photos to Amazon's 2000 × 2000 listing requirement in seconds.",
    intro:
      "Amazon expects a clean 2000 × 2000 square with the product filling most of the frame. Drop in your photos and WareSnap resizes and pads them to spec automatically.",
    toolSlug: "marketplace-resize",
    marketplaceId: "amazon",
  },
  {
    slug: "etsy-image-resizer",
    title: "Etsy Image Resizer",
    metaDescription:
      "Resize product photos to Etsy's 2000 × 1600 listing ratio in seconds.",
    intro:
      "Etsy listings look best at a 5:4 ratio, 2000 × 1600. WareSnap crops and resizes your existing photos to that frame without you opening an editor.",
    toolSlug: "marketplace-resize",
    marketplaceId: "etsy",
  },
  {
    slug: "shopify-image-optimizer",
    title: "Shopify Image Optimizer",
    metaDescription:
      "Resize and compress product photos for a fast-loading Shopify storefront.",
    intro:
      "Shopify wants a square 2048 × 2048 image that still loads fast. WareSnap resizes to spec and keeps the file small, so your storefront stays quick.",
    toolSlug: "marketplace-resize",
    marketplaceId: "shopify",
  },
  {
    slug: "image-compressor",
    title: "Image Compressor",
    metaDescription:
      "Shrink product photo file sizes without a visible drop in quality.",
    intro:
      "Big camera files slow down every storefront that has to load them. WareSnap compresses each photo down to a fraction of the size, with no visible loss in quality.",
    toolSlug: "image-compressor",
  },
  {
    slug: "background-remover",
    title: "Background Remover",
    metaDescription:
      "Cut your product out of any background and drop it on a clean canvas.",
    intro:
      "A cluttered background is the fastest way to get a listing photo rejected. WareSnap lifts the product out cleanly, ready for a white or transparent backdrop.",
    toolSlug: "background-remover",
    marketplaceId: "amazon",
  },
];

export function getToolPage(slug: string): ToolPageEntry | undefined {
  return toolPages.find((page) => page.slug === slug);
}

/** Up to three other tools to cross-link from a landing page, in tools.ts order. */
export function relatedTools(excludeToolSlug: string, count = 3) {
  const linked = toolPages
    .map((page) => page.toolSlug)
    .filter((slug, index, all) => all.indexOf(slug) === index && slug !== excludeToolSlug)
    .map((slug) => getTool(slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  // Pad with tools that have no landing page yet, so every page still shows
  // a full row of related tools.
  const unlinked = tools.filter(
    (tool) =>
      tool.slug !== excludeToolSlug &&
      !toolPages.some((page) => page.toolSlug === tool.slug),
  );

  return [...linked, ...unlinked].slice(0, count);
}

/** The landing-page slug for a tool, if it has one. */
export function landingSlugFor(toolSlug: string): string | undefined {
  return toolPages.find((page) => page.toolSlug === toolSlug)?.slug;
}
