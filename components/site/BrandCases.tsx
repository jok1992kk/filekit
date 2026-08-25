import Image from "next/image";

import { Container, Section, SectionHead } from "@/components/site/Section";

const cases = [
  {
    brand: "ROVE",
    category: "Outdoor merch",
    src: "/brand/rove-merch.webp",
    alt: "ROVE outdoor merchandise collection",
    line: "One drop, consistently named and cropped for every channel.",
    tools: ["Bulk Rename", "Smart Crop", "Compressor"],
    tone: "bg-[#edf0e7]",
  },
  {
    brand: "MELA",
    category: "Skincare",
    src: "/brand/mela-serum-original.webp",
    alt: "MELA skincare serum campaign image",
    line: "Campaign photography becomes a clean, compliant catalog set.",
    tools: ["White Background", "Center Product", "Resize"],
    tone: "bg-[#fff0e9]",
  },
  {
    brand: "NOON",
    category: "Specialty coffee",
    src: "/brand/noon-coffee-original.webp",
    alt: "NOON specialty coffee campaign image",
    line: "A launch image turned into nine storefront-ready exports.",
    tools: ["Marketplace Pack", "Quality Check", "Converter"],
    tone: "bg-[#f7eee4]",
  },
];

export function BrandCases() {
  return (
    <Section id="brand-cases" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead
          eyebrow="Product workflows"
          title="Consistent assets across every channel."
          lead="See how focused tools turn campaign photography into clean, marketplace-ready product files."
        />

        <div className="grid grid-cols-3 gap-5 max-tab:grid-cols-1">
          {cases.map((item) => (
            <article key={item.brand} className="group overflow-hidden rounded-[14px] border border-border bg-white">
              <div className={`relative aspect-[4/3] overflow-hidden ${item.tone}`}>
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 900px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-medium text-ink shadow-sm backdrop-blur">Workflow</span>
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3"><h3 className="text-[18px] tracking-[-0.025em]">{item.brand}</h3><span className="text-[11.5px] text-muted">{item.category}</span></div>
                <p className="mt-2 text-[13.5px] leading-[1.5] text-body">{item.line}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">{item.tools.map((tool) => <span key={tool} className="rounded-full bg-surface px-2.5 py-1 text-[10.5px] text-muted">{tool}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
