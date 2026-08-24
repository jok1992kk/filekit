import Image from "next/image";
import { AlertTriangle, Check, ScanLine } from "lucide-react";

import { marketplaces } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { editorSamples, type EditorSample } from "@/components/editor/editor-demo-data";

const checkerboard = {
  backgroundColor: "#fff",
  backgroundImage:
    "linear-gradient(45deg,#ececef 25%,transparent 25%),linear-gradient(-45deg,#ececef 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ececef 75%),linear-gradient(-45deg,transparent 75%,#ececef 75%)",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
  backgroundSize: "16px 16px",
};

function fitFrame(width: number, height: number, max: number) {
  const scale = max / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function Photo({
  src,
  alt,
  contain = false,
  className,
}: {
  src: string;
  alt: string;
  contain?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 240px, 360px"
        className={contain ? "object-contain" : "object-cover"}
      />
    </div>
  );
}

function StandardStage({ sample, ready }: { sample: EditorSample; ready: boolean }) {
  return (
    <div className="relative h-[270px] w-[270px] overflow-hidden rounded-[10px] border border-border bg-white max-mob:h-[220px] max-mob:w-[220px]">
      <div className={cn("absolute inset-0 transition-opacity duration-300", ready && "opacity-0")}>
        <Photo src={sample.src} alt={sample.alt} />
      </div>
      <div className={cn("absolute inset-0 p-[7%] opacity-0 transition-opacity duration-300", ready && "opacity-100")}>
        <Photo src={sample.readySrc} alt={sample.alt} contain />
      </div>
    </div>
  );
}

export function EditorStage({
  toolSlug,
  sample,
  ready,
  marketplaceId,
  cropRatio,
  format,
  quality,
}: {
  toolSlug: string;
  sample: EditorSample;
  ready: boolean;
  marketplaceId: string;
  cropRatio: string;
  format: string;
  quality: string;
}) {
  const marketplace = marketplaces.find((item) => item.id === marketplaceId) ?? marketplaces[0];
  const marketplaceFrame = fitFrame(marketplace.width, marketplace.height, 286);

  if (toolSlug === "background-remover") {
    return (
      <div className="relative h-[286px] w-[286px] overflow-hidden rounded-[10px] border border-border max-mob:h-[226px] max-mob:w-[226px]" style={ready ? checkerboard : undefined}>
        <div className={cn("absolute inset-0 transition-opacity duration-300", ready && "opacity-0")}>
          <Photo src={sample.src} alt={sample.alt} />
        </div>
        <div className={cn("absolute inset-[7%] opacity-0 transition-opacity duration-300", ready && "opacity-100")}>
          <Photo src={sample.readySrc} alt={sample.alt} contain />
        </div>
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[10.5px] font-medium text-ink shadow-sm">
          {ready ? "Transparent PNG" : "Original scene"}
        </span>
      </div>
    );
  }

  if (toolSlug === "white-background") {
    return <StandardStage sample={sample} ready={ready} />;
  }

  if (toolSlug === "product-centering") {
    return (
      <div className="relative grid h-[286px] w-[286px] place-items-center overflow-hidden rounded-[10px] border border-border bg-white max-mob:h-[226px] max-mob:w-[226px]">
        <span className="absolute left-1/2 top-0 h-full w-px bg-accent/15" />
        <span className="absolute left-0 top-1/2 h-px w-full bg-accent/15" />
        <div
          className={cn(
            "relative h-[74%] w-[74%] transition-transform duration-500",
            ready ? "translate-x-0 translate-y-0 scale-90" : "translate-x-7 -translate-y-4 scale-105",
          )}
        >
          <Photo src={ready ? sample.readySrc : sample.src} alt={sample.alt} contain={ready} />
        </div>
        <span className="absolute bottom-3 rounded-full border border-border bg-white px-2.5 py-1 text-[10.5px] text-muted shadow-sm">
          {ready ? "Centered · 10% safe margin" : "Off-center detected"}
        </span>
      </div>
    );
  }

  if (toolSlug === "smart-crop") {
    const ratios: Record<string, string> = { "1:1": "1 / 1", "4:5": "4 / 5", "5:4": "5 / 4", "16:9": "16 / 9" };
    return (
      <div className="flex h-[286px] w-full items-center justify-center max-mob:h-[226px]">
        <div
          className="relative max-h-[286px] max-w-[360px] overflow-hidden rounded-[10px] border-2 border-accent bg-white shadow-[0_14px_34px_-22px_rgba(21,128,61,.45)] max-mob:max-h-[226px] max-mob:max-w-[260px]"
          style={{ aspectRatio: ratios[cropRatio] ?? "1 / 1", height: cropRatio === "16:9" || cropRatio === "5:4" ? "220px" : "286px" }}
        >
          <Image src={sample.src} alt={sample.alt} fill sizes="360px" className={cn("transition-all duration-500", ready ? "object-cover scale-105" : "object-cover")} />
          <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,.12)]" />
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[#111]/80 px-2 py-1 text-[10.5px] font-medium text-white backdrop-blur">
            {ready ? `${cropRatio} subject-safe crop` : "Subject locked"}
          </span>
        </div>
      </div>
    );
  }

  if (toolSlug === "image-compressor") {
    const after = quality === "Small" ? "318 KB" : quality === "Best" ? "1.2 MB" : "682 KB";
    return (
      <div className="relative h-[286px] w-[286px] overflow-hidden rounded-[10px] border border-border bg-white max-mob:h-[226px] max-mob:w-[226px]">
        <Photo src={sample.src} alt={sample.alt} />
        <div className={cn("absolute inset-x-0 bottom-0 translate-y-full border-t border-white/60 bg-white/94 p-3 backdrop-blur transition-transform duration-300", ready && "translate-y-0")}>
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-muted line-through">5.8 MB</span>
            <span className="font-medium text-accent">{after}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[15%] rounded-full bg-accent" />
          </div>
        </div>
      </div>
    );
  }

  if (toolSlug === "image-converter") {
    return (
      <div className="relative h-[286px] w-[286px] overflow-hidden rounded-[10px] border border-border bg-white max-mob:h-[226px] max-mob:w-[226px]" style={ready && format === "PNG" ? checkerboard : undefined}>
        <div className="absolute inset-[8%]">
          <Photo src={ready ? sample.readySrc : sample.src} alt={sample.alt} contain={ready} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-white/70 bg-white/94 px-3 py-2 text-[11.5px] shadow-sm backdrop-blur">
          <span className="font-medium text-ink">HEIC</span>
          <span className="text-muted">→</span>
          <span className={cn("font-medium", ready ? "text-accent" : "text-ink")}>{format}</span>
        </div>
      </div>
    );
  }

  if (toolSlug === "bulk-rename") {
    const rows = editorSamples.slice(0, 4);
    return (
      <div className="w-full max-w-[430px] overflow-hidden rounded-[10px] border border-border bg-white">
        <div className="grid grid-cols-[40px_minmax(0,1fr)_76px] border-b border-border bg-surface px-3 py-2 text-[10px] font-medium uppercase tracking-[.08em] text-muted">
          <span>File</span><span>Name</span><span className="text-right">Status</span>
        </div>
        {rows.map((row, index) => (
          <div key={row.id} className="grid grid-cols-[40px_minmax(0,1fr)_76px] items-center border-b border-border px-3 py-2 last:border-b-0">
            <div className="relative h-7 w-7 overflow-hidden rounded border border-border bg-surface"><Image src={row.src} alt="" fill sizes="28px" className="object-cover" /></div>
            <div className="min-w-0 pr-2 text-[11.5px] text-ink">
              <span className="block truncate">{ready ? `rove-merch-${String(index + 1).padStart(2, "0")}.jpg` : `IMG_${4471 + index}.HEIC`}</span>
              <span className="block text-[10.5px] text-muted">{index % 2 ? "4.2 MB" : "5.8 MB"}</span>
            </div>
            <span className={cn("justify-self-end rounded-full px-2 py-0.5 text-[10.5px]", ready ? "bg-accent-tint text-accent" : "bg-surface-2 text-muted")}>
              {ready ? "Renamed" : "Queued"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (toolSlug === "quality-checker") {
    return (
      <div className="grid w-full max-w-[500px] grid-cols-[minmax(0,1fr)_150px] gap-3 max-mob:grid-cols-1">
        <div className="relative aspect-square overflow-hidden rounded-[10px] border border-border bg-white">
          <Photo src={sample.src} alt={sample.alt} />
          {!ready ? <>
            <span className="absolute left-[18%] top-[22%] h-9 w-9 rounded-full border-2 border-amber-400 bg-amber-300/20" />
            <span className="absolute right-[12%] top-[14%] h-7 w-7 rounded-full border-2 border-amber-400 bg-amber-300/20" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-[#111]/80 px-2.5 py-1 text-[10.5px] text-white backdrop-blur"><ScanLine width={12} />Scanning listing image</div>
          </> : null}
        </div>
        <div className="flex flex-col gap-2">
          {[
            ["Resolution", "Pass"],
            ["Aspect ratio", "Pass"],
            ["File size", ready ? "Pass" : "Large"],
            ["Color profile", "sRGB"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-white p-2.5">
              <span className="block text-[10.5px] text-muted">{label}</span>
              <span className={cn("mt-0.5 flex items-center gap-1 text-[11.5px] font-medium", value === "Large" ? "text-amber-600" : "text-accent")}>
                {value === "Large" ? <AlertTriangle width={12} /> : <Check width={12} />}{value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolSlug === "marketplace-pack") {
    const outputs = marketplaces.slice(0, 4);
    return (
      <div className="grid w-full max-w-[470px] grid-cols-[150px_20px_minmax(0,1fr)] items-center gap-3 max-mob:grid-cols-1">
        <div className="relative aspect-square overflow-hidden rounded-[10px] border border-border bg-white"><Photo src={sample.src} alt={sample.alt} /></div>
        <span className="text-center text-muted max-mob:rotate-90">→</span>
        <div className="grid grid-cols-2 gap-2">
          {outputs.map((item) => (
            <div key={item.id} className={cn("rounded-lg border border-border bg-white p-1.5 transition-all duration-300", ready ? "translate-y-0 opacity-100" : "translate-y-1 opacity-45")}>
              <div className="relative aspect-square overflow-hidden rounded bg-white"><Image src={sample.readySrc} alt="" fill sizes="110px" className="object-contain p-[8%]" /></div>
              <div className="mt-1 flex items-center justify-between px-0.5 text-[9.5px]"><span className="font-medium text-ink">{item.name}</span><span className="text-muted">{item.ratio}</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolSlug === "marketplace-resize") {
    return (
      <div className="grid h-[300px] w-full place-items-center max-mob:h-[240px]">
        <div className={cn("relative col-start-1 row-start-1 h-[250px] w-[250px] overflow-hidden rounded-[10px] border border-border bg-white transition-opacity duration-300 max-mob:h-[210px] max-mob:w-[210px]", ready && "opacity-0")}><Photo src={sample.src} alt={sample.alt} /></div>
        <div className={cn("relative col-start-1 row-start-1 overflow-hidden rounded-[10px] border-2 border-accent bg-white opacity-0 shadow-[0_16px_40px_-26px_rgba(21,128,61,.5)] transition-opacity duration-300 max-mob:scale-[.77]", ready && "opacity-100")} style={{ width: marketplaceFrame.width, height: marketplaceFrame.height }}>
          <Image src={sample.readySrc} alt={sample.alt} fill sizes="286px" className="object-contain p-[7%]" />
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#111]/80 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white">{marketplace.name} · {marketplace.width} × {marketplace.height}</span>
        </div>
      </div>
    );
  }

  return <StandardStage sample={sample} ready={ready} />;
}
