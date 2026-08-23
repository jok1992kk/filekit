"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { tools } from "@/lib/tools";
import { brand } from "@/lib/brand";

export type EditorMode = "static" | "demo";

/** The four demo photos in the filmstrip, plus the one on the stage. */
const samples = [
  {
    src: "/generated/wallet-original.webp",
    readySrc: "/generated/wallet-ready.webp",
    alt: "Leather wallet product photo",
  },
  {
    src: "/generated/sweaters-original.webp",
    readySrc: "/generated/sweaters-original.webp",
    alt: "Folded sweaters product photo",
  },
  {
    src: "/generated/ring-original.webp",
    readySrc: "/generated/ring-ready.webp",
    alt: "Gold ring product photo",
  },
  {
    src: "/generated/mug-original.webp",
    readySrc: "/generated/mug-original.webp",
    alt: "Ceramic mug product photo",
  },
];

const stage = samples[0];

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
const DEMO_TARGETS = [
  { name: "Etsy", size: "2000 × 1600", ratio: "5:4", w: 245, h: 196, wMobile: 200, hMobile: 160 },
  { name: "Mercari", size: "1200 × 1500", ratio: "4:5", w: 196, h: 245, wMobile: 160, hMobile: 200 },
] as const;

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

/**
 * The editor, drawn once and reused: framed and inert in the hero
 * (`mode="static"`), or running a scripted 9s demo loop (`mode="demo"`)
 * that resizes one image for a marketplace — CSS/React only, no video.
 * Alternates a landscape and a portrait target each pass (see DEMO_TARGETS)
 * so the crop itself, not just the label, visibly changes on repeat views.
 */
export function EditorPreview({ mode = "static" }: { mode?: EditorMode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInView(rootRef, mode === "demo");
  const isDemo = mode === "demo";
  const active = isDemo && inView && !reducedMotion;
  const t = useDemoClock(active);
  const target = DEMO_TARGETS[useLoopIndex(t, DEMO_TARGETS.length)];

  const isTarget = isDemo && t >= T_HIGHLIGHT_START && t < T_RESET;
  const isHighlighted = isDemo && t >= T_HIGHLIGHT_START && t < T_HIGHLIGHT_END;
  const isPressed = isDemo && t >= T_PROCESS_START && t < T_PROCESS_END;
  /* The bar stays mounted the whole loop so the 0→100% fill is a real
   * transition on a live element rather than a fresh mount at scaleX(1). */
  const isProgressVisible = isDemo && t >= T_PROCESS_START && t < T_RESET;
  const isProgressFilled = isProgressVisible;
  const isReady = isDemo && t >= T_READY && t < T_RESET;

  const marketplace = isTarget ? target.name : "Amazon";
  const outputSize = isTarget ? target.size : "2000 × 2000";
  const outputRatio = isTarget ? target.ratio : "1:1";
  const tokenBalance = isReady ? 285 : 287;

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
            key={tokenBalance}
            className={"font-medium text-ink" + (isDemo ? " demo-fade-in" : "")}
          >
            {tokenBalance}
          </span>
          tokens
        </div>
      </div>

      <div className="grid min-h-[392px] grid-cols-[158px_minmax(0,1fr)_216px] max-tab:min-h-0 max-tab:grid-cols-1">
        {/* Left rail — the ten tools */}
        <div className="border-r border-border bg-white px-2 py-3 max-tab:border-r-0 max-tab:border-b max-tab:border-border max-tab:p-2.5">
          <div className="eyebrow px-2 pb-2 text-[10px] max-tab:hidden">Tools</div>
          <ul className="max-tab:flex max-tab:gap-1.5 max-tab:overflow-x-auto max-tab:[scrollbar-width:none] max-tab:[&::-webkit-scrollbar]:hidden">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const active = index === 0;
              return (
                <li
                  key={tool.slug}
                  className={
                    "relative flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] tracking-[-0.005em] max-tab:rounded-full max-tab:border max-tab:border-border max-tab:px-[11px] max-tab:py-[5px] max-tab:whitespace-nowrap " +
                    (active
                      ? "bg-accent-tint font-medium text-ink max-tab:border-accent"
                      : "text-muted")
                  }
                >
                  <Icon
                    width={14}
                    height={14}
                    strokeWidth={1.4}
                    className={
                      "flex-none " +
                      (active ? "text-accent opacity-100" : "opacity-80")
                    }
                  />
                  {tool.display.railLabel}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Centre — the image on the canvas */}
        <div className="flex min-w-0 flex-col bg-surface">
          <div className="flex h-[34px] items-center justify-between border-b border-border bg-white px-3 text-[11.5px] text-muted">
            <b className="font-medium text-ink">IMG_4471.HEIC</b>
            <span>3024 × 4032 · 4.1 MB</span>
          </div>
          <div className="flex flex-1 items-center justify-center p-[22px]">
            {isDemo ? (
              <div
                className="grid place-items-center h-[var(--stage-h)] max-mob:h-[var(--stage-h-m)]"
                style={
                  {
                    "--stage-h": `${Math.max(196, target.h)}px`,
                    "--stage-h-m": `${Math.max(160, target.hMobile)}px`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="relative col-start-1 row-start-1 h-[196px] w-[196px] overflow-hidden rounded-ctl border border-border bg-white max-mob:h-40 max-mob:w-40"
                  style={{
                    opacity: isReady ? 0 : 1,
                    transition: "opacity 200ms ease-out",
                  }}
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
                      "--ready-w": `${target.w}px`,
                      "--ready-h": `${target.h}px`,
                      "--ready-w-m": `${target.wMobile}px`,
                      "--ready-h-m": `${target.hMobile}px`,
                      opacity: isReady ? 1 : 0,
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
                  priority
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 border-t border-border bg-white px-3 py-2.5">
            {samples.map((sample, index) => (
              <div
                key={sample.src}
                className={
                  "relative h-10 w-10 overflow-hidden rounded-md border bg-surface " +
                  (index === 0
                    ? "border-accent shadow-[0_0_0_2px_var(--color-accent-tint)]"
                    : "border-border")
                }
              >
                <Image
                  src={sample.src}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right — settings for the active tool */}
        <div className="flex flex-col gap-3.5 border-l border-border bg-white p-3.5 max-tab:border-l-0 max-tab:border-t max-tab:border-border">
          <div>
            <span className="eyebrow mb-1.5 block text-[10px]">Marketplace</span>
            <div
              className="flex h-8 items-center justify-between rounded-md border bg-white px-2.5 text-[12.5px] text-ink"
              style={{
                borderColor: isHighlighted
                  ? "var(--color-accent)"
                  : "var(--color-border)",
                boxShadow: isHighlighted
                  ? "0 0 0 2px var(--color-accent-tint)"
                  : "none",
                transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
              }}
            >
              <span key={marketplace} className={isDemo ? "demo-fade-in" : undefined}>
                {marketplace}
              </span>
              <span className="text-[10px] text-muted">▾</span>
            </div>
          </div>

          <div>
            <span className="eyebrow mb-1.5 block text-[10px]">Format</span>
            <div className="flex overflow-hidden rounded-md border border-border">
              {["JPG", "PNG", "WebP"].map((format, index) => (
                <div
                  key={format}
                  className={
                    "flex-1 border-r border-border py-1.5 text-center text-[12px] last:border-r-0 " +
                    (index === 0
                      ? "bg-surface-2 font-medium text-ink"
                      : "text-muted")
                  }
                >
                  {format}
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="eyebrow mb-1.5 block text-[10px]">Output</span>
            <div className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-[12.5px] text-ink">
              <span key={outputSize} className={isDemo ? "demo-fade-in" : undefined}>
                {outputSize}
              </span>{" "}
              <small
                key={outputRatio}
                className={
                  "text-[11px] text-muted" + (isDemo ? " demo-fade-in" : "")
                }
              >
                {outputRatio}
              </small>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-3 text-[12.5px] text-muted">
            Estimated cost{" "}
            <b className="text-[13px] font-medium text-accent">2 tokens</b>
          </div>

          {isDemo ? (
            <>
              <div className="flex h-4 items-center">
                {isReady ? (
                  <span className="demo-fade-in text-[12px] font-medium text-accent">
                    Ready — 2 tokens used
                  </span>
                ) : null}
              </div>
              <div className="mt-auto flex flex-col gap-2 max-tab:mt-1">
                <button
                  type="button"
                  className="h-[34px] w-full rounded-md border-0 bg-[#111] text-[12.5px] font-medium text-white max-tab:h-[38px]"
                  style={{
                    transform: isPressed ? "scale(0.97)" : "scale(1)",
                    transition: "transform 200ms ease-out",
                  }}
                >
                  Process Image
                </button>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full w-full rounded-full bg-accent"
                    style={{
                      transform: `scaleX(${isProgressFilled ? 1 : 0})`,
                      transformOrigin: "left",
                      opacity: isProgressVisible ? 1 : 0,
                      transition: `transform ${PROGRESS_MS}ms linear, opacity 200ms ease-out`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="mt-auto h-[34px] w-full rounded-md border-0 bg-[#111] text-[12.5px] font-medium text-white max-tab:mt-1 max-tab:h-[38px]"
            >
              Process Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
