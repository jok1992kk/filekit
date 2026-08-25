import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Footer } from "@/components/site/Footer";
import { Container, Section, SectionHead } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Examples",
  description: `Product-photo workflows before and after ${brand.name} prepares them for Amazon, Etsy and Shopify.`,
};

const targets = [
  { label: "Amazon", ratio: "1 / 1" },
  { label: "Etsy", ratio: "5 / 4" },
  { label: "Shopify", ratio: "1 / 1" },
] as const;

const products = [
  {
    name: "ROVE trail cap",
    category: "Outdoor merch",
    originalSrc: "/brand/rove-cap-original.webp",
    readySrc: "/brand/rove-cap-cutout.webp",
    alt: "ROVE trail cap product photo",
  },
  {
    name: "MELA peach serum",
    category: "Skincare",
    originalSrc: "/brand/mela-serum-original.webp",
    readySrc: "/brand/mela-serum-ready.webp",
    alt: "MELA serum product photo",
  },
  {
    name: "NOON coffee set",
    category: "Food & drink",
    originalSrc: "/brand/noon-coffee-original.webp",
    readySrc: "/brand/noon-coffee-ready.webp",
    alt: "NOON coffee product photo",
  },
  {
    name: "Gold ring",
    category: "Jewelry",
    originalSrc: "/generated/ring-original.webp",
    readySrc: "/generated/ring-ready.webp",
    alt: "Gold ring product photo",
  },
  {
    name: "Ceramic mug",
    category: "Home decor",
    originalSrc: "/generated/mug-original.webp",
    readySrc: "/generated/mug-original.webp",
    alt: "Ceramic mug product photo",
  },
  {
    name: "Wooden bowls",
    category: "Home & kitchen",
    originalSrc: "/generated/bowls-original.webp",
    readySrc: "/generated/bowls-ready.webp",
    alt: "Wooden bowls product photo",
  },
];

export default function ExamplesPage() {
  return (
    <>
      <Section className="pb-0">
        <Container>
          <SectionHead
            eyebrow="Examples"
            title="One photo, every storefront."
            lead="Six product workflows, prepared for Amazon, Etsy and Shopify from the same original."
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col gap-11 max-mob:gap-8">
            {products.map((product) => (
              <div key={product.name}>
                <h3 className="mb-4 flex items-baseline gap-2 text-[14.5px] font-medium tracking-[-0.01em] text-ink">
                  {product.name}
                  <span className="text-[12.5px] font-normal text-muted">
                    {product.category}
                  </span>
                </h3>
                <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 max-mob:gap-1.5">
                  <div className="flex flex-none items-center gap-2">
                    <figure className="flex flex-none flex-col items-center gap-2.5">
                      <div className="relative h-[150px] w-[150px] overflow-hidden rounded-ctl border border-border bg-surface max-mob:h-[124px] max-mob:w-[124px]">
                        <Image
                          src={product.originalSrc}
                          alt={product.alt}
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="text-[12.5px] whitespace-nowrap text-muted">
                        Original
                      </figcaption>
                    </figure>
                    <ChevronRight
                      width={14}
                      height={14}
                      strokeWidth={1.6}
                      className="flex-none text-border-strong"
                    />
                  </div>

                  {targets.map((target, index) => (
                    <div key={target.label} className="flex flex-none items-center gap-2">
                      <figure className="flex flex-none flex-col items-center gap-2.5">
                        <div
                          className="relative h-[150px] overflow-hidden rounded-ctl border border-border bg-white max-mob:h-[124px]"
                          style={{ aspectRatio: target.ratio }}
                        >
                          <Image
                            src={product.readySrc}
                            alt=""
                            fill
                            sizes="150px"
                            className="object-contain p-[10%]"
                          />
                        </div>
                        <figcaption className="text-[12.5px] whitespace-nowrap text-muted">
                          {target.label}
                        </figcaption>
                      </figure>
                      {index < targets.length - 1 ? (
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

          <div className="mt-14 flex flex-col items-start gap-4 rounded-card border border-border bg-surface p-8 max-mob:p-6">
            <h3 className="text-[19px]">Prepare your own product photos.</h3>
            <p className="max-w-[480px] text-[14.5px] leading-[1.55]">
              Choose a marketplace, apply the right workflow and export every image in the format you need.
            </p>
            <Link href="/editor" className={buttonClass()}>
              Open the Editor
            </Link>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}
