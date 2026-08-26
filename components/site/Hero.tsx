import Link from "next/link";

import { Container } from "@/components/site/Section";
import { HeroShowcase } from "@/components/site/HeroShowcase";
import { buttonClass } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 max-lap:pt-16 max-lap:pb-14">
      <Container className="flex flex-col items-center text-center">
        <h1 className="max-w-[800px] text-[clamp(38px,5vw,60px)] leading-[1.02] tracking-[-0.035em]">
          Your product photos, ready for{" "}
          <span className="text-accent">every marketplace</span>.
        </h1>
        <p className="mt-5 max-w-[600px] text-[17.5px] leading-[1.55] text-body">
          Turn raw camera-roll photos into compliant sizes, clean backgrounds,
          fast files and named batches — without repeating the work store by store.
        </p>
        <div className="mt-[30px] flex flex-wrap justify-center gap-3 max-mob:w-full max-mob:[&>a]:flex-1">
          <Link href="/signup" className={buttonClass()}>
            Prepare Your Photos
          </Link>
          <a href="#how" className={buttonClass({ variant: "ghost" })}>
            See How It Works
          </a>
        </div>
        <p className="mt-[18px] flex items-center gap-2 text-[13px] text-muted">
          <span className="h-[5px] w-[5px] flex-none rounded-full bg-accent" />
          25 free tokens to start. No card required.
        </p>
      </Container>

      {/* A silent tour of a few finished photos, drawn as a small stack —
        * one plain card peeking out behind the live one — rather than a
        * single flat panel. Not an app UI, not clickable: the real,
        * clickable panel is the TryItPanel section right below. */}
      <div className="relative mx-auto mt-16 w-full max-w-[500px] max-lap:mt-12 max-lap:max-w-[420px] max-mob:mt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-card border border-border bg-surface rotate-[-5deg]"
        />
        <div className="rotate-[1.5deg]">
          <HeroShowcase />
        </div>
      </div>
    </section>
  );
}
