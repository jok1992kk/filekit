"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const getFaqs = (brandName: string) => [
  {
    q: "What are tokens?",
    a: "Tokens are used when you process product images. Different tools use different amounts depending on the work involved.",
  },
  {
    q: "Do purchased tokens expire?",
    a: "No. Extra token packs never expire. Your plan's monthly tokens are used first.",
  },
  {
    q: "What happens to my monthly tokens?",
    a: "Your plan's included tokens refresh at the start of every billing month.",
  },
  {
    q: `Can I use ${brandName} for Amazon and Etsy?`,
    a: `Yes. ${brandName} prepares images for Amazon, Etsy, Shopify, eBay and other marketplaces from a single upload.`,
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Your plan stays active until the end of the billing period.",
  },
  {
    q: "Do I need design experience?",
    a: `No. Pick your marketplace and ${brandName} handles sizes, ratios and formats.`,
  },
  {
    q: `Does ${brandName} generate product images?`,
    a: `No. ${brandName} is built to prepare and optimize the photos you already have.`,
  },
  {
    q: "What image formats are supported?",
    a: "JPG, PNG, WebP and HEIC.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = getFaqs(brand.name);

  return (
    <Section id="faq" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead eyebrow="FAQ" title="Questions, answered." />

        <div className="border-t border-border">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-[18px] text-left text-[15.5px] font-medium text-ink"
                >
                  {item.q}
                  <ChevronDown
                    width={16}
                    height={16}
                    strokeWidth={1.6}
                    className={cn(
                      "flex-none text-muted transition-transform duration-150",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen ? (
                  <p className="max-w-[640px] pb-[18px] text-[14.5px] leading-[1.55] text-body">
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
