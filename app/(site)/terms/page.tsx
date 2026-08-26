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
    body: "By accessing WareSnap or creating an account, you agree to these terms. You must be legally able to enter into this agreement and use the service in compliance with the laws that apply to you.",
  },
  {
    heading: "2. Your account",
    body: "You are responsible for the information you provide, activity under your account and keeping your credentials secure. Contact us promptly if you believe your account has been accessed without permission.",
  },
  {
    heading: "3. Tokens and plans",
    body: "When paid plans are available, the price, billing period and included usage are shown before purchase. Subscriptions renew automatically until cancelled. Plan tokens refresh each billing period; separately purchased token packs do not expire unless the checkout states otherwise.",
  },
  {
    heading: "4. Your photos",
    body: "You retain ownership of the photos and other content you submit. You grant WareSnap only the limited rights needed to process that content and provide the requested output. You are responsible for having the necessary rights to every file you use.",
  },
  {
    heading: "5. Acceptable use",
    body: "Do not use WareSnap to infringe another person's rights, distribute unlawful or harmful material, bypass service limits, probe the service for vulnerabilities or interfere with its operation.",
  },
  {
    heading: "6. Marketplace requirements",
    body: "WareSnap prepares files using the marketplace presets shown in the product. Marketplaces can change their requirements, and you remain responsible for reviewing each file before publishing it.",
  },
  {
    heading: "7. Availability and warranties",
    body: `${brand.name} is provided on an "as available" basis. We work to keep the service reliable, but do not guarantee uninterrupted access or that every output will be accepted by a third-party marketplace.`,
  },
  {
    heading: "8. Suspension and termination",
    body: "We may restrict or suspend access when necessary to protect users, the service or third parties, or when these terms are materially violated. You may stop using WareSnap and request account deletion at any time.",
  },
  {
    heading: "9. Liability",
    body: "To the maximum extent permitted by law, WareSnap is not liable for indirect, incidental or consequential loss, lost profits, lost sales or third-party marketplace decisions resulting from use of the service.",
  },
  {
    heading: "10. Changes to these terms",
    body: "We may update these terms as the product changes. Material updates will be communicated through the service or another reasonable channel before they take effect.",
  },
  {
    heading: "11. Contact",
    body: "Questions about these terms can be sent to support@waresnap.app.",
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
            <p className="mt-3.5 text-[13.5px] text-muted">Last updated August 25, 2026</p>

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
