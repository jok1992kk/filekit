"use client";

import { Check } from "lucide-react";

import { Field, Segmented, SelectField, Slider, StatBox } from "@/components/editor/controls";
import { marketplaces } from "@/lib/brand";
import { formatBytes } from "@/lib/processing/image";
import type {
  BackdropMode,
  FitMode,
  OutputFormat,
  ProcessOptions,
  QualityPreset,
  SourceImage,
} from "@/lib/processing/types";
import { cn } from "@/lib/utils";

const FORMATS = ["JPG", "PNG", "WebP"];

const EDGE_CAPS: Record<string, number> = {
  Original: 0,
  "2000 px": 2000,
  "1600 px": 1600,
  "1200 px": 1200,
};

/**
 * The right-hand rail of the real editor.
 *
 * Every control here changes the output — unlike the marketing demo's rail,
 * which shows a fuller set of options for illustration. If an option cannot
 * actually be honoured yet, it does not appear.
 */
export function WorkspaceControls({
  toolSlug,
  options,
  update,
  sources,
}: {
  toolSlug: string;
  options: ProcessOptions;
  update: (patch: Partial<ProcessOptions>) => void;
  sources: SourceImage[];
}) {
  const target = marketplaces.find((item) => item.id === options.marketplaceId) ?? marketplaces[0];
  const first = sources[0];
  const totalBytes = sources.reduce((sum, item) => sum + item.bytes, 0);

  const marketplaceField = (
    label: string,
    list: readonly (typeof marketplaces)[number][] = marketplaces,
  ) => (
    <Field label={label}>
      <SelectField
        label={label}
        value={options.marketplaceId}
        onChange={(value) => update({ marketplaceId: value })}
      >
        {list.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} · {item.ratio}
          </option>
        ))}
      </SelectField>
    </Field>
  );

  const formatField = (
    <Field label="Format">
      <Segmented
        values={FORMATS}
        value={options.format}
        onChange={(value) => update({ format: value as OutputFormat })}
      />
    </Field>
  );

  const toleranceField = (
    <Field label={`Backdrop match · ${options.tolerance}%`}>
      <Slider
        label="Backdrop match"
        min={6}
        max={60}
        value={options.tolerance}
        onChange={(value) => update({ tolerance: value })}
      />
      <p className="mt-1.5 text-[10.5px] leading-[1.4] text-muted">
        Raise it if backdrop is left behind, lower it if the product loses edges.
      </p>
    </Field>
  );

  if (toolSlug === "marketplace-resize") {
    return (
      <>
        {marketplaceField("Marketplace")}
        <Field label="Product fit">
          <Segmented
            values={["Contain", "Fill"]}
            value={options.fit}
            onChange={(value) => update({ fit: value as FitMode })}
          />
          <p className="mt-1.5 text-[10.5px] leading-[1.4] text-muted">
            {options.fit === "Contain"
              ? "Whole product inside the frame, padded to fit."
              : "Fills the frame — edges outside the ratio are cropped."}
          </p>
        </Field>
        {formatField}
        <Field label="Output">
          <StatBox
            primary={`${target.width.toLocaleString("en-US")} × ${target.height.toLocaleString("en-US")}`}
            secondary="listing-ready"
          />
        </Field>
      </>
    );
  }

  if (toolSlug === "image-compressor") {
    return (
      <>
        <Field label="Compression">
          <Segmented
            values={["Small", "Balanced", "Best"]}
            value={options.quality}
            onChange={(value) => update({ quality: value as QualityPreset })}
          />
        </Field>
        <Field label="Resize longest edge">
          <SelectField
            label="Resize longest edge"
            value={
              Object.keys(EDGE_CAPS).find((key) => EDGE_CAPS[key] === options.maxEdge) ?? "Original"
            }
            onChange={(value) => update({ maxEdge: EDGE_CAPS[value] ?? 0 })}
          >
            {Object.keys(EDGE_CAPS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </SelectField>
        </Field>
        {formatField}
        <Field label="Source">
          <StatBox
            primary={formatBytes(totalBytes)}
            secondary={`${sources.length} ${sources.length === 1 ? "file" : "files"}`}
          />
        </Field>
      </>
    );
  }

  if (toolSlug === "image-converter") {
    return (
      <>
        <Field label="Convert from">
          <StatBox
            primary={(first?.file.type.replace("image/", "").toUpperCase() || "Image")}
            secondary={first ? `${first.width} × ${first.height}` : "no file"}
          />
        </Field>
        <Field label="Convert to">
          <Segmented
            values={FORMATS}
            value={options.format}
            onChange={(value) => update({ format: value as OutputFormat })}
          />
        </Field>
        <p className="rounded-md bg-surface px-2.5 py-2 text-[10.5px] leading-[1.45] text-muted">
          {options.format === "JPG"
            ? "JPG has no transparency — any transparent area is flattened onto white."
            : "Transparency is preserved."}
        </p>
      </>
    );
  }

  if (toolSlug === "background-remover") {
    return (
      <>
        <Field label="Output background">
          <Segmented
            values={["Transparent", "White"]}
            value={options.backdrop}
            onChange={(value) => update({ backdrop: value as BackdropMode })}
          />
        </Field>
        {toleranceField}
        <Field label="Output">
          <StatBox
            primary={options.backdrop === "Transparent" ? "Transparent PNG" : `${options.format} on white`}
            secondary="full resolution"
          />
        </Field>
        <p className="rounded-md bg-surface px-2.5 py-2 text-[10.5px] leading-[1.45] text-muted">
          Built for products shot on a plain, evenly lit backdrop. A busy
          background needs cutting out by hand.
        </p>
      </>
    );
  }

  if (toolSlug === "white-background") {
    return (
      <>
        <Field label="Background">
          <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2 text-[11.5px] text-ink">
            <span className="h-4 w-4 rounded border border-border-strong bg-white shadow-inner" />
            Pure white
            <span className="ml-auto text-[10.5px] text-muted">#FFFFFF</span>
          </div>
        </Field>
        <Field label={`Product size · ${options.scale}%`}>
          <Slider
            label="Product size"
            min={50}
            max={95}
            value={options.scale}
            onChange={(value) => update({ scale: value })}
          />
        </Field>
        {toleranceField}
        {marketplaceField("Output size", marketplaces.slice(0, 6))}
      </>
    );
  }

  if (toolSlug === "product-centering") {
    return (
      <>
        <Field label={`Product size · ${options.scale}%`}>
          <Slider
            label="Product size"
            min={50}
            max={95}
            value={options.scale}
            onChange={(value) => update({ scale: value })}
          />
        </Field>
        <Field label="Canvas">
          <Segmented
            values={["Transparent", "White"]}
            value={options.backdrop}
            onChange={(value) => update({ backdrop: value as BackdropMode })}
          />
        </Field>
        {toleranceField}
      </>
    );
  }

  if (toolSlug === "smart-crop") {
    return (
      <>
        <Field label="Target ratio">
          <Segmented
            values={["1:1", "4:5", "5:4", "16:9"]}
            value={options.cropRatio}
            onChange={(value) => update({ cropRatio: value })}
          />
        </Field>
        {formatField}
        <p className="rounded-md bg-surface px-2.5 py-2 text-[10.5px] leading-[1.45] text-muted">
          Crops the largest area of that shape from the middle of the frame, at
          full resolution.
        </p>
      </>
    );
  }

  if (toolSlug === "bulk-rename") {
    const preview = options.renamePattern
      .replace(/\{name\}/gi, first?.baseName ?? "photo")
      .replace(/\{index\}/gi, String(options.startNumber).padStart(2, "0"))
      .replace(/\{marketplace\}/gi, target.id)
      .replace(/\{date\}/gi, new Date().toISOString().slice(0, 10));

    return (
      <>
        <Field label="Filename pattern">
          <input
            value={options.renamePattern}
            onChange={(event) => update({ renamePattern: event.target.value })}
            className="h-8 w-full rounded-md border border-border px-2.5 font-mono text-[10.5px] text-ink outline-none focus:border-accent"
          />
        </Field>
        <Field label="Start number">
          <input
            type="number"
            min={0}
            value={options.startNumber}
            onChange={(event) => update({ startNumber: Number(event.target.value) || 0 })}
            className="h-8 w-full rounded-md border border-border px-2.5 text-[11.5px] text-ink outline-none focus:border-accent"
          />
        </Field>
        <p className="text-[10.5px] leading-[1.5] text-muted">
          Use <code className="text-ink">{"{name}"}</code>,{" "}
          <code className="text-ink">{"{index}"}</code>,{" "}
          <code className="text-ink">{"{marketplace}"}</code> or{" "}
          <code className="text-ink">{"{date}"}</code>.
        </p>
        <div className="rounded-md border border-accent/20 bg-accent-tint/60 px-2.5 py-2 text-[10.5px] leading-[1.4] break-all text-accent">
          {preview || "photo-01"}.
          {first?.file.name.split(".").pop()?.toLowerCase() ?? "jpg"}
        </div>
      </>
    );
  }

  if (toolSlug === "quality-checker") {
    return (
      <>
        {marketplaceField("Check against")}
        <div className="rounded-md bg-surface px-2.5 py-2 text-[10.5px] leading-[1.45] text-muted">
          Read-only report. Quality Check never changes your source files.
        </div>
      </>
    );
  }

  if (toolSlug === "marketplace-pack") {
    return (
      <>
        <Field label={`Storefronts · ${options.packIds.length} selected`}>
          <div className="grid grid-cols-2 gap-1.5">
            {marketplaces.map((item) => {
              const checked = options.packIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    update({
                      packIds: checked
                        ? options.packIds.filter((id) => id !== item.id)
                        : [...options.packIds, item.id],
                    })
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-[10.5px]",
                    checked ? "border-accent/30 bg-accent-tint text-accent" : "border-border text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-3.5 w-3.5 flex-none place-items-center rounded-sm border",
                      checked ? "border-accent bg-accent text-white" : "border-border-strong",
                    )}
                  >
                    {checked ? <Check width={9} /> : null}
                  </span>
                  {item.name}
                </button>
              );
            })}
          </div>
        </Field>
        {formatField}
        <Field label="Delivery">
          <StatBox
            primary="waresnap-pack.zip"
            secondary={`${options.packIds.length * sources.length} files`}
          />
        </Field>
      </>
    );
  }

  return null;
}
