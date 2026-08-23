import Image from "next/image";
import { ChevronRight } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { cn } from "@/lib/utils";

const frames = [
  { label: "Original", source: "original", canvas: false, padding: "", fit: "object-cover" },
  { label: "Clean background", source: "ready", canvas: true, padding: "p-4", fit: "object-contain" },
  { label: "Safe margins", source: "ready", canvas: true, padding: "p-6 max-mob:p-5", fit: "object-contain" },
  { label: "Marketplace ready", source: "ready", canvas: true, padding: "p-2", fit: "object-contain" },
] as const;

const products = [
  {
    name: "Leather wallet",
    originalSrc: "/generated/wallet-original.webp",
    readySrc: "/generated/wallet-ready.webp",
    alt: "Leather wallet product photo",
  },
  {
    name: "Cosmetic tube",
    originalSrc: "/generated/cosmetic-original.webp",
    readySrc: "/generated/cosmetic-ready.webp",
    alt: "Cosmetic tube product photo",
  },
  {
    name: "Gold ring",
    originalSrc: "/generated/ring-original.webp",
    readySrc: "/generated/ring-ready.webp",
    alt: "Gold ring product photo",
  },
];

export function BeforeAfter() {
  return (
    <Section id="before-after" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead
          eyebrow="Before / After"
          title="From raw photo to ready listing."
          lead="No retouching skills required — just an upload."
        />

        <div className="flex flex-col gap-11 max-mob:gap-8">
          {products.map((product) => (
            <div key={product.name}>
              <h3 className="mb-4 text-[14.5px] font-medium tracking-[-0.01em] text-ink">
                {product.name}
              </h3>
              <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 max-mob:gap-1.5">
                {frames.map((frame, index) => (
                  <div key={frame.label} className="flex flex-none items-center gap-2">
                    <figure className="flex flex-none flex-col items-center gap-2.5">
                      <div
                        className={cn(
                          "relative h-[150px] w-[150px] overflow-hidden rounded-ctl border border-border max-mob:h-[124px] max-mob:w-[124px]",
                          frame.canvas ? "bg-white" : "bg-surface",
                        )}
                      >
                        <div className={cn("absolute inset-0", frame.padding)}>
                          <div className="relative h-full w-full overflow-hidden rounded-[4px]">
                            <Image
                              src={frame.source === "original" ? product.originalSrc : product.readySrc}
                              alt={frame.label === "Original" ? product.alt : ""}
                              fill
                              sizes="150px"
                              className={frame.fit}
                            />
                          </div>
                        </div>
                      </div>
                      <figcaption className="text-[12.5px] whitespace-nowrap text-muted">
                        {frame.label}
                      </figcaption>
                    </figure>

                    {index < frames.length - 1 ? (
                      <ChevronRight
                        width={14}
                        height={14}
                        strokeWidth={1.6}
                        className="flex-none text-border-strong"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
