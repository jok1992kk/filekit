import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { marketplaces } from "@/lib/brand";

/** One sample photo stands in for every marketplace preview — no real
 * processing happens, see CLAUDE.md. */
const sample = { src: "/samples/wooden-bowls.jpg", alt: "Wooden bowls product photo" };

export function MarketplacePack() {
  return (
    <Section id="marketplace-pack" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead
          eyebrow="Marketplace Pack"
          title="One upload. Every storefront."
          lead={`Stop resizing and exporting the same product photos one marketplace at a time — FileKit cuts a set for all ${marketplaces.length}.`}
        />

        <div className="grid grid-cols-[minmax(0,200px)_auto_minmax(0,1fr)] items-center gap-10 max-tab:grid-cols-1 max-tab:justify-items-center max-tab:gap-6">
          <figure className="flex flex-col items-center gap-3">
            <div className="relative h-[180px] w-[180px] overflow-hidden rounded-card border border-border bg-white">
              <Image
                src={sample.src}
                alt={sample.alt}
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
            <figcaption className="text-[13px] text-muted">Original</figcaption>
          </figure>

          <ArrowRight
            width={22}
            height={22}
            strokeWidth={1.5}
            className="text-border-strong max-tab:rotate-90"
          />

          <div className="grid grid-cols-3 gap-5 max-tab:grid-cols-2 max-mob:grid-cols-1">
            {marketplaces.map((marketplace) => (
              <figure
                key={marketplace.id}
                className="flex flex-col items-center gap-2.5"
              >
                <div
                  className="relative w-full max-w-[190px] overflow-hidden rounded-ctl border border-border bg-white"
                  style={{ aspectRatio: `${marketplace.width} / ${marketplace.height}` }}
                >
                  <Image
                    src={sample.src}
                    alt=""
                    fill
                    sizes="190px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-[12.5px] text-muted">
                  {marketplace.name} {marketplace.width} × {marketplace.height}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
