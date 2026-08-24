import type { Metadata } from "next";

import { Footer } from "@/components/site/Footer";
import { Container, Section } from "@/components/site/Section";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${brand.name} handles your data.`,
};

const sections = [
  {
    heading: "1. What we collect",
    body: "Account information you give us — name, email and billing details — and basic usage data, like which tools you use and how many tokens you spend. We don't collect more than we need to run the service.",
  },
  {
    heading: "2. Your photos",
    body: "Photos you upload to process are used only to generate your result. Sample photos aside, WareSnap does not use your images to train any model, and does not share them with third parties.",
  },
  {
    heading: "3. How we use your data",
    body: "To run your account, process payments, send service emails (like receipts and password resets), and improve WareSnap. We don't sell your personal data.",
  },
  {
    heading: "4. Cookies",
    body: "We use a small number of cookies to keep you signed in and remember your preferences. We don't use third-party advertising cookies.",
  },
  {
    heading: "5. Service providers",
    body: "We use trusted providers for hosting, authentication, email delivery and payment processing. Each only receives the data it needs to do its job.",
  },
  {
    heading: "6. Data retention",
    body: "We keep your account data for as long as your account is active. You can request deletion of your account and associated data at any time.",
  },
  {
    heading: "7. Your rights",
    body: "You can access, correct or delete your personal data, and export your account information, by contacting us or through your Account settings.",
  },
  {
    heading: "8. Changes to this policy",
    body: "If we make a material change to how we handle your data, we'll let you know before it takes effect.",
  },
  {
    heading: "9. Contact",
    body: "Questions about your data? Reach us at privacy@waresnap.app.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Section>
        <Container>
          <div className="max-w-[68ch]">
            <div className="eyebrow">Legal</div>
            <h1 className="mt-3 text-[clamp(28px,3.2vw,38px)]">Privacy Policy</h1>
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
