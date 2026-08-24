import type { Metadata } from "next";

import { Footer } from "@/components/site/Footer";
import { Container, Section } from "@/components/site/Section";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that cover using ${brand.name}.`,
};

const sections = [
  {
    heading: "1. Using WareSnap",
    body: "By creating an account or using WareSnap, you agree to these terms. You must be at least 18 years old, or have a parent or guardian's permission, to use the service.",
  },
  {
    heading: "2. Your account",
    body: "You're responsible for the activity on your account and for keeping your login credentials secure. Let us know right away if you think your account has been accessed without your permission.",
  },
  {
    heading: "3. Tokens and plans",
    body: "Subscription plans renew automatically each billing period until cancelled. Monthly tokens included in a plan do not carry over between billing periods. Purchased token packs never expire. You can cancel a subscription anytime from Account — access continues until the end of the current billing period.",
  },
  {
    heading: "4. Your photos",
    body: "You keep ownership of every photo you upload. You're responsible for having the rights to any image you process through WareSnap, and for how you use the files it returns to you.",
  },
  {
    heading: "5. Acceptable use",
    body: "Don't use WareSnap to process images you don't have the rights to, to attempt to disrupt the service, or to violate any applicable law.",
  },
  {
    heading: "6. Service availability",
    body: `${brand.name} is provided "as is." We aim for high availability but don't guarantee the service will be uninterrupted or error-free.`,
  },
  {
    heading: "7. Changes to these terms",
    body: "We may update these terms from time to time. If we make a material change, we'll let you know before it takes effect.",
  },
  {
    heading: "8. Contact",
    body: "Questions about these terms? Reach us at support@waresnap.app.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Section>
        <Container>
          <div className="max-w-[68ch]">
            <div className="eyebrow">Legal</div>
            <h1 className="mt-3 text-[clamp(28px,3.2vw,38px)]">Terms of Service</h1>
            <p className="mt-3.5 text-[13.5px] text-muted">Last updated January 1, 2026</p>

            <div className="mt-10 flex flex-col gap-8">
              {sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-[17px]">{section.heading}</h2>
                  <p className="mt-2.5 text-[15px] leading-[1.65] text-body">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}
