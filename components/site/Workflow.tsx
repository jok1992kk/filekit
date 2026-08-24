import { Container, Section, SectionHead } from "@/components/site/Section";

const steps = [
  {
    num: "01",
    title: "Upload your product photos",
    line: "Straight from your phone or camera. HEIC included.",
  },
  {
    num: "02",
    title: "Choose where you're selling",
    line: "Sizes, ratios and formats are already set for each storefront.",
  },
  {
    num: "03",
    title: "Download ready-to-list images",
    line: "One file or the whole batch, named and sorted.",
  },
];

export function Workflow() {
  return (
    <Section id="how">
      <Container>
        <SectionHead eyebrow="How it works" title="Three steps, every time." />
        <div className="grid grid-cols-3 gap-8 border-t border-border pt-7 max-mob:grid-cols-1 max-mob:gap-[26px]">
          {steps.map((step) => (
            <div key={step.num}>
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-accent text-[15px] font-medium tracking-[-0.02em] text-white">
                {step.num}
              </div>
              <h3 className="mt-3.5 text-[19px]">{step.title}</h3>
              <p className="mt-2 max-w-[280px] text-[14.5px] text-muted">
                {step.line}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
