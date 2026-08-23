import {
  AlignCenter,
  CheckCircle2,
  Crop,
  Frame,
  Layers,
  Minimize2,
  Repeat,
  Scissors,
  Square,
  Type,
  type LucideIcon,
} from "lucide-react";

/**
 * The ten tools, and the only place they are defined. The home grid, /tools,
 * the editor rail and every cost estimate read from here — see CLAUDE.md.
 *
 * `name`, `oneLiner` and `cost` are the canonical copy (SPEC.md §3).
 * `display` holds the shorter strings the approved design actually renders,
 * so design-ref/filekit-home.html can be reproduced without editing the spec.
 */
export type Tool = {
  id: number;
  slug: string;
  name: string;
  icon: LucideIcon;
  oneLiner: string;
  /** Token price, expressed as `tokens` per `perImages` images. */
  cost: { tokens: number; perImages: number };
  /** Available from the Seller plan up. */
  sellerPlus?: boolean;
  display: {
    /** Card heading and body in the home tools grid. */
    gridTitle: string;
    gridLine: string;
    /** Label in the editor's left rail, where space is tight. */
    railLabel: string;
  };
};

export const tools: Tool[] = [
  {
    id: 1,
    slug: "marketplace-resize",
    name: "Marketplace Resize",
    icon: Frame,
    oneLiner: "Exact sizes and ratios for Amazon, Etsy, Shopify and eBay.",
    cost: { tokens: 1, perImages: 1 },
    display: {
      gridTitle: "Marketplace Resize",
      gridLine: "Exact sizes and ratios for every storefront.",
      railLabel: "Marketplace Resize",
    },
  },
  {
    id: 2,
    slug: "image-compressor",
    name: "Image Compressor",
    icon: Minimize2,
    oneLiner: "Smaller files, same visible quality.",
    cost: { tokens: 1, perImages: 1 },
    display: {
      gridTitle: "Image Compressor",
      gridLine: "Smaller files, same visible quality.",
      railLabel: "Compressor",
    },
  },
  {
    id: 3,
    slug: "image-converter",
    name: "Image Converter",
    icon: Repeat,
    oneLiner: "Convert between JPG, PNG, WebP and HEIC.",
    cost: { tokens: 1, perImages: 1 },
    display: {
      gridTitle: "Image Converter",
      gridLine: "JPG, PNG, WebP and HEIC.",
      railLabel: "Converter",
    },
  },
  {
    id: 4,
    slug: "background-remover",
    name: "Background Remover",
    icon: Scissors,
    oneLiner: "Cut the product out of any background.",
    cost: { tokens: 2, perImages: 1 },
    display: {
      gridTitle: "Background Remover",
      gridLine: "Cut the product out of any background.",
      railLabel: "Remove Background",
    },
  },
  {
    id: 5,
    slug: "white-background",
    name: "White Background",
    icon: Square,
    oneLiner: "Clean white backdrop that passes listing rules.",
    cost: { tokens: 2, perImages: 1 },
    display: {
      gridTitle: "White Background",
      gridLine: "Clean backdrop that passes listing rules.",
      railLabel: "White Background",
    },
  },
  {
    id: 6,
    slug: "product-centering",
    name: "Product Centering",
    icon: AlignCenter,
    oneLiner: "Place the product dead center on the canvas.",
    cost: { tokens: 1, perImages: 1 },
    display: {
      gridTitle: "Product Centering",
      gridLine: "Place the product dead center on the canvas.",
      railLabel: "Center Product",
    },
  },
  {
    id: 7,
    slug: "smart-crop",
    name: "Smart Crop",
    icon: Crop,
    oneLiner: "Crop to the ratio your storefront expects.",
    cost: { tokens: 1, perImages: 1 },
    display: {
      gridTitle: "Smart Crop",
      gridLine: "Crop to the ratio your storefront expects.",
      railLabel: "Smart Crop",
    },
  },
  {
    id: 8,
    slug: "bulk-rename",
    name: "Bulk Rename",
    icon: Type,
    oneLiner: "Rename whole batches into clean listing filenames.",
    cost: { tokens: 1, perImages: 10 },
    display: {
      gridTitle: "Bulk Rename",
      gridLine: "Whole batches into clean listing filenames.",
      railLabel: "Bulk Rename",
    },
  },
  {
    id: 9,
    slug: "quality-checker",
    name: "Image Quality Checker",
    icon: CheckCircle2,
    oneLiner: "Catch size, ratio and resolution problems before upload.",
    cost: { tokens: 1, perImages: 5 },
    display: {
      gridTitle: "Quality Checker",
      gridLine: "Catch problems before you upload.",
      railLabel: "Quality Check",
    },
  },
  {
    id: 10,
    slug: "marketplace-pack",
    name: "Marketplace Pack",
    icon: Layers,
    oneLiner: "One upload, a ready set for every storefront you sell on.",
    cost: { tokens: 3, perImages: 1 },
    sellerPlus: true,
    display: {
      gridTitle: "Marketplace Pack",
      gridLine: "One upload, a ready set for every storefront.",
      railLabel: "Marketplace Pack",
    },
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/** "1 token / image", "2 tokens / image", "1 token / 10 images". */
export function costLabel({ tokens, perImages }: Tool["cost"]): string {
  const unit = tokens === 1 ? "token" : "tokens";
  const target = perImages === 1 ? "image" : `${perImages} images`;
  return `${tokens} ${unit} / ${target}`;
}

/** Example output filename shown by Bulk Rename (SPEC.md §3). */
export const bulkRenameExample = "black-leather-wallet-01.jpg";
