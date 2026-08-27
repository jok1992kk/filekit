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
    body: "We collect information you provide, such as your name and email, together with essential account, device and usage data needed to operate, secure and improve WareSnap. Payment details, when payments are enabled, are handled by the payment provider rather than stored directly by WareSnap.",
  },
  {
    heading: "2. Your photos",
    body: "Photos you submit are used to perform the processing you request and deliver the result. WareSnap does not sell your files or use them to train third-party models. Files are shared only with service providers required to complete the requested operation.",
  },
  {
    heading: "3. How we use your data",
    body: "We use data to provide and secure the service, manage accounts, fulfil requests, communicate important service information, provide support and understand product performance. We do not sell personal data.",
  },
  {
    heading: "4. Cookies",
    body: "We use essential cookies to maintain sessions, protect accounts and remember product preferences. Optional analytics, when enabled, are handled according to applicable consent requirements.",
  },
  {
    heading: "5. Service providers",
    body: "We may use specialist providers for hosting, authentication, email delivery, analytics and payments. Each provider receives only the information needed for its role and is required to protect it.",
  },
  {
    heading: "6. Data retention",
    body: "We retain account data while your account is active and for a limited period afterwards where needed for security, legal or financial obligations. Processing files are retained only for the period needed to provide the requested service, unless you choose to save them.",
  },
  {
    heading: "7. Your rights",
    body: "Depending on where you live, you may have rights to access, correct, delete, restrict or export your personal data and to object to certain processing. Requests can be sent to the contact below.",
  },
  {
    heading: "8. International processing",
    body: "Service providers may process data in countries other than your own. Where required, we use appropriate safeguards for international transfers.",
  },
  {
    heading: "9. Security",
    body: "We use reasonable technical and organisational safeguards designed to protect account information and files. No online service can guarantee absolute security.",
  },
  {
    heading: "10. Changes to this policy",
    body: "We may update this policy as WareSnap evolves. Material changes will be communicated through the service or another reasonable channel.",
  },
  {
    heading: "11. Contact",
    body: "Privacy questions and data requests can be sent to privacy@waresnap.online.",
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
