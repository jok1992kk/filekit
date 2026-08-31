/**
 * Backdrop removal, done with a flood fill from the edges rather than a
 * global colour key.
 *
 * The distinction matters for product photos: a global key would also punch
 * holes through every white highlight *inside* the product — the label on a
 * bottle, the sole of a shoe. Filling inward from the border only ever eats
 * pixels that are actually connected to the outside, so the product stays
 * whole.
 *
 * This is built for the studio-style shots sellers actually list with: one
 * product on a plain, evenly lit backdrop. A busy or cluttered background is
 * outside what a flood fill can judge, and `coverage` reports back how much
 * was removed so the caller can tell the seller when the result is suspect.
 */

/** How far a pixel may sit from the sampled backdrop and still count as it. */
function threshold(tolerancePercent: number): number {
  return Math.max(6, Math.min(100, tolerancePercent)) * 1.9;
}

function distance(
  data: Uint8ClampedArray,
  index: number,
  red: number,
  green: number,
  blue: number,
): number {
  const dr = data[index] - red;
  const dg = data[index + 1] - green;
  const db = data[index + 2] - blue;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** Averages the one-pixel border ring — the backdrop, on a normal product shot. */
function sampleBackdrop(data: ImageData) {
  const { width, height, data: pixels } = data;
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  const sample = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    if (pixels[index + 3] < 8) return;
    red += pixels[index];
    green += pixels[index + 1];
    blue += pixels[index + 2];
    count += 1;
  };

  for (let x = 0; x < width; x += 1) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    sample(0, y);
    sample(width - 1, y);
  }

  if (count === 0) return { red: 255, green: 255, blue: 255 };
  return {
    red: Math.round(red / count),
    green: Math.round(green / count),
    blue: Math.round(blue / count),
  };
}

export type BackdropResult = {
  /** Share of the image cleared, 0–1. Near 0 means nothing matched. */
  coverage: number;
};

/**
 * Clears the backdrop in place, leaving the product opaque.
 *
 * Runs in two passes: a hard flood fill, then a softening pass that gives
 * partial alpha to the ring of pixels just outside the tolerance. Without the
 * second pass every cut-out has a jagged, obviously-keyed edge.
 */
export function removeBackdrop(image: ImageData, tolerancePercent: number): BackdropResult {
  const { width, height, data } = image;
  const total = width * height;
  const limit = threshold(tolerancePercent);
  const { red, green, blue } = sampleBackdrop(image);

  const cleared = new Uint8Array(total);
  // Explicit stack of pixel indices. A recursive fill blows the call stack
  // on anything larger than a thumbnail.
  let stack = new Int32Array(Math.min(total, 1 << 16));
  let top = 0;

  const push = (pixel: number) => {
    if (top === stack.length) {
      const grown = new Int32Array(Math.min(total, stack.length * 2));
      grown.set(stack);
      stack = grown;
    }
    stack[top] = pixel;
    top += 1;
  };

  const consider = (pixel: number) => {
    if (cleared[pixel]) return;
    if (distance(data, pixel * 4, red, green, blue) > limit) return;
    cleared[pixel] = 1;
    push(pixel);
  };

  for (let x = 0; x < width; x += 1) {
    consider(x);
    consider((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    consider(y * width);
    consider(y * width + width - 1);
  }

  let removed = 0;
  while (top > 0) {
    top -= 1;
    const pixel = stack[top];
    const x = pixel % width;
    const y = (pixel - x) / width;

    data[pixel * 4 + 3] = 0;
    removed += 1;

    if (x > 0) consider(pixel - 1);
    if (x < width - 1) consider(pixel + 1);
    if (y > 0) consider(pixel - width);
    if (y < height - 1) consider(pixel + width);
  }

  // Soften: anything still opaque but touching a cleared pixel gets alpha
  // scaled by how close it is to the backdrop, which reads as an antialiased
  // edge instead of a cut-out with stair steps.
  const soft = limit * 2;
  for (let pixel = 0; pixel < total; pixel += 1) {
    if (cleared[pixel]) continue;

    const x = pixel % width;
    const y = (pixel - x) / width;
    const touching =
      (x > 0 && cleared[pixel - 1]) ||
      (x < width - 1 && cleared[pixel + 1]) ||
      (y > 0 && cleared[pixel - width]) ||
      (y < height - 1 && cleared[pixel + width]);
    if (!touching) continue;

    const spread = distance(data, pixel * 4, red, green, blue);
    if (spread >= soft) continue;
    const alpha = Math.round(((spread - limit) / limit) * 255);
    data[pixel * 4 + 3] = Math.max(0, Math.min(data[pixel * 4 + 3], alpha));
  }

  return { coverage: removed / total };
}

export type Bounds = { x: number; y: number; width: number; height: number };

/**
 * The tightest box around the product — transparent pixels, and pixels
 * matching the sampled backdrop, are treated as empty. Used to re-centre a
 * product that was shot off to one side.
 */
export function contentBounds(image: ImageData, tolerancePercent: number): Bounds {
  const { width, height, data } = image;
  const limit = threshold(tolerancePercent);
  const { red, green, blue } = sampleBackdrop(image);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] < 16) continue;
      if (distance(data, index, red, green, blue) <= limit) continue;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  // Nothing stood out from the backdrop — treat the whole frame as content
  // rather than returning an empty box the caller would have to special-case.
  if (maxX < 0) return { x: 0, y: 0, width, height };

  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}
