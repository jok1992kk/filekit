"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime from Account — the change applies to your next billing cycle.",
  },
  {
    q: "What happens to unused monthly tokens?",
    a: "They don't roll over. Purchased token packs never expire, so buy extra only when you'll actually use it.",
  },
  {
    q: "Do you offer refunds?",
    a: "If something's wrong with a charge, contact us and we'll sort it out.",
  },
  {
    q: "Is there a free trial?",
    a: "Every account starts with 25 free tokens — enough to try every tool before you subscribe.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit and debit cards.",
  },
];

/** Billing-specific questions for /pricing (SPEC.md Stage 6) — distinct from
 * the product FAQ on the home page. */
export function BillingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead eyebrow="Billing" title="Pricing questions, answered." />

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
