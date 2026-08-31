import { marketplaces } from "@/lib/brand";
import { contentBounds, removeBackdrop } from "@/lib/processing/background";
import {
  createCanvas,
  drawFitted,
  encode,
  EXTENSION,
  fillBackdrop,
  ratioValue,
  readPixels,
} from "@/lib/processing/image";
import {
  ProcessingError,
  type OutputFile,
  type OutputFormat,
  type ProcessOptions,
  type ProcessResult,
  type QualityFinding,
  type SourceImage,
} from "@/lib/processing/types";

/** Browsers refuse canvases past roughly 16k on a side; stay well clear. */
const MAX_EDGE = 8000;

function marketplaceById(id: string) {
  return marketplaces.find((item) => item.id === id) ?? marketplaces[0];
}

function nameFor(base: string, format: OutputFormat, suffix?: string): string {
  const tail = suffix ? `-${suffix}` : "";
  return `${base}${tail}.${EXTENSION[format]}`;
}

/** Lets React paint the progress bar between images. */
function yieldToUi(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Draws a source into a fresh frame and encodes it in one step. */
async function renderFrame(
  source: SourceImage,
  frameWidth: number,
  frameHeight: number,
  options: ProcessOptions,
  format: OutputFormat,
  { margin = 0, transparent = false } = {},
): Promise<{ blob: Blob; width: number; height: number }> {
  const { canvas, context } = createCanvas(frameWidth, frameHeight);
  fillBackdrop(context, format, transparent);
  drawFitted(context, source.bitmap, canvas.width, canvas.height, options.fit, margin);
  const blob = await encode(canvas, format, options.quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/** Runs the flood-fill cut-out and hands back a canvas with alpha applied. */
function cutOut(source: SourceImage, tolerance: number) {
  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const { canvas, context, data } = readPixels(source.bitmap, width, height);
  const { coverage } = removeBackdrop(data, tolerance);
  context.putImageData(data, 0, 0);
  return { canvas, data, coverage };
}

function checkQuality(source: SourceImage, options: ProcessOptions): QualityFinding[] {
  const target = marketplaceById(options.marketplaceId);
  const findings: QualityFinding[] = [];

  const shortest = Math.min(source.width, source.height);
  const required = Math.min(target.width, target.height);
  findings.push(
    shortest >= required
      ? { label: "Resolution", value: `${source.width} × ${source.height}`, status: "pass" }
      : {
          label: "Resolution",
          value: `${source.width} × ${source.height}`,
          status: "warn",
          hint: `${target.name} wants at least ${target.width} × ${target.height}. Upscaling loses detail — reshoot if you can.`,
        },
  );

  const actual = source.width / source.height;
  const wanted = target.width / target.height;
  const drift = Math.abs(actual - wanted) / wanted;
  findings.push(
    drift <= 0.02
      ? { label: "Aspect ratio", value: target.ratio, status: "pass" }
      : {
          label: "Aspect ratio",
          value: `${actual.toFixed(2)}:1`,
          status: "warn",
          hint: `${target.name} lists at ${target.ratio}. Smart Crop or Marketplace Resize will fix this.`,
        },
  );

  const megabytes = source.bytes / 1024 / 1024;
  findings.push(
    megabytes <= 10
      ? { label: "File size", value: `${megabytes.toFixed(1)} MB`, status: "pass" }
      : {
          label: "File size",
          value: `${megabytes.toFixed(1)} MB`,
          status: "warn",
          hint: "Most storefronts reject uploads over 10 MB. Run the Image Compressor.",
        },
  );

  const type = source.file.type || "unknown";
  const supported = ["image/jpeg", "image/png", "image/webp"].includes(type);
  findings.push(
    supported
      ? { label: "Format", value: type.replace("image/", "").toUpperCase(), status: "pass" }
      : {
          label: "Format",
          value: type.replace("image/", "").toUpperCase() || "Unknown",
          status: "warn",
          hint: "Convert to JPG or PNG before listing — storefronts reject anything else.",
        },
  );

  return findings;
}

/**
 * Runs one tool across every uploaded image.
 *
 * Each tool returns finished files; the caller zips them when there is more
 * than one. Quality Checker is the exception — it reports and writes nothing,
 * which is what its "never changes your source files" promise means.
 */
export async function runTool(
  toolSlug: string,
  sources: SourceImage[],
  options: ProcessOptions,
  onProgress?: (completed: number, total: number) => void,
): Promise<ProcessResult> {
  if (sources.length === 0) throw new ProcessingError("Add at least one photo first.");

  const outputs: OutputFile[] = [];
  const target = marketplaceById(options.marketplaceId);
  let completed = 0;

  const advance = async () => {
    completed += 1;
    onProgress?.(completed, sources.length);
    await yieldToUi();
  };

  if (toolSlug === "quality-checker") {
    const reports = sources.map((source) => ({
      fileName: source.file.name,
      findings: checkQuality(source, options),
    }));
    onProgress?.(sources.length, sources.length);
    return { outputs: [], reports };
  }

  if (toolSlug === "bulk-rename") {
    // Renaming re-encodes nothing: the original bytes are copied straight
    // through, so a rename never costs image quality.
    sources.forEach((source, index) => {
      const extension = source.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const number = String(options.startNumber + index).padStart(2, "0");
      const resolved = options.renamePattern
        .replace(/\{name\}/gi, source.baseName)
        .replace(/\{index\}/gi, number)
        .replace(/\{marketplace\}/gi, target.id)
        .replace(/\{date\}/gi, new Date().toISOString().slice(0, 10))
        .replace(/[/\\:*?"<>|]/g, "")
        .trim();

      outputs.push({
        name: `${resolved || `${source.baseName}-${number}`}.${extension}`,
        blob: source.file,
        width: source.width,
        height: source.height,
      });
    });
    onProgress?.(sources.length, sources.length);
    return { outputs };
  }

  for (const source of sources) {
    if (toolSlug === "marketplace-resize") {
      const frame = await renderFrame(source, target.width, target.height, options, options.format);
      outputs.push({ name: nameFor(source.baseName, options.format, target.id), ...frame });
    }

    if (toolSlug === "marketplace-pack") {
      const chosen = options.packIds.length > 0 ? options.packIds : [target.id];
      for (const id of chosen) {
        const store = marketplaceById(id);
        const frame = await renderFrame(source, store.width, store.height, options, options.format);
        outputs.push({
          // Foldered by storefront so the ZIP unpacks into ready-to-upload sets.
          name: `${store.name}/${nameFor(source.baseName, options.format)}`,
          ...frame,
        });
      }
    }

    if (toolSlug === "image-compressor") {
      const cap = options.maxEdge > 0 ? options.maxEdge : MAX_EDGE;
      const scale = Math.min(1, cap / Math.max(source.width, source.height));
      const width = Math.round(source.width * scale);
      const height = Math.round(source.height * scale);

      const { canvas, context } = createCanvas(width, height);
      fillBackdrop(context, options.format, false);
      context.drawImage(source.bitmap, 0, 0, width, height);
      const blob = await encode(canvas, options.format, options.quality);
      outputs.push({ name: nameFor(source.baseName, options.format), blob, width, height });
    }

    if (toolSlug === "image-converter") {
      const { canvas, context } = createCanvas(source.width, source.height);
      fillBackdrop(context, options.format, true);
      context.drawImage(source.bitmap, 0, 0);
      const blob = await encode(canvas, options.format, options.quality);
      outputs.push({
        name: nameFor(source.baseName, options.format),
        blob,
        width: source.width,
        height: source.height,
      });
    }

    if (toolSlug === "smart-crop") {
      const ratio = ratioValue(options.cropRatio);
      const sourceRatio = source.width / source.height;

      // Take the largest rectangle of the wanted shape that still fits, then
      // centre it — the product is nearly always mid-frame in a product shot.
      const cropWidth = sourceRatio > ratio ? source.height * ratio : source.width;
      const cropHeight = sourceRatio > ratio ? source.height : source.width / ratio;

      const { canvas, context } = createCanvas(cropWidth, cropHeight);
      fillBackdrop(context, options.format, true);
      context.drawImage(
        source.bitmap,
        (source.width - cropWidth) / 2,
        (source.height - cropHeight) / 2,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const blob = await encode(canvas, options.format, options.quality);
      outputs.push({
        name: nameFor(source.baseName, options.format, options.cropRatio.replace(":", "x")),
        blob,
        width: canvas.width,
        height: canvas.height,
      });
    }

    if (toolSlug === "background-remover") {
      const transparent = options.backdrop === "Transparent";
      const format: OutputFormat = transparent ? "PNG" : options.format;
      const { canvas: cut } = cutOut(source, options.tolerance);

      const { canvas, context } = createCanvas(cut.width, cut.height);
      fillBackdrop(context, format, transparent);
      context.drawImage(cut, 0, 0);
      const blob = await encode(canvas, format, options.quality);
      outputs.push({
        name: nameFor(source.baseName, format, "cutout"),
        blob,
        width: canvas.width,
        height: canvas.height,
      });
    }

    if (toolSlug === "white-background") {
      // Cut the old backdrop away, then re-seat the product on pure white at
      // the size the marketplace rules ask for.
      const { canvas: cut, data } = cutOut(source, options.tolerance);
      const bounds = contentBounds(data, options.tolerance);
      const side = Math.max(target.width, target.height);

      const { canvas, context } = createCanvas(side, side);
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, side, side);

      const box = side * (options.scale / 100);
      const ratio = Math.min(box / bounds.width, box / bounds.height);
      const width = bounds.width * ratio;
      const height = bounds.height * ratio;
      context.drawImage(
        cut,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        (side - width) / 2,
        (side - height) / 2,
        width,
        height,
      );

      const format = options.format === "PNG" ? "PNG" : options.format;
      const blob = await encode(canvas, format, options.quality);
      outputs.push({
        name: nameFor(source.baseName, format, "white"),
        blob,
        width: side,
        height: side,
      });
    }

    if (toolSlug === "product-centering") {
      const { canvas: cut, data } = cutOut(source, options.tolerance);
      const bounds = contentBounds(data, options.tolerance);
      const transparent = options.backdrop === "Transparent";
      const format: OutputFormat = transparent ? "PNG" : options.format;

      const side = Math.max(source.width, source.height);
      const { canvas, context } = createCanvas(side, side);
      fillBackdrop(context, format, transparent);

      const box = side * (options.scale / 100);
      const ratio = Math.min(box / bounds.width, box / bounds.height);
      const width = bounds.width * ratio;
      const height = bounds.height * ratio;
      context.drawImage(
        cut,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        (side - width) / 2,
        (side - height) / 2,
        width,
        height,
      );

      const blob = await encode(canvas, format, options.quality);
      outputs.push({
        name: nameFor(source.baseName, format, "centered"),
        blob,
        width: side,
        height: side,
      });
    }

    await advance();
  }

  if (outputs.length === 0) {
    throw new ProcessingError("That tool is not available yet.");
  }

  return { outputs };
}
