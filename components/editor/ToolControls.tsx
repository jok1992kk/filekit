import { Check } from "lucide-react";

import { Field, Segmented, SelectField, StatBox, Toggle } from "@/components/editor/controls";
import { marketplaces } from "@/lib/brand";
import { cn } from "@/lib/utils";

const FORMATS = ["JPG", "PNG", "WebP"];

export function ToolControls({
  toolSlug,
  interactive,
  marketplaceId,
  setMarketplaceId,
  format,
  setFormat,
  quality,
  setQuality,
  cropRatio,
  setCropRatio,
  fitMode,
  setFitMode,
  backgroundMode,
  setBackgroundMode,
  scale,
  setScale,
  renamePattern,
  setRenamePattern,
  preserveShadow,
  setPreserveShadow,
  packIds,
  togglePack,
  onMutate,
}: {
  toolSlug: string;
  interactive: boolean;
  marketplaceId: string;
  setMarketplaceId: (value: string) => void;
  format: string;
  setFormat: (value: string) => void;
  quality: string;
  setQuality: (value: string) => void;
  cropRatio: string;
  setCropRatio: (value: string) => void;
  fitMode: string;
  setFitMode: (value: string) => void;
  backgroundMode: string;
  setBackgroundMode: (value: string) => void;
  scale: number;
  setScale: (value: number) => void;
  renamePattern: string;
  setRenamePattern: (value: string) => void;
  preserveShadow: boolean;
  setPreserveShadow: (value: boolean) => void;
  packIds: string[];
  togglePack: (id: string) => void;
  onMutate: () => void;
}) {
  const change = <T,>(setter: (value: T) => void, value: T) => { setter(value); onMutate(); };
  const disabled = !interactive;

  if (toolSlug === "marketplace-resize") return <>
    <Field label="Marketplace"><SelectField label="Marketplace" value={marketplaceId} disabled={disabled} onChange={(value) => change(setMarketplaceId, value)}>{marketplaces.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.ratio}</option>)}</SelectField></Field>
    <Field label="Product fit"><Segmented values={["Contain", "Fill"]} value={fitMode} disabled={disabled} onChange={(value) => change(setFitMode, value)} /></Field>
    <Field label="Format"><Segmented values={FORMATS} value={format} disabled={disabled} onChange={(value) => change(setFormat, value)} /></Field>
    <Field label="Output"><StatBox primary={`${marketplaces.find((item) => item.id === marketplaceId)?.width.toLocaleString("en-US")} × ${marketplaces.find((item) => item.id === marketplaceId)?.height.toLocaleString("en-US")}`} secondary="listing-ready" /></Field>
  </>;

  if (toolSlug === "image-compressor") return <>
    <Field label="Compression"><Segmented values={["Small", "Balanced", "Best"]} value={quality} disabled={disabled} onChange={(value) => change(setQuality, value)} /></Field>
    <Field label="Visual quality"><div className="rounded-md border border-border px-2.5 py-2"><div className="flex justify-between text-[10.5px]"><span className="text-muted">Target</span><b className="font-medium text-ink">{quality === "Small" ? "64%" : quality === "Best" ? "94%" : "82%"}</b></div><div className="mt-2 h-1.5 rounded-full bg-surface-2"><div className={cn("h-full rounded-full bg-accent", quality === "Small" ? "w-[64%]" : quality === "Best" ? "w-[94%]" : "w-[82%]")} /></div></div></Field>
    <Toggle disabled={disabled} label="Remove camera metadata" detail="Strips location and EXIF data" checked onChange={() => onMutate()} />
    <Field label="Estimated output"><StatBox primary={quality === "Small" ? "318 KB" : quality === "Best" ? "1.2 MB" : "682 KB"} secondary="from 5.8 MB" /></Field>
  </>;

  if (toolSlug === "image-converter") return <>
    <Field label="Convert from"><StatBox primary="HEIC" secondary="Apple photo" /></Field>
    <Field label="Convert to"><Segmented values={FORMATS} value={format} disabled={disabled} onChange={(value) => change(setFormat, value)} /></Field>
    <Toggle disabled={disabled} label="Preserve transparency" detail={format === "JPG" ? "Unavailable for JPG" : "Keep the alpha channel"} checked={format !== "JPG"} onChange={() => onMutate()} />
    <Field label="Color profile"><StatBox primary="sRGB" secondary="web-safe" /></Field>
  </>;

  if (toolSlug === "background-remover") return <>
    <Field label="Output background"><Segmented values={["Transparent", "White", "Color"]} value={backgroundMode} disabled={disabled} onChange={(value) => change(setBackgroundMode, value)} /></Field>
    <Field label="Edge detail"><Segmented values={["Auto", "Soft", "Hard"]} value="Auto" disabled={disabled} onChange={() => onMutate()} /></Field>
    <Toggle disabled={disabled} label="Keep natural shadow" detail="Retains grounding under the product" checked={preserveShadow} onChange={(value) => change(setPreserveShadow, value)} />
    <Field label="Output"><StatBox primary="Transparent PNG" secondary="full resolution" /></Field>
  </>;

  if (toolSlug === "white-background") return <>
    <Field label="Background"><div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2 text-[11.5px] text-ink"><span className="h-4 w-4 rounded border border-border-strong bg-white shadow-inner" />Pure white <span className="ml-auto text-[10.5px] text-muted">#FFFFFF</span></div></Field>
    <Field label="Safe margin"><Segmented values={["5%", "10%", "15%"]} value="10%" disabled={disabled} onChange={() => onMutate()} /></Field>
    <Toggle disabled={disabled} label="Add contact shadow" detail="Subtle, marketplace-safe depth" checked={preserveShadow} onChange={(value) => change(setPreserveShadow, value)} />
    <Field label="Ruleset"><SelectField label="Ruleset" value={marketplaceId} disabled={disabled} onChange={(value) => change(setMarketplaceId, value)}>{marketplaces.slice(0, 4).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></Field>
  </>;

  if (toolSlug === "product-centering") return <>
    <Field label="Alignment"><div className="grid grid-cols-3 gap-1 rounded-md border border-border p-2">{Array.from({ length: 9 }, (_, index) => <button key={index} type="button" disabled={disabled} onClick={onMutate} className={cn("h-5 rounded border", index === 4 ? "border-accent bg-accent-tint" : "border-border bg-surface hover:border-border-strong")}><span className={cn("mx-auto block h-1.5 w-1.5 rounded-full", index === 4 ? "bg-accent" : "bg-border-strong")} /></button>)}</div></Field>
    <Field label={`Product scale · ${scale}%`}><input aria-label="Product scale" disabled={disabled} type="range" min="60" max="95" value={scale} onChange={(event) => change(setScale, Number(event.target.value))} className="h-1.5 w-full accent-[var(--color-accent)]" /></Field>
    <Toggle disabled={disabled} label="Keep visual center" detail="Balances irregular product shapes" checked onChange={() => onMutate()} />
    <Toggle disabled={disabled} label="Preserve shadow" checked={preserveShadow} onChange={(value) => change(setPreserveShadow, value)} />
  </>;

  if (toolSlug === "smart-crop") return <>
    <Field label="Target ratio"><Segmented values={["1:1", "4:5", "5:4", "16:9"]} value={cropRatio} disabled={disabled} onChange={(value) => change(setCropRatio, value)} /></Field>
    <Field label="Focus"><Segmented values={["Product", "Center"]} value="Product" disabled={disabled} onChange={() => onMutate()} /></Field>
    <Toggle disabled={disabled} label="Protect product edges" detail="No accidental brim or handle cuts" checked onChange={() => onMutate()} />
    <Toggle disabled={disabled} label="Create all four ratios" checked={false} onChange={() => onMutate()} />
  </>;

  if (toolSlug === "bulk-rename") return <>
    <Field label="Filename pattern"><input disabled={disabled} value={renamePattern} onChange={(event) => change(setRenamePattern, event.target.value)} className="h-8 w-full rounded-md border border-border px-2.5 font-mono text-[10.5px] text-ink outline-none focus:border-accent" /></Field>
    <Field label="Separator"><Segmented values={["-", "_", "Space"]} value="-" disabled={disabled} onChange={() => onMutate()} /></Field>
    <Field label="Start number"><StatBox primary="01" secondary="2 digits" /></Field>
    <div className="rounded-md border border-accent/20 bg-accent-tint/60 px-2.5 py-2 text-[10.5px] leading-[1.4] text-accent">Output name: rove-merch-01.jpg</div>
  </>;

  if (toolSlug === "quality-checker") return <>
    <Field label="Check against"><SelectField label="Check against" value={marketplaceId} disabled={disabled} onChange={(value) => change(setMarketplaceId, value)}>{marketplaces.slice(0, 4).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></Field>
    <Field label="Checks"><div className="flex flex-col gap-2 rounded-md border border-border p-2.5">{["Resolution", "Aspect ratio", "File size", "Color profile"].map((item) => <div key={item} className="flex items-center justify-between text-[11.5px] text-ink"><span>{item}</span><span className="grid h-4 w-4 place-items-center rounded bg-accent text-white"><Check width={10} strokeWidth={2.5} /></span></div>)}</div></Field>
    <div className="rounded-md bg-surface px-2.5 py-2 text-[10.5px] leading-[1.45] text-muted">Read-only report. Quality Check never changes your source files.</div>
  </>;

  if (toolSlug === "marketplace-pack") return <>
    <Field label={`Storefronts · ${packIds.length} selected`}><div className="grid grid-cols-2 gap-1.5">{marketplaces.slice(0, 6).map((item) => { const checked = packIds.includes(item.id); return <button key={item.id} type="button" disabled={disabled} onClick={() => { togglePack(item.id); onMutate(); }} className={cn("flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-[10.5px]", checked ? "border-accent/30 bg-accent-tint text-accent" : "border-border text-muted")}><span className={cn("grid h-3.5 w-3.5 place-items-center rounded-sm border", checked ? "border-accent bg-accent text-white" : "border-border-strong")}>{checked ? <Check width={9} /> : null}</span>{item.name}</button>; })}</div></Field>
    <Field label="Format"><Segmented values={FORMATS} value={format} disabled={disabled} onChange={(value) => change(setFormat, value)} /></Field>
    <Field label="Delivery"><StatBox primary="ware-snap-pack.zip" secondary={`${packIds.length || 1} folders`} /></Field>
  </>;

  return null;
}
