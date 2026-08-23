import { BadgeCheck, Layers3, TimerReset } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { brand } from "@/lib/brand";

const proofPoints = [
  {
    icon: BadgeCheck,
    title: "Marketplace presets, not guesswork",
    body: "Export dimensions and aspect ratios are ready for Amazon, Etsy, Shopify, eBay and five more storefronts.",
  },
  {
    icon: Layers3,
    title: "One source, a consistent catalog",
    body: "Use the same framing and margins across every listing, even when each marketplace asks for a different size.",
  },
  {
    icon: TimerReset,
    title: "Start free, stay flexible",
    body: "Try the workflow with 25 tokens and no card. Purchased token packs never expire.",
  },
] as const;

/** Product-backed proof for launch. Real customer quotes should replace or
 * follow this section only after the seller has approved publication. */
export function ProofPoints() {
  return (
    <Section id="proof" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead
          eyebrow={`Why ${brand.name}`}
          title="Clear rules. Predictable results."
          lead="Professional listing photos should come from a repeatable workflow — not another round of manual resizing."
        />

        <div className="grid grid-cols-3 gap-5 max-tab:grid-cols-1">
          {proofPoints.map((point) => {
            const Icon = point.icon;

            return (
              <article
                key={point.title}
                className="rounded-card border border-border bg-white p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent">
                  <Icon width={19} height={19} strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-[16px] font-medium tracking-[-0.015em] text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-body">
                  {point.body}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-5 text-center text-[12.5px] leading-[1.5] text-muted">
          Launch-stage product facts. Customer stories will be added only with seller approval.
        </p>
      </Container>
    </Section>
  );
}
