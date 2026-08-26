"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const SLIDE_MS = 3200;

/** A muted product photo, ready for one marketplace, and the label to show
 * under it. Distinct assets/marketplaces per slide so the loop reads as a
 * tour of the product rather than one repeated example. */
const slides = [
  {
    src: "/brand/rove-merch.webp",
    alt: "ROVE outdoor brand merchandise collection",
    marketplace: "ROVE merch drop",
    size: "6 files · batch ready",
  },
  {
    src: "/brand/mela-serum-original.webp",
    alt: "MELA skincare campaign photograph",
    marketplace: "MELA campaign",
    size: "Scene → listing",
  },
  {
    src: "/brand/noon-coffee-ready.webp",
    alt: "NOON coffee marketplace packshot",
    marketplace: "NOON marketplace pack",
    size: "9 storefront exports",
  },
  {
    src: "/brand/rove-cap-cutout.webp",
    alt: "ROVE cap with the background removed",
    marketplace: "Clean product cutout",
    size: "Transparent PNG",
  },
];

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

/**
 * The hero visual: a silent, non-interactive tour of a few finished photos —
 * styled like a video preview (segmented progress bar, no buttons, no form
 * controls) precisely so it never reads as an app doing something on its
 * own. The real, clickable editor is the TryItPanel section right below.
 */
export function HeroShowcase() {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % slides.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, SLIDE_MS);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const slide = slides[index];

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,.04),0_24px_48px_-32px_rgba(15,15,16,.22)]">
      <div className="flex gap-1.5 p-3">
        {slides.map((item, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              key={i === index ? `${i}-${cycle}` : i}
              className="h-full w-full rounded-full bg-accent"
              style={{
                transform: `scaleX(${i < index || reducedMotion ? 1 : 0})`,
                transformOrigin: "left",
                animation:
                  i === index && !reducedMotion
                    ? `segment-fill ${SLIDE_MS}ms linear forwards`
                    : undefined,
              }}
            />
          </div>
        ))}
      </div>

      <div className="relative aspect-square w-full bg-[#f3f6f2]">
        {slides.map((item, i) => (
          <div
            key={item.src}
            className="absolute inset-0 flex items-center justify-center p-[8%] transition-opacity duration-500 ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <div className="relative h-full w-full">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1081px) 460px, 90vw"
                priority={i === 0}
                className="rounded-[8px] object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className={cn("text-[13.5px] font-medium text-ink", !reducedMotion && "demo-fade-in")} key={`label-${index}`}>
          {slide.marketplace}
        </span>
        <span className={cn("text-[12px] text-muted", !reducedMotion && "demo-fade-in")} key={`size-${index}`}>
          {slide.size}
        </span>
      </div>
    </div>
  );
}
