"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { runToolAction } from "@/app/actions/tokens";
import { brand, marketplaces } from "@/lib/brand";
import { bulkRenameExample, tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export type EditorMode = "static" | "demo" | "interactive";

/** The four demo photos in the filmstrip, plus the one on the stage. */
const samples = [
  {
    src: "/generated/wallet-original.webp",
    readySrc: "/generated/wallet-ready.webp",
    alt: "Leather wallet product photo",
    name: "IMG_4471.HEIC",
    meta: "3024 × 4032 · 4.1 MB",
  },
  {
    src: "/generated/sweaters-original.webp",
    readySrc: "/generated/sweaters-original.webp",
    alt: "Folded sweaters product photo",
    name: "IMG_4482.HEIC",
    meta: "3024 × 4032 · 3.7 MB",
  },
  {
    src: "/generated/ring-original.webp",
    readySrc: "/generated/ring-ready.webp",
    alt: "Gold ring product photo",
    name: "IMG_4490.HEIC",
    meta: "3024 × 4032 · 2.9 MB",
  },
  {
    src: "/generated/mug-original.webp",
    readySrc: "/generated/mug-original.webp",
    alt: "Ceramic mug product photo",
    name: "IMG_4501.HEIC",
    meta: "3024 × 4032 · 3.2 MB",
  },
];

/**
 * Which controls the right-hand panel shows for a given tool. This is
 * presentation, not product data, so it lives here rather than in
 * `lib/tools.ts` — that file stays the source of truth for names and prices.
 */
type PanelKind = "marketplace" | "compress" | "rename" | "check";

const PANELS: Record<string, PanelKind> = {
  "marketplace-resize": "marketplace",
  "smart-crop": "marketplace",
  "marketplace-pack": "marketplace",
  "product-centering": "marketplace",
  "white-background": "marketplace",
  "background-remover": "marketplace",
  "image-compressor": "compress",
  "image-converter": "compress",
  "bulk-rename": "rename",
  "quality-checker": "check",
};

const FORMATS = ["JPG", "PNG", "WebP"] as const;
const QUALITIES = ["Small", "Balanced", "Best"] as const;

/** Scales a marketplace's target size down to a frame that fits the stage. */
function fitFrame(width: number, height: number, max: number) {
  const scale = max / Math.max(width, height);
  return { w: Math.round(width * scale), h: Math.round(height * scale) };
}

function sizeLabel(width: number, height: number): string {
  return `${width.toLocaleString("en-US")} × ${height.toLocaleString("en-US")}`;
}

/* ------------------------------------------------------------------ *
 * Demo timeline — one 9s loop, expressed as offsets in milliseconds.
 * Every visual in `mode="demo"` is a pure function of `t` so the loop
 * is just `t % LOOP_MS`; nothing here depends on render count or how
 * long the tab was hidden.
 * ------------------------------------------------------------------ */
const LOOP_MS = 9000;
const T_HIGHLIGHT_START = 2000;
const T_HIGHLIGHT_END = 3500;
const T_PROCESS_START = 3500;
const PROGRESS_MS = 1200;
const T_PROCESS_END = T_PROCESS_START + PROGRESS_MS;
const T_READY = 5000;
const T_RESET = 7500;

/** How long the interactive Process run takes before the result appears. */
const RUN_MS = 1000;

function useDemoClock(active: boolean) {
  const [t, setT] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!active) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      startRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now - elapsedRef.current;
      elapsedRef.current = now - startRef.current;
      setT(elapsedRef.current % LOOP_MS);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  return t;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** Which output the loop demonstrates this time round — alternates each
 * pass so repeat viewers see the tool handle a landscape and a portrait
 * crop, not the same resize twice. */
const DEMO_TARGETS = ["etsy", "mercari"] as const;

function useLoopIndex(t: number, count: number) {
  const [index, setIndex] = useState(0);
  const prevT = useRef(t);

  useEffect(() => {
    if (t < prevT.current) setIndex((i) => (i + 1) % count);
    prevT.current = t;
  }, [t, count]);

  return index;
}

function useInView(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return inView;
}

type RunStatus = "idle" | "processing" | "ready";

/**
 * The editor, drawn once and reused (CLAUDE.md): framed and inert
 * (`mode="static"`), running a scripted 9s loop with nothing clickable
 * (`mode="demo"`, used in the hero), or a real, inert-until-clicked preview
 * (`mode="interactive"`, used on /editor and /dashboard/editor). Interactive
 * mode never auto-runs — the sign-up nudge and the "ready" state only ever
 * follow an actual click, never the passing of time.
 */
export function EditorPreview({
  mode = "static",
  signedIn = false,
  initialBalance = 287,
  initialToolSlug,
  initialMarketplaceId = "amazon",
}: {
  mode?: EditorMode;
  /** Interactive mode only: charge real tokens instead of prompting to sign up. */
  signedIn?: boolean;
  initialBalance?: number;
  /** Opens the editor on this tool instead of the first one — used by the
   * per-tool landing pages so the demo matches the page it's embedded on. */
  initialToolSlug?: string;
  initialMarketplaceId?: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isInteractive = mode === "interactive";

  const initialToolIndex = initialToolSlug
    ? Math.max(0, tools.findIndex((tool) => tool.slug === initialToolSlug))
    : 0;

  /* ---------------- interactive state ---------------- */
  const [toolIndex, setToolIndex] = useState(initialToolIndex);
  const [marketplaceId, setMarketplaceId] = useState<string>(initialMarketplaceId);
  const [format, setFormat] = useState<string>("JPG");
  const [quality, setQuality] = useState<string>("Balanced");
  const [stageIndex, setStageIndex] = useState(0);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [spent, setSpent] = useState(0);
  const [balance, setBalance] = useState(initialBalance);
  const [shortfall, setShortfall] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);

  // Only mode="demo" auto-plays. An interactive editor — the hero, /editor,
  // /dashboard/editor — opens as a plain, inert preview and does nothing
  // until the visitor actually clicks it: auto-running the demo and popping
  // the sign-up nudge before any real interaction reads as the product
  // doing something behind the user's back.
  const demoDriven = mode === "demo";
  const inView = useInView(rootRef, demoDriven);
  const loopActive = demoDriven && inView && !reducedMotion;
  const t = useDemoClock(loopActive);
  const demoTargetId = DEMO_TARGETS[useLoopIndex(t, DEMO_TARGETS.length)];

  /* ---------------- the view model both modes render ---------------- */
  const isDemoPhase = demoDriven && loopActive;
  const inDemoTarget = isDemoPhase && t >= T_HIGHLIGHT_START && t < T_RESET;

  const tool = tools[toolIndex];
  const panel = PANELS[tool.slug] ?? "marketplace";

  const shownToolIndex = demoDriven ? 0 : toolIndex;
  const shownTool = tools[shownToolIndex];
  const shownPanel = demoDriven ? "marketplace" : panel;

  const effectiveMarketplaceId = inDemoTarget ? demoTargetId : marketplaceId;
  const marketplace =
    marketplaces.find((item) => item.id === effectiveMarketplaceId) ?? marketplaces[0];

  const desktopFrame = fitFrame(marketplace.width, marketplace.height, 245);
  const mobileFrame = fitFrame(marketplace.width, marketplace.height, 200);

  const highlighted = isDemoPhase && t >= T_HIGHLIGHT_START && t < T_HIGHLIGHT_END;
  const pressed = isDemoPhase
    ? t >= T_PROCESS_START && t < T_PROCESS_END
    : status === "processing";
  const progressVisible = isDemoPhase
    ? t >= T_PROCESS_START && t < T_RESET
    : status !== "idle";
  const progressFilled = progressVisible;
  const ready = isDemoPhase ? t >= T_READY && t < T_RESET : status === "ready";

  const cost = shownTool.cost.tokens;
  const shownBalance = isDemoPhase ? (ready ? 285 : 287) : balance;
  const stage = samples[demoDriven ? 0 : stageIndex];
  const animate = demoDriven;

  /* ---------------- actions ---------------- */
  const handleProcess = useCallback(async () => {
    if (status === "processing") return;

    setShortfall(null);
    setStatus("processing");
    await new Promise((resolve) => setTimeout(resolve, RUN_MS));

    if (signedIn) {
      const result = await runToolAction(tool.slug, 1);
      if (!result.ok) {
        setStatus("idle");
        setRunId((id) => id + 1);
        if (result.error === "insufficient_tokens") setShortfall(result.needed);
        return;
      }
      setBalance(result.balance);
      setSpent(result.cost);
      // The header's balance pill is server-rendered, so it needs a refresh
      // to catch up with the spend the action just recorded.
      router.refresh();
    } else {
      setSpent(cost);
    }

    setStatus("ready");
  }, [cost, router, signedIn, status, tool.slug]);

  const reset = useCallback(() => {
    setStatus("idle");
    setShortfall(null);
    // Remount the progress bar so it starts empty instead of unwinding.
    setRunId((id) => id + 1);
  }, []);

  const selectTool = useCallback(
    (index: number) => {
      setToolIndex(index);
      reset();
    },
    [reset],
  );

  const selectStage = useCallback(
    (index: number) => {
      setStageIndex(index);
      reset();
    },
    [reset],
  );

  /* ---------------- shared control classes ---------------- */
  const controlBox =
    "flex h-8 items-center justify-between rounded-md border bg-white px-2.5 text-[12.5px] text-ink";

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-card border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,.04),0_24px_48px_-32px_rgba(15,15,16,.22)]"
    >
      {/* Window chrome */}
      <div className="flex h-9 items-center gap-2 border-b border-border bg-white px-3">
        <div className="flex flex-none gap-1.5">
          <i className="block h-[9px] w-[9px] rounded-full bg-[#E4E4E7]" />
          <i className="block h-[9px] w-[9px] rounded-full bg-[#E4E4E7]" />
          <i className="block h-[9px] w-[9px] rounded-full bg-[#E4E4E7]" />
        </div>
        <div className="flex-1 text-center text-[11.5px] tracking-[-0.01em] text-muted">
          {brand.name} — Editor
        </div>
        <div className="flex flex-none items-center gap-1 rounded-full border border-border bg-white px-2 py-[3px] text-[10.5px] text-muted">
          <span
            key={shownBalance}
            className={"font-medium text-ink" + (animate ? " demo-fade-in" : "")}
          >
            {shownBalance.toLocaleString("en-US")}
          </span>
          {shownBalance === 1 ? "token" : "tokens"}
        </div>
      </div>

      <div className="grid min-h-[392px] grid-cols-[158px_minmax(0,1fr)_216px] max-tab:min-h-0 max-tab:grid-cols-1">
        {/* Left rail — the ten tools */}
        <div className="min-w-0 border-r border-border bg-white px-2 py-3 max-tab:border-r-0 max-tab:border-b max-tab:border-border max-tab:p-2.5">
          <div className="field-label px-2 pb-2 text-[10px] max-tab:hidden">Tools</div>
          <ul className="max-tab:flex max-tab:gap-1.5 max-tab:overflow-x-auto max-tab:[scrollbar-width:none] max-tab:[&::-webkit-scrollbar]:hidden">
            {tools.map((item, index) => {
              const Icon = item.icon;
              const active = index === shownToolIndex;
              const className =
                "relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] tracking-[-0.005em] max-tab:rounded-full max-tab:border max-tab:border-border max-tab:px-[11px] max-tab:py-[5px] max-tab:whitespace-nowrap " +
                (active
                  ? "bg-accent-tint font-medium text-ink max-tab:border-accent"
                  : "text-muted") +
                (isInteractive && !active ? " hover:bg-surface hover:text-ink" : "");
              const icon = (
                <Icon
                  width={14}
                  height={14}
                  strokeWidth={1.4}
                  className={"flex-none " + (active ? "text-accent opacity-100" : "opacity-80")}
                />
              );

              return (
                <li key={item.slug} className="max-tab:flex-none">
                  {isInteractive ? (
                    <button
                      type="button"
                      onClick={() => selectTool(index)}
                      aria-pressed={active}
                      className={className}
                    >
                      {icon}
                      {item.display.railLabel}
                    </button>
                  ) : (
                    <span className={className}>
                      {icon}
                      {item.display.railLabel}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Centre — the image on the canvas */}
        <div className="flex min-w-0 flex-col bg-surface">
          <div className="flex h-[34px] items-center justify-between border-b border-border bg-white px-3 text-[11.5px] text-muted">
            <b className="font-medium text-ink">{stage.name}</b>
            <span>{stage.meta}</span>
          </div>
          <div className="flex flex-1 items-center justify-center p-[22px]">
            {shownPanel === "marketplace" ? (
              <div
                className="grid place-items-center h-[var(--stage-h)] max-mob:h-[var(--stage-h-m)]"
                style={
                  {
                    "--stage-h": `${Math.max(196, desktopFrame.h)}px`,
                    "--stage-h-m": `${Math.max(160, mobileFrame.h)}px`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="relative col-start-1 row-start-1 h-[196px] w-[196px] overflow-hidden rounded-ctl border border-border bg-white max-mob:h-40 max-mob:w-40"
                  style={{ opacity: ready ? 0 : 1, transition: "opacity 200ms ease-out" }}
                >
                  <Image
                    src={stage.src}
                    alt={stage.alt}
                    fill
                    sizes="196px"
                    priority
                    className="object-cover"
                  />
                </div>
                <div
                  className="relative col-start-1 row-start-1 overflow-hidden rounded-ctl border border-border bg-white h-[var(--ready-h)] w-[var(--ready-w)] max-mob:h-[var(--ready-h-m)] max-mob:w-[var(--ready-w-m)]"
                  style={
                    {
                      "--ready-w": `${desktopFrame.w}px`,
                      "--ready-h": `${desktopFrame.h}px`,
                      "--ready-w-m": `${mobileFrame.w}px`,
                      "--ready-h-m": `${mobileFrame.h}px`,
                      opacity: ready ? 1 : 0,
                      transition: "opacity 200ms ease-out",
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={stage.readySrc}
                    alt={stage.alt}
                    fill
                    sizes="245px"
                    className="object-contain p-[7%]"
                  />
                </div>
              </div>
            ) : (
              <div className="relative h-[196px] w-[196px] overflow-hidden rounded-ctl border border-border bg-white max-mob:h-40 max-mob:w-40">
                <Image
                  src={stage.src}
                  alt={stage.alt}
                  fill
                  sizes="196px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 border-t border-border bg-white px-3 py-2.5">
            {samples.map((sample, index) => {
              const active = index === (demoDriven ? 0 : stageIndex);
              const className =
                "relative h-10 w-10 overflow-hidden rounded-md border bg-surface " +
                (active
                  ? "border-accent shadow-[0_0_0_2px_var(--color-accent-tint)]"
                  : "border-border");

              return isInteractive ? (
                <button
                  key={sample.src}
                  type="button"
                  onClick={() => selectStage(index)}
                  aria-label={sample.alt}
                  aria-pressed={active}
                  className={className}
                >
                  <Image src={sample.src} alt="" fill sizes="40px" className="object-cover" />
                </button>
              ) : (
                <div key={sample.src} className={className}>
                  <Image src={sample.src} alt="" fill sizes="40px" className="object-cover" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — settings for the active tool */}
        <div className="flex min-w-0 flex-col gap-3.5 border-l border-border bg-white p-3.5 max-tab:border-l-0 max-tab:border-t max-tab:border-border">
          {shownPanel === "marketplace" ? (
            <>
              <div>
                <span className="field-label mb-1.5 block text-[10px]">Marketplace</span>
                {isInteractive ? (
                  <div className="relative">
                    <select
                      value={effectiveMarketplaceId}
                      onChange={(event) => {
                        setMarketplaceId(event.target.value);
                        reset();
                      }}
                      aria-label="Marketplace"
                      className={
                        controlBox +
                        " w-full appearance-none border-border pr-7 outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-tint)]"
                      }
                    >
                      {marketplaces.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                      ▾
                    </span>
                  </div>
                ) : (
                  <div
                    className={controlBox}
                    style={{
                      borderColor: highlighted ? "var(--color-accent)" : "var(--color-border)",
                      boxShadow: highlighted ? "0 0 0 2px var(--color-accent-tint)" : "none",
                      transition:
                        "border-color 200ms ease-out, box-shadow 200ms ease-out",
                    }}
                  >
                    <span
                      key={marketplace.name}
                      className={animate ? "demo-fade-in" : undefined}
                    >
                      {marketplace.name}
                    </span>
                    <span className="text-[10px] text-muted">▾</span>
                  </div>
                )}
              </div>

              <FormatRow
                value={format}
                interactive={isInteractive}
                onChange={(value) => {
                  setFormat(value);
                  reset();
                }}
              />

              <div>
                <span className="field-label mb-1.5 block text-[10px]">Output</span>
                <div className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-[12.5px] text-ink">
                  <span
                    key={`${marketplace.width}x${marketplace.height}`}
                    className={animate ? "demo-fade-in" : undefined}
                  >
                    {sizeLabel(marketplace.width, marketplace.height)}
                  </span>{" "}
                  <small
                    key={marketplace.ratio}
                    className={"text-[11px] text-muted" + (animate ? " demo-fade-in" : "")}
                  >
                    {marketplace.ratio}
                  </small>
                </div>
              </div>
            </>
          ) : null}

          {shownPanel === "compress" ? (
            <>
              <FormatRow
                value={format}
                interactive={isInteractive}
                onChange={(value) => {
                  setFormat(value);
                  reset();
                }}
              />

              <div>
                <span className="field-label mb-1.5 block text-[10px]">Quality</span>
                <div className="flex overflow-hidden rounded-md border border-border">
                  {QUALITIES.map((item) => {
                    const active = item === quality;
                    const className =
                      "flex-1 border-r border-border py-1.5 text-center text-[12px] last:border-r-0 " +
                      (active ? "bg-surface-2 font-medium text-ink" : "text-muted");
                    return isInteractive ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setQuality(item);
                          reset();
                        }}
                        className={className}
                      >
                        {item}
                      </button>
                    ) : (
                      <div key={item} className={className}>
                        {item}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="field-label mb-1.5 block text-[10px]">Estimated size</span>
                <div className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-[12.5px] text-ink">
                  {quality === "Small" ? "310 KB" : quality === "Best" ? "1.1 MB" : "540 KB"}
                  <small className="text-[11px] text-muted">from 4.1 MB</small>
                </div>
              </div>
            </>
          ) : null}

          {shownPanel === "rename" ? (
            <>
              <div>
                <span className="field-label mb-1.5 block text-[10px]">Pattern</span>
                <div className="rounded-md border border-border px-2.5 py-2 text-[12.5px] text-ink">
                  {"{product}-{index}"}
                </div>
              </div>
              <div>
                <span className="field-label mb-1.5 block text-[10px]">Preview</span>
                <div className="rounded-md border border-border px-2.5 py-2 text-[12px] text-body">
                  {bulkRenameExample}
                </div>
              </div>
            </>
          ) : null}

          {shownPanel === "check" ? (
            <div>
              <span className="field-label mb-1.5 block text-[10px]">Checks</span>
              <ul className="flex flex-col gap-1.5 text-[12.5px] text-body">
                {["Resolution", "Aspect ratio", "File size", "Colour profile"].map((check) => (
                  <li key={check} className="flex items-center justify-between">
                    {check}
                    <span className="text-[11px] text-muted">on</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex items-baseline justify-between border-t border-border pt-3 text-[12.5px] text-muted">
            Estimated cost{" "}
            <b className="text-[13px] font-medium text-accent">
              {cost} {cost === 1 ? "token" : "tokens"}
            </b>
          </div>

          {/* Status line — success, or the reason the run did not happen. */}
          <div className="flex min-h-4 items-center">
            {shortfall !== null ? (
              <span className="text-[12px] text-ink">
                You need {shortfall} more {shortfall === 1 ? "token" : "tokens"}.
              </span>
            ) : ready ? (
              <span className={"text-[12px] font-medium text-accent" + (animate ? " demo-fade-in" : "")}>
                Ready — {isDemoPhase ? 2 : spent} {(isDemoPhase ? 2 : spent) === 1 ? "token" : "tokens"} used
              </span>
            ) : null}
          </div>

          {/* Post-run actions: the signed-out path is the sign-up nudge. */}
          {isInteractive && ready ? (
            signedIn ? (
              <div className="flex flex-col gap-2">
                <a
                  href={shownPanel === "marketplace" ? stage.readySrc : stage.src}
                  download
                  className="flex h-[34px] w-full items-center justify-center rounded-md bg-[#111] text-[12.5px] font-medium text-white hover:bg-black"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="h-[34px] w-full rounded-md border border-border bg-white text-[12.5px] font-medium text-ink hover:border-border-strong"
                >
                  Process another
                </button>
              </div>
            ) : (
              <div className="rounded-md border border-border bg-surface p-3">
                <p className="text-[12.5px] leading-[1.5] text-body">
                  Create a free account to download this file.
                </p>
                <Link
                  href="/signup"
                  className="mt-2.5 flex h-[34px] w-full items-center justify-center rounded-md bg-[#111] text-[12.5px] font-medium text-white hover:bg-black"
                >
                  Create free account
                </Link>
              </div>
            )
          ) : null}

          {shortfall !== null ? (
            <Link
              href="/tokens"
              className="flex h-[34px] w-full items-center justify-center rounded-md border border-border bg-white text-[12.5px] font-medium text-ink hover:border-border-strong"
            >
              Buy Tokens
            </Link>
          ) : null}

          {/* The demo keeps the button on screen through its ready phase; only
            * a real interactive run swaps it for Download / Process another. */}
          {!(isInteractive && ready) ? (
            <div className="mt-auto flex flex-col gap-2 max-tab:mt-1">
              <button
                type="button"
                onClick={isInteractive ? handleProcess : undefined}
                disabled={status === "processing"}
                aria-hidden={!isInteractive}
                tabIndex={isInteractive ? undefined : -1}
                className={cn(
                  "h-[34px] w-full rounded-md border-0 bg-[#111] text-[12.5px] font-medium text-white max-tab:h-[38px] disabled:opacity-70",
                  !isInteractive && "cursor-default",
                )}
                style={{
                  transform: pressed ? "scale(0.97)" : "scale(1)",
                  transition: "transform 200ms ease-out",
                }}
              >
                {status === "processing" ? "Processing…" : "Process Image"}
              </button>
              <div key={runId} className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full w-full rounded-full bg-accent"
                  style={{
                    transform: `scaleX(${progressFilled ? 1 : 0})`,
                    transformOrigin: "left",
                    opacity: progressVisible ? 1 : 0,
                    transition: `transform ${isDemoPhase ? PROGRESS_MS : RUN_MS}ms linear, opacity 200ms ease-out`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FormatRow({
  value,
  interactive,
  onChange,
}: {
  value: string;
  interactive: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="field-label mb-1.5 block text-[10px]">Format</span>
      <div className="flex overflow-hidden rounded-md border border-border">
        {FORMATS.map((item) => {
          const active = item === value;
          const className =
            "flex-1 border-r border-border py-1.5 text-center text-[12px] last:border-r-0 " +
            (active ? "bg-surface-2 font-medium text-ink" : "text-muted");

          return interactive ? (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={className}
            >
              {item}
            </button>
          ) : (
            <div key={item} className={className}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
