/**
 * Shared vocabulary for the image pipeline. Everything here runs in the
 * browser: the files a seller drops in are decoded, processed and re-encoded
 * on their own machine and never travel to a server — see lib/processing/run.ts.
 */

export type OutputFormat = "JPG" | "PNG" | "WebP";
export type QualityPreset = "Small" | "Balanced" | "Best";
export type FitMode = "Contain" | "Fill";
export type BackdropMode = "Transparent" | "White";

/** A decoded upload, ready to draw. `bitmap` is released after processing. */
export type SourceImage = {
  file: File;
  /** Filename without its extension. */
  baseName: string;
  bytes: number;
  width: number;
  height: number;
  bitmap: ImageBitmap;
};

export type OutputFile = {
  name: string;
  blob: Blob;
  width: number;
  height: number;
};

export type QualityFinding = {
  label: string;
  value: string;
  status: "pass" | "warn";
  /** Only set on a warning — what the seller should do about it. */
  hint?: string;
};

export type QualityReport = {
  fileName: string;
  findings: QualityFinding[];
};

export type ProcessResult = {
  outputs: OutputFile[];
  /** Quality Checker is read-only: it reports instead of producing files. */
  reports?: QualityReport[];
};

export type ProcessOptions = {
  marketplaceId: string;
  format: OutputFormat;
  quality: QualityPreset;
  fit: FitMode;
  cropRatio: string;
  backdrop: BackdropMode;
  /** Product size inside the canvas, as a percentage, for centering tools. */
  scale: number;
  /** How aggressively the backdrop flood-fill matches, 0–100. */
  tolerance: number;
  renamePattern: string;
  startNumber: number;
  packIds: string[];
  /** Longest-edge cap for the compressor. 0 keeps the original size. */
  maxEdge: number;
};

export const defaultOptions: ProcessOptions = {
  marketplaceId: "amazon",
  format: "JPG",
  quality: "Balanced",
  fit: "Contain",
  cropRatio: "1:1",
  backdrop: "Transparent",
  scale: 82,
  tolerance: 22,
  renamePattern: "{name}-{index}",
  startNumber: 1,
  packIds: ["amazon", "etsy", "shopify", "ebay"],
  maxEdge: 0,
};

/** Thrown for problems worth showing the seller verbatim. */
export class ProcessingError extends Error {}
