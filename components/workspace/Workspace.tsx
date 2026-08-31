"use client";

/* eslint-disable @next/next/no-img-element -- previews are blob: URLs for
   files that never leave the browser; next/image cannot optimise those. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Check, Download, ImagePlus, RotateCcw, X } from "lucide-react";

import { runToolAction } from "@/app/actions/tokens";
import { WorkspaceControls } from "@/components/workspace/WorkspaceControls";
import { brand } from "@/lib/brand";
import { takeStagedFiles } from "@/lib/processing/handoff";
import { decodeImage, formatBytes } from "@/lib/processing/image";
import { runTool } from "@/lib/processing/run";
import { createZip } from "@/lib/processing/zip";
import {
  defaultOptions,
  ProcessingError,
  type ProcessOptions,
  type ProcessResult,
  type SourceImage,
} from "@/lib/processing/types";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

type Status = "idle" | "processing" | "ready";

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function Workspace({
  initialBalance,
  initialToolSlug,
  initialMarketplaceId,
}: {
  initialBalance: number;
  initialToolSlug?: string;
  initialMarketplaceId?: string;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [sources, setSources] = useState<SourceImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toolIndex, setToolIndex] = useState(() => {
    const found = tools.findIndex((item) => item.slug === initialToolSlug);
    return found >= 0 ? found : 0;
  });
  const [options, setOptions] = useState<ProcessOptions>({
    ...defaultOptions,
    marketplaceId: initialMarketplaceId ?? defaultOptions.marketplaceId,
  });
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(initialBalance);
  const [spent, setSpent] = useState(0);
  const [shortfall, setShortfall] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const tool = tools[toolIndex];
  const active = sources[activeIndex];
  const ready = status === "ready";

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setShortfall(null);
    setError(null);
  }, []);

  const addFiles = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    setBusy(true);
    setError(null);

    const decoded: SourceImage[] = [];
    const failures: string[] = [];
    for (const file of incoming) {
      try {
        decoded.push(await decodeImage(file));
      } catch (cause) {
        failures.push(cause instanceof ProcessingError ? cause.message : `${file.name} could not be read.`);
      }
    }

    if (decoded.length > 0) {
      setSources((current) => [...current, ...decoded]);
      setStatus("idle");
      setResult(null);
    }
    if (failures.length > 0) setError(failures.join(" "));
    setBusy(false);
  }, []);

  // Files chosen on the dashboard are handed over in memory — see
  // lib/processing/handoff.ts. Runs once; a hard reload starts empty.
  useEffect(() => {
    const staged = takeStagedFiles();
    if (!staged) return;
    if (staged.marketplaceId) {
      setOptions((current) => ({ ...current, marketplaceId: staged.marketplaceId }));
    }
    void addFiles(staged.files);
  }, [addFiles]);

  const originalUrl = useMemo(() => (active ? URL.createObjectURL(active.file) : null), [active]);
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  // The output that belongs to the image currently on screen. Marketplace Pack
  // writes several files per source, so match on name rather than index.
  const previewOutput = useMemo(() => {
    if (!result || result.outputs.length === 0 || !active) return null;
    return (
      result.outputs.find((item) => item.name.includes(active.baseName)) ?? result.outputs[0]
    );
  }, [active, result]);

  const outputUrl = useMemo(
    () => (previewOutput ? URL.createObjectURL(previewOutput.blob) : null),
    [previewOutput],
  );
  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const update = useCallback((patch: Partial<ProcessOptions>) => {
    setOptions((current) => ({ ...current, ...patch }));
    setStatus("idle");
    setResult(null);
  }, []);

  const removeAt = (index: number) => {
    setSources((current) => {
      current[index]?.bitmap.close();
      return current.filter((_, position) => position !== index);
    });
    setActiveIndex((current) => Math.max(0, current > index ? current - 1 : current));
    reset();
  };

  const process = async () => {
    if (sources.length === 0 || status === "processing") return;
    setError(null);
    setShortfall(null);
    setStatus("processing");
    setProgress({ done: 0, total: sources.length });

    // Charge first: the server action is the only authority on the balance,
    // and it rejects atomically if the tokens are not there. Decoding already
    // happened at upload, so a charge is not spent on a file that cannot open.
    const charge = await runToolAction(tool.slug, sources.length);
    if (!charge.ok) {
      setStatus("idle");
      if (charge.error === "insufficient_tokens") setShortfall(charge.needed);
      else setError("Could not start — please sign in again.");
      return;
    }
    setBalance(charge.balance);
    setSpent(charge.cost);

    try {
      const output = await runTool(tool.slug, sources, options, (done, total) =>
        setProgress({ done, total }),
      );
      setResult(output);
      setStatus("ready");
      router.refresh();
    } catch (cause) {
      setStatus("idle");
      setError(
        cause instanceof ProcessingError
          ? cause.message
          : "Something went wrong while processing. Try a different file.",
      );
    }
  };

  const download = async () => {
    if (!result || result.outputs.length === 0) return;
    if (result.outputs.length === 1) {
      const only = result.outputs[0];
      saveBlob(only.blob, only.name);
      return;
    }
    const zip = await createZip(result.outputs.map(({ name, blob }) => ({ name, blob })));
    saveBlob(zip, `waresnap-${tool.slug}.zip`);
  };

  const outputBytes = result?.outputs.reduce((sum, item) => sum + item.blob.size, 0) ?? 0;
  const sourceBytes = sources.reduce((sum, item) => sum + item.bytes, 0);

  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-white shadow-[0_2px_4px_rgba(0,0,0,.04),0_30px_70px_-38px_rgba(15,15,16,.32)]">
      <div className="flex h-10 items-center gap-2 border-b border-border bg-white px-3.5">
        <div className="flex flex-none gap-1.5" aria-hidden>
          <i className="block h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
          <i className="block h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
          <i className="block h-2.5 w-2.5 rounded-full bg-[#E4E4E7]" />
        </div>
        <div className="flex-1 truncate text-center text-[11.5px] tracking-[-0.01em] text-muted">
          {brand.name} — {tool.name}
        </div>
        <span className="flex-none rounded-full border border-border bg-white px-2 py-0.5 text-[10.5px] text-muted">
          <b className="font-medium text-ink">{balance}</b> tokens
        </span>
      </div>

      <div className="grid min-h-[540px] grid-cols-[180px_minmax(0,1fr)_248px] max-tab:grid-cols-1">
        <aside className="min-w-0 border-r border-border bg-white px-2.5 py-3 max-tab:border-b max-tab:border-r-0">
          <div className="field-label px-2 pb-2 text-[9.5px] max-tab:hidden">Tools</div>
          <ul className="max-tab:flex max-tab:gap-1.5 max-tab:overflow-x-auto max-tab:[scrollbar-width:none] max-tab:[&::-webkit-scrollbar]:hidden">
            {tools.map((item, index) => {
              const Icon = item.icon;
              const selected = index === toolIndex;
              return (
                <li key={item.slug} className="max-tab:flex-none">
                  <button
                    type="button"
                    onClick={() => {
                      setToolIndex(index);
                      reset();
                      if (item.slug === "background-remover") update({ backdrop: "Transparent" });
                    }}
                    aria-pressed={selected}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-lg px-2 py-[7px] text-left text-[12px] leading-[1.3] tracking-[-0.005em] transition-colors max-tab:w-auto max-tab:rounded-full max-tab:border max-tab:px-3 max-tab:py-1.5 max-tab:whitespace-nowrap",
                      selected
                        ? "bg-accent-tint font-medium text-ink max-tab:border-accent/30"
                        : "text-muted hover:bg-surface hover:text-ink max-tab:border-border",
                    )}
                  >
                    <Icon
                      width={14}
                      height={14}
                      strokeWidth={1.5}
                      className={cn("flex-none", selected ? "text-accent" : "text-muted group-hover:text-body")}
                    />
                    {item.display.railLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="flex min-w-0 flex-col bg-[#f7f8f7]">
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border bg-white px-3.5 py-2 text-[11px]">
            <div className="min-w-0">
              <b className="block truncate font-medium text-ink">
                {active ? active.file.name : "No photos yet"}
              </b>
              <span className="text-muted">
                {active ? `${active.width} × ${active.height} · ${formatBytes(active.bytes)}` : "Drop a product photo to start"}
              </span>
            </div>
            {ready && previewOutput ? (
              <span className="flex-none rounded-full bg-accent-tint px-2 py-0.5 text-[10.5px] text-accent">
                {previewOutput.width} × {previewOutput.height} · {formatBytes(previewOutput.blob.size)}
              </span>
            ) : null}
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void addFiles(Array.from(event.dataTransfer.files));
            }}
            className={cn(
              "flex min-h-[400px] flex-1 items-center justify-center overflow-hidden p-7 transition-colors max-mob:min-h-[300px] max-mob:p-4",
              dragging && "bg-accent-tint",
            )}
          >
            {sources.length === 0 ? (
              <div className="flex flex-col items-center text-center">
                <ImagePlus width={24} height={24} strokeWidth={1.5} className="text-muted" />
                <p className="mt-3 text-[14px] text-ink">Drop product photos here</p>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="mt-1 text-[14px] font-medium text-ink underline underline-offset-4 hover:text-accent"
                >
                  or browse
                </button>
                <p className="mt-2.5 text-[11.5px] text-muted">
                  JPG, PNG or WebP · they stay on your device
                </p>
              </div>
            ) : ready && result?.reports ? (
              <div className="max-h-[420px] w-full max-w-[440px] overflow-y-auto">
                {result.reports.map((report) => (
                  <div key={report.fileName} className="mb-3 rounded-[10px] border border-border bg-white p-3 last:mb-0">
                    <b className="block truncate text-[11.5px] font-medium text-ink">{report.fileName}</b>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {report.findings.map((finding) => (
                        <div key={finding.label} className="text-[11px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted">{finding.label}</span>
                            <span
                              className={cn(
                                "flex items-center gap-1 font-medium",
                                finding.status === "warn" ? "text-amber-600" : "text-accent",
                              )}
                            >
                              {finding.status === "warn" ? <AlertTriangle width={11} /> : <Check width={11} />}
                              {finding.value}
                            </span>
                          </div>
                          {finding.hint ? (
                            <p className="mt-0.5 leading-[1.4] text-[10.5px] text-muted">{finding.hint}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative max-h-full">
                <img
                  src={(ready && outputUrl) || originalUrl || ""}
                  alt={active?.file.name ?? ""}
                  className="max-h-[380px] max-w-full rounded-[10px] border border-border bg-white object-contain max-mob:max-h-[260px]"
                  style={
                    ready && options.backdrop === "Transparent" && tool.slug !== "white-background"
                      ? {
                          backgroundImage:
                            "linear-gradient(45deg,#ececef 25%,transparent 25%),linear-gradient(-45deg,#ececef 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ececef 75%),linear-gradient(-45deg,transparent 75%,#ececef 75%)",
                          backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
                          backgroundSize: "16px 16px",
                        }
                      : undefined
                  }
                />
                <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[10.5px] font-medium text-ink shadow-sm">
                  {ready ? "Processed" : "Original"}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-white px-3 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                className="flex h-9 flex-none items-center gap-1.5 rounded-lg border border-dashed border-border-strong px-3 text-[10.5px] text-muted hover:border-accent hover:text-accent disabled:opacity-50"
              >
                <ImagePlus width={13} />
                {busy ? "Reading…" : "Add"}
              </button>
              {sources.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className={cn(
                    "group relative flex flex-none items-center gap-2 rounded-lg border bg-white p-1 pr-6 text-left",
                    index === activeIndex
                      ? "border-accent shadow-[0_0_0_2px_var(--color-accent-tint)]"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="flex items-center gap-2"
                    aria-pressed={index === activeIndex}
                  >
                    <span className="relative block h-9 w-9 overflow-hidden rounded-md bg-surface">
                      <img
                        src={URL.createObjectURL(item.file)}
                        alt=""
                        className="h-full w-full object-cover"
                        onLoad={(event) => URL.revokeObjectURL(event.currentTarget.src)}
                      />
                    </span>
                    <span
                      className={cn(
                        "max-w-[84px] truncate text-[10.5px]",
                        index === activeIndex ? "font-medium text-ink" : "text-muted",
                      )}
                    >
                      {item.baseName}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Remove ${item.file.name}`}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  >
                    <X width={12} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,.heic,.heif"
            multiple
            hidden
            onChange={(event) => {
              void addFiles(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
        </main>

        <aside className="flex min-w-0 flex-col border-l border-border bg-white max-tab:border-l-0 max-tab:border-t">
          <div className="border-b border-border px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-medium tracking-[-0.01em]">{tool.name}</h3>
                <p className="mt-1 text-[10.5px] leading-[1.4] text-muted">{tool.oneLiner}</p>
              </div>
              <span className="flex-none rounded-full bg-accent-tint px-2 py-0.5 text-[10px] font-medium text-accent">
                {tool.cost.tokens} {tool.cost.tokens === 1 ? "token" : "tokens"}
                {tool.cost.perImages > 1 ? ` / ${tool.cost.perImages}` : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3.5 p-4">
            <WorkspaceControls
              toolSlug={tool.slug}
              options={options}
              update={update}
              sources={sources}
            />

            <div className="mt-auto border-t border-border pt-3.5">
              {error ? (
                <p className="mb-2.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-[1.4] text-amber-800">
                  {error}
                </p>
              ) : null}

              {shortfall !== null ? (
                <p className="mb-2.5 text-[11.5px] text-ink">
                  You need {shortfall} more {shortfall === 1 ? "token" : "tokens"}.
                </p>
              ) : null}

              {ready ? (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-accent/20 bg-accent-tint/60 p-2.5 text-[11px] leading-[1.35] text-accent">
                  <span className="mt-px grid h-4 w-4 flex-none place-items-center rounded-full bg-accent text-white">
                    <Check width={10} strokeWidth={2.5} />
                  </span>
                  <span>
                    <b className="block font-medium">
                      {result?.reports
                        ? `${result.reports.length} ${result.reports.length === 1 ? "photo" : "photos"} checked`
                        : `${result?.outputs.length} ${result?.outputs.length === 1 ? "file" : "files"} ready`}
                    </b>
                    <span className="opacity-80">
                      {result?.reports
                        ? `${spent} ${spent === 1 ? "token" : "tokens"} used`
                        : `${formatBytes(sourceBytes)} → ${formatBytes(outputBytes)} · ${spent} ${spent === 1 ? "token" : "tokens"}`}
                    </span>
                  </span>
                </div>
              ) : null}

              {ready && result && result.outputs.length > 0 ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void download()}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#111] text-[11.5px] font-medium text-white hover:bg-black"
                  >
                    <Download width={13} />
                    {result.outputs.length > 1 ? "Download ZIP" : "Download"}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Start over"
                    className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted hover:text-ink"
                  >
                    <RotateCcw width={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void process()}
                  disabled={sources.length === 0 || status === "processing" || busy}
                  className="h-9 w-full rounded-md bg-[#111] text-[11.5px] font-medium text-white transition-transform active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {status === "processing"
                    ? progress.total > 1
                      ? `Processing ${progress.done} of ${progress.total}…`
                      : "Processing…"
                    : ready
                      ? "Run again"
                      : `Process ${sources.length || ""} ${sources.length === 1 ? "photo" : "photos"}`.trim()}
                </button>
              )}

              {shortfall !== null ? (
                <Link
                  href="/tokens"
                  className="mt-2 flex h-9 w-full items-center justify-center rounded-md border border-border text-[11.5px] font-medium text-ink"
                >
                  Buy Tokens
                </Link>
              ) : null}

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{
                    width:
                      status === "processing" && progress.total > 0
                        ? `${(progress.done / progress.total) * 100}%`
                        : ready
                          ? "100%"
                          : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
