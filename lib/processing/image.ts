import {
  ProcessingError,
  type FitMode,
  type OutputFormat,
  type QualityPreset,
  type SourceImage,
} from "@/lib/processing/types";

export const MIME: Record<OutputFormat, string> = {
  JPG: "image/jpeg",
  PNG: "image/png",
  WebP: "image/webp",
};

export const EXTENSION: Record<OutputFormat, string> = {
  JPG: "jpg",
  PNG: "png",
  WebP: "webp",
};

/** Encoder quality per preset. PNG ignores these — it is lossless. */
const QUALITY_VALUE: Record<QualityPreset, number> = {
  Small: 0.5,
  Balanced: 0.78,
  Best: 0.92,
};

export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, "");
}

/**
 * Decodes one upload. HEIC is the notable gap: only Safari ships a decoder,
 * so Chrome and Firefox reject those files here rather than halfway through
 * a batch — the message names the file so the seller knows which to convert.
 */
export async function decodeImage(file: File): Promise<SourceImage> {
  let bitmap: ImageBitmap;
  try {
    // `from-image` honours the EXIF orientation phones write, so portrait
    // shots do not come out sideways. Not every engine accepts the options
    // argument, hence the plain retry.
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(file);
    }
  } catch {
    const heic = /\.(heic|heif)$/i.test(file.name);
    throw new ProcessingError(
      heic
        ? `${file.name} is a HEIC photo, which only Safari can open. Export it as JPG first, or use Safari.`
        : `${file.name} could not be opened — it may be damaged or an unsupported format.`,
    );
  }

  return {
    file,
    baseName: stripExtension(file.name),
    bytes: file.size,
    width: bitmap.width,
    height: bitmap.height,
    bitmap,
  };
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const context = canvas.getContext("2d");
  if (!context) throw new ProcessingError("This browser blocked the canvas needed to process images.");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return { canvas, context };
}

export function encode(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: QualityPreset,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new ProcessingError(`This browser could not write a ${format} file.`));
      },
      MIME[format],
      QUALITY_VALUE[quality],
    );
  });
}

/**
 * JPEG has no alpha channel, so anything transparent would encode as black.
 * Every JPG output is flattened onto white first — which is also what the
 * marketplaces want a product backdrop to be.
 */
export function fillBackdrop(
  context: CanvasRenderingContext2D,
  format: OutputFormat,
  transparent: boolean,
  color = "#FFFFFF",
) {
  if (transparent && format !== "JPG") return;
  context.save();
  context.fillStyle = color;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  context.restore();
}

type Drawable = CanvasImageSource & { width: number; height: number };

/**
 * Draws `image` into a frame of the given size.
 *
 * `Contain` fits the whole product inside and leaves margin — the safe choice
 * for a listing, since nothing gets cut off. `Fill` covers the frame and crops
 * the overflow evenly from both sides.
 */
export function drawFitted(
  context: CanvasRenderingContext2D,
  image: Drawable,
  frameWidth: number,
  frameHeight: number,
  mode: FitMode,
  /** Fraction of the frame kept empty around the product, 0–0.4. */
  margin = 0,
) {
  const inset = Math.min(0.4, Math.max(0, margin));
  const boxWidth = frameWidth * (1 - inset * 2);
  const boxHeight = frameHeight * (1 - inset * 2);

  const ratio =
    mode === "Fill"
      ? Math.max(frameWidth / image.width, frameHeight / image.height)
      : Math.min(boxWidth / image.width, boxHeight / image.height);

  const width = image.width * ratio;
  const height = image.height * ratio;

  context.drawImage(
    image,
    (frameWidth - width) / 2,
    (frameHeight - height) / 2,
    width,
    height,
  );
}

/** Parses "4:5" into 0.8. Falls back to square on anything unexpected. */
export function ratioValue(ratio: string): number {
  const [width, height] = ratio.split(":").map(Number);
  if (!width || !height) return 1;
  return width / height;
}

export function readPixels(image: Drawable, width: number, height: number) {
  const { canvas, context } = createCanvas(width, height);
  context.drawImage(image, 0, 0, width, height);
  return { canvas, context, data: context.getImageData(0, 0, canvas.width, canvas.height) };
}

/** "2.4 MB", "812 KB" — matches the sizes shown elsewhere in the UI. */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
