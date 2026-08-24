import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/site/Footer";
import { Container, Section, SectionHead } from "@/components/site/Section";
import { brand } from "@/lib/brand";
import { landingSlugFor } from "@/lib/tool-pages";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Tools",
  description: `Every tool ${brand.name} offers to prepare product photos for Amazon, Etsy, Shopify and eBay.`,
};

export default function ToolsPage() {
  return (
    <>
      <Section className="pb-0">
        <Container>
          <SectionHead
            eyebrow="Tools"
            title="Ten tools. One workflow."
            lead="Everything a listing needs, and nothing you'll never open."
          />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-5 gap-px overflow-hidden rounded-card border border-border bg-border max-lap:grid-cols-3 max-mob:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const landingSlug = landingSlugFor(tool.slug);
              const href = landingSlug
                ? `/tools/${landingSlug}`
                : `/editor?tool=${tool.slug}`;
              const cardClass =
                "relative flex min-h-[148px] flex-col bg-white px-[18px] py-5 hover:bg-surface";

              const content = (
                <>
                  {tool.sellerPlus ? (
                    <span className="absolute top-3.5 right-3.5 rounded-full bg-accent-tint px-[7px] py-0.5 text-[10px] font-medium tracking-[.01em] text-accent">
                      Seller+
                    </span>
                  ) : null}
                  <div className="mb-3.5 text-body">
                    <Icon width={20} height={20} strokeWidth={1.4} />
                  </div>
                  <h3 className="text-[14.5px] font-medium tracking-[-0.015em]">
                    {tool.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-[1.45] text-muted">
                    {tool.oneLiner}
                  </p>
                  <span className="mt-auto pt-3 text-[12px] font-medium text-muted">
                    {landingSlug ? "Learn more" : "Open demo"} →
                  </span>
                </>
              );

              return <Link key={tool.slug} href={href} className={cardClass}>{content}</Link>;
            })}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}
