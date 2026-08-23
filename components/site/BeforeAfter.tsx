import Image from "next/image";
import { ChevronRight } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { cn } from "@/lib/utils";

/** Same photo, different padding on a white canvas — no real processing
 * happens at any step, see CLAUDE.md. */
const frames = [
  { label: "Original", canvas: false, padding: "" },
  { label: "Centered", canvas: true, padding: "p-6 max-mob:p-5" },
  { label: "White background", canvas: true, padding: "p-3 max-mob:p-2.5" },
  { label: "Marketplace ready", canvas: true, padding: "p-0" },
] as const;

const products = [
  {
    name: "Leather wallet",
    src: "/samples/leather-wallet.jpg",
    alt: "Leather wallet product photo",
  },
  {
    name: "Cosmetic tube",
    src: "/samples/cosmetic-tube.jpg",
    alt: "Cosmetic tube product photo",
  },
  {
    name: "Gold ring",
    src: "/samples/gold-ring.jpg",
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
                              src={product.src}
                              alt={frame.label === "Original" ? product.alt : ""}
                              fill
                              sizes="150px"
                              className="object-cover"
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
