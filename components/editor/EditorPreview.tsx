"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Download, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { runToolAction } from "@/app/actions/tokens";
import { EditorStage } from "@/components/editor/EditorStage";
import {
  actionLabelByTool,
  defaultSampleByTool,
  editorSamples,
  readyMessageByTool,
} from "@/components/editor/editor-demo-data";
import { ToolControls } from "@/components/editor/ToolControls";
import { brand } from "@/lib/brand";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export type EditorMode = "static" | "interactive";
type RunStatus = "idle" | "processing" | "ready";

const RUN_MS = 900;

/** One editor shell, ten purpose-built workspaces. */
export function EditorPreview({
  mode = "static",
  signedIn = false,
  initialBalance = 287,
  initialToolSlug,
  initialMarketplaceId = "amazon",
}: {
  mode?: EditorMode;
  signedIn?: boolean;
  initialBalance?: number;
  initialToolSlug?: string;
  initialMarketplaceId?: string;
}) {
  const router = useRouter();
  const interactive = mode === "interactive";
  const initialToolIndex = initialToolSlug
    ? Math.max(0, tools.findIndex((item) => item.slug === initialToolSlug))
    : 0;
  const initialSampleId = defaultSampleByTool[tools[initialToolIndex].slug] ?? editorSamples[0].id;
  const initialSampleIndex = Math.max(0, editorSamples.findIndex((item) => item.id === initialSampleId));

  const [toolIndex, setToolIndex] = useState(initialToolIndex);
  const [sampleIndex, setSampleIndex] = useState(initialSampleIndex);
  const [marketplaceId, setMarketplaceId] = useState(initialMarketplaceId);
  const [format, setFormat] = useState(
    tools[initialToolIndex].slug === "background-remover"
      ? "PNG"
      : tools[initialToolIndex].slug === "image-converter"
        ? "WebP"
        : "JPG",
  );
  const [quality, setQuality] = useState("Balanced");
  const [cropRatio, setCropRatio] = useState("4:5");
  const [fitMode, setFitMode] = useState("Contain");
  const [backgroundMode, setBackgroundMode] = useState("Transparent");
  const [scale, setScale] = useState(82);
  const [renamePattern, setRenamePattern] = useState("{brand}-{product}-{index}");
  const [preserveShadow, setPreserveShadow] = useState(true);
  const [packIds, setPackIds] = useState(["amazon", "etsy", "shopify", "ebay"]);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [balance, setBalance] = useState(initialBalance);
  const [spent, setSpent] = useState(0);
  const [shortfall, setShortfall] = useState<number | null>(null);

  const tool = tools[toolIndex];
  const sample = editorSamples[sampleIndex];
  const ready = status === "ready";
  const cost = tool.cost.tokens;

  const outputHref = useMemo(() => {
    if (["image-compressor", "image-converter", "bulk-rename", "quality-checker"].includes(tool.slug)) return sample.src;
    return sample.readySrc;
  }, [sample.readySrc, sample.src, tool.slug]);

  const reset = useCallback(() => {
    setStatus("idle");
    setShortfall(null);
  }, []);

  const selectTool = useCallback((index: number) => {
    const nextTool = tools[index];
    const sampleId = defaultSampleByTool[nextTool.slug];
    const nextSampleIndex = editorSamples.findIndex((item) => item.id === sampleId);
    setToolIndex(index);
    if (nextSampleIndex >= 0) setSampleIndex(nextSampleIndex);
    if (nextTool.slug === "background-remover") {
      setFormat("PNG");
      setBackgroundMode("Transparent");
    } else if (nextTool.slug === "image-converter") {
      setFormat("WebP");
    } else {
      setFormat("JPG");
    }
    setStatus("idle");
    setShortfall(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!interactive || status === "processing") return;
    setShortfall(null);
    setStatus("processing");
    await new Promise((resolve) => setTimeout(resolve, RUN_MS));
    if (signedIn) {
      const result = await runToolAction(tool.slug, 1);
      if (!result.ok) {
        setStatus("idle");
        if (result.error === "insufficient_tokens") setShortfall(result.needed);
        return;
      }
      setBalance(result.balance);
      setSpent(result.cost);
      router.refresh();
    } else {
      setSpent(cost);
    }
    setStatus("ready");
  }, [cost, interactive, router, signedIn, status, tool.slug]);

  const togglePack = (id: string) => {
    setPackIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-white shadow-[0_2px_4px_rgba(0,0,0,.04),0_30px_70px_-38px_rgba(15,15,16,.32)]">
      <div className="flex h-10 items-center gap-2 border-b border-border bg-white px-3.5">
        <div className="flex flex-none gap-1.5" aria-hidden>
          <i className="block h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
          <i className="block h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
          <i className="block h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
        </div>
        <div className="flex-1 text-center text-[11.5px] tracking-[-0.01em] text-muted">{brand.name} — {tool.name}</div>
        <div className="flex flex-none items-center gap-1.5">
          <span className="hidden rounded-full bg-accent-tint px-2 py-0.5 text-[10px] font-medium text-accent min-[520px]:inline">Workspace</span>
          <span className="rounded-full border border-border bg-white px-2 py-0.5 text-[10.5px] text-muted"><b className="font-medium text-ink">{balance}</b> tokens</span>
        </div>
      </div>

      <div className="grid min-h-[540px] grid-cols-[180px_minmax(0,1fr)_248px] max-tab:grid-cols-1">
        <aside className="min-w-0 border-r border-border bg-white px-2.5 py-3 max-tab:border-b max-tab:border-r-0">
          <div className="field-label px-2 pb-2 text-[9.5px] max-tab:hidden">Tools</div>
          <ul className="max-tab:flex max-tab:gap-1.5 max-tab:overflow-x-auto max-tab:[scrollbar-width:none] max-tab:[&::-webkit-scrollbar]:hidden">
            {tools.map((item, index) => {
              const Icon = item.icon;
              const active = index === toolIndex;
              return (
                <li key={item.slug} className="max-tab:flex-none">
                  <button type="button" disabled={!interactive} onClick={() => selectTool(index)} aria-pressed={active} className={cn("group flex w-full items-center gap-2 rounded-lg px-2 py-[7px] text-left text-[12px] leading-[1.3] tracking-[-0.005em] transition-colors max-tab:w-auto max-tab:rounded-full max-tab:border max-tab:px-3 max-tab:py-1.5 max-tab:whitespace-nowrap", active ? "bg-accent-tint font-medium text-ink max-tab:border-accent/30" : "text-muted hover:bg-surface hover:text-ink max-tab:border-border")}>
                    <Icon width={14} height={14} strokeWidth={1.5} className={cn("flex-none", active ? "text-accent" : "text-muted group-hover:text-body")} />
                    {item.display.railLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="flex min-w-0 flex-col bg-[#f7f8f7]">
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border bg-white px-3.5 py-2 text-[11px]">
            <div className="min-w-0"><b className="block truncate font-medium text-ink">{sample.name}</b><span className="text-muted">{sample.brand}</span></div>
            <span className={cn("flex-none rounded-full px-2 py-0.5 text-[10.5px]", ready ? "bg-accent-tint text-accent" : "bg-surface-2 text-muted")}>{ready ? sample.readyMeta : sample.meta}</span>
          </div>

          <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-hidden p-7 max-mob:min-h-[330px] max-mob:p-5">
            <EditorStage toolSlug={tool.slug} sample={sample} ready={ready} marketplaceId={marketplaceId} cropRatio={cropRatio} format={format} quality={quality} />
          </div>

          <div className="border-t border-border bg-white px-3 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="field-label mr-1 flex-none text-[9px] max-mob:hidden">Projects</span>
              {editorSamples.map((item, index) => {
                const active = index === sampleIndex;
                return <button key={item.id} type="button" disabled={!interactive} onClick={() => { setSampleIndex(index); reset(); }} aria-label={item.brand} aria-pressed={active} className={cn("group flex flex-none items-center gap-2 rounded-lg border bg-white p-1 pr-2.5 text-left", active ? "border-accent shadow-[0_0_0_2px_var(--color-accent-tint)]" : "border-border hover:border-border-strong")}><span className="relative h-9 w-9 overflow-hidden rounded-md bg-surface"><Image src={item.src} alt="" fill sizes="36px" className="object-cover" /></span><span className={cn("max-w-[84px] truncate text-[10.5px]", active ? "font-medium text-ink" : "text-muted")}>{item.brand}</span></button>;
              })}
            </div>
          </div>
        </main>

        <aside className="flex min-w-0 flex-col border-l border-border bg-white max-tab:border-l-0 max-tab:border-t">
          <div className="border-b border-border px-4 py-3.5">
            <div className="flex items-start justify-between gap-3"><div><h3 className="text-[14px] font-medium tracking-[-0.01em]">{tool.name}</h3><p className="mt-1 text-[10.5px] leading-[1.4] text-muted">{tool.oneLiner}</p></div><span className="flex-none rounded-full bg-accent-tint px-2 py-0.5 text-[10px] font-medium text-accent">{cost} {cost === 1 ? "token" : "tokens"}</span></div>
          </div>

          <div className="flex flex-1 flex-col gap-3.5 p-4">
            <ToolControls toolSlug={tool.slug} interactive={interactive} marketplaceId={marketplaceId} setMarketplaceId={setMarketplaceId} format={format} setFormat={setFormat} quality={quality} setQuality={setQuality} cropRatio={cropRatio} setCropRatio={setCropRatio} fitMode={fitMode} setFitMode={setFitMode} backgroundMode={backgroundMode} setBackgroundMode={setBackgroundMode} scale={scale} setScale={setScale} renamePattern={renamePattern} setRenamePattern={setRenamePattern} preserveShadow={preserveShadow} setPreserveShadow={setPreserveShadow} packIds={packIds} togglePack={togglePack} onMutate={reset} />

            <div className="mt-auto border-t border-border pt-3.5">
              {shortfall !== null ? <p className="mb-2.5 text-[11.5px] text-ink">You need {shortfall} more {shortfall === 1 ? "token" : "tokens"}.</p> : null}
              {ready ? <div className="mb-3 flex items-start gap-2 rounded-lg border border-accent/20 bg-accent-tint/60 p-2.5 text-[11px] leading-[1.35] text-accent"><span className="mt-px grid h-4 w-4 flex-none place-items-center rounded-full bg-accent text-white"><Check width={10} strokeWidth={2.5} /></span><span><b className="block font-medium">{readyMessageByTool[tool.slug]}</b><span className="opacity-80">{spent} {spent === 1 ? "token" : "tokens"} used</span></span></div> : null}

              {ready ? signedIn ? (
                <div className="flex gap-2"><a href={outputHref} download className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#111] text-[11.5px] font-medium text-white"><Download width={13} />Download</a><button type="button" onClick={reset} aria-label="Reset" className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted hover:text-ink"><RotateCcw width={14} /></button></div>
              ) : (
                <div className="rounded-lg border border-border bg-surface p-3"><p className="text-[11px] leading-[1.45] text-body">Your image is ready. Create a free account to download it.</p><Link href="/signup" className="mt-2.5 flex h-9 w-full items-center justify-center rounded-md bg-[#111] text-[11.5px] font-medium text-white">Create free account</Link></div>
              ) : (
                <button type="button" onClick={handleProcess} disabled={!interactive || status === "processing"} className="h-9 w-full rounded-md bg-[#111] text-[11.5px] font-medium text-white transition-transform active:scale-[.98] disabled:cursor-default disabled:opacity-70">{status === "processing" ? "Processing…" : actionLabelByTool[tool.slug] ?? "Process Image"}</button>
              )}

              {shortfall !== null ? <Link href="/tokens" className="mt-2 flex h-9 w-full items-center justify-center rounded-md border border-border text-[11.5px] font-medium text-ink">Buy Tokens</Link> : null}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2"><div className={cn("h-full rounded-full bg-accent transition-all duration-[900ms]", status === "idle" ? "w-0" : "w-full")} /></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
