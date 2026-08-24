import type { Metadata } from "next";

import { BillingFAQ } from "@/components/site/BillingFAQ";
import { Footer } from "@/components/site/Footer";
import { Pricing } from "@/components/site/Pricing";
import { Container, Section } from "@/components/site/Section";
import { TokenTopUp } from "@/components/site/TokenTopUp";
import { brand } from "@/lib/brand";
import { freeTokensLine } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${brand.name} plans and token packs — pricing for preparing product photos at any volume.`,
};

export default function PricingPage() {
  return (
    <>
      <Section className="pb-0">
        <Container>
          <div className="max-w-[640px]">
            <h1 className="text-[clamp(28px,3.2vw,38px)]">Simple pricing for every seller.</h1>
            <p className="mt-3.5 text-[16.5px] leading-[1.55]">{freeTokensLine}</p>
          </div>
        </Container>
      </Section>

      <Pricing />
      <TokenTopUp />
      <BillingFAQ />
      <Footer />
    </>
  );
}
