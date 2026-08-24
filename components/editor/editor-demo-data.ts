export type EditorSample = {
  id: string;
  brand: string;
  src: string;
  readySrc: string;
  alt: string;
  name: string;
  meta: string;
  readyMeta: string;
};

/**
 * Purpose-built demo photography. Each tool opens on a sample that makes its
 * job immediately legible instead of reusing one generic wallet everywhere.
 */
export const editorSamples: EditorSample[] = [
  {
    id: "rove-merch",
    brand: "ROVE merch set",
    src: "/brand/rove-merch.webp",
    readySrc: "/brand/rove-merch.webp",
    alt: "ROVE outdoor merchandise flat lay",
    name: "ROVE_merch_flatlay.HEIC",
    meta: "4,032 × 4,032 · 5.8 MB",
    readyMeta: "2,000 × 2,000 · 682 KB",
  },
  {
    id: "rove-cap",
    brand: "ROVE trail cap",
    src: "/brand/rove-cap-original.webp",
    readySrc: "/brand/rove-cap-cutout.webp",
    alt: "ROVE sage green outdoor cap",
    name: "ROVE_cap_trail.HEIC",
    meta: "4,032 × 4,032 · 4.6 MB",
    readyMeta: "2,000 × 2,000 · 516 KB",
  },
  {
    id: "mela-serum",
    brand: "MELA serum",
    src: "/brand/mela-serum-original.webp",
    readySrc: "/brand/mela-serum-ready.webp",
    alt: "MELA peach serum bottle",
    name: "MELA_serum_launch.HEIC",
    meta: "3,024 × 4,032 · 4.2 MB",
    readyMeta: "2,000 × 2,000 · 438 KB",
  },
  {
    id: "noon-coffee",
    brand: "NOON coffee",
    src: "/brand/noon-coffee-original.webp",
    readySrc: "/brand/noon-coffee-ready.webp",
    alt: "NOON coffee bag and ceramic cup",
    name: "NOON_morning_01.HEIC",
    meta: "4,032 × 4,032 · 5.1 MB",
    readyMeta: "2,000 × 2,000 · 604 KB",
  },
  {
    id: "wallet",
    brand: "Leather wallet",
    src: "/generated/wallet-original.webp",
    readySrc: "/generated/wallet-ready.webp",
    alt: "Leather wallet product photo",
    name: "wallet_front_01.HEIC",
    meta: "3,024 × 4,032 · 4.1 MB",
    readyMeta: "2,000 × 2,000 · 390 KB",
  },
  {
    id: "ring",
    brand: "Gold ring",
    src: "/generated/ring-original.webp",
    readySrc: "/generated/ring-ready.webp",
    alt: "Gold ring product photo",
    name: "ring_detail_01.HEIC",
    meta: "3,024 × 4,032 · 2.9 MB",
    readyMeta: "2,048 × 2,048 · 312 KB",
  },
];

export const defaultSampleByTool: Record<string, string> = {
  "marketplace-resize": "mela-serum",
  "image-compressor": "rove-merch",
  "image-converter": "rove-cap",
  "background-remover": "rove-cap",
  "white-background": "mela-serum",
  "product-centering": "mela-serum",
  "smart-crop": "rove-cap",
  "bulk-rename": "rove-merch",
  "quality-checker": "noon-coffee",
  "marketplace-pack": "noon-coffee",
};

export const readyMessageByTool: Record<string, string> = {
  "marketplace-resize": "Marketplace size ready",
  "image-compressor": "85% smaller, visually unchanged",
  "image-converter": "Converted and ready to export",
  "background-remover": "Background removed cleanly",
  "white-background": "Marketplace-white background ready",
  "product-centering": "Product centered with safe margins",
  "smart-crop": "Subject-safe crops created",
  "bulk-rename": "6 files renamed consistently",
  "quality-checker": "Quality report complete",
  "marketplace-pack": "9 storefront files packaged",
};

export const actionLabelByTool: Record<string, string> = {
  "marketplace-resize": "Resize for Marketplace",
  "image-compressor": "Compress Image",
  "image-converter": "Convert File",
  "background-remover": "Remove Background",
  "white-background": "Make Background White",
  "product-centering": "Center Product",
  "smart-crop": "Create Smart Crops",
  "bulk-rename": "Rename Batch",
  "quality-checker": "Run Quality Check",
  "marketplace-pack": "Build Marketplace Pack",
};
