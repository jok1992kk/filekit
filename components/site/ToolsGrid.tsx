import Link from "next/link";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { landingSlugFor } from "@/lib/tool-pages";
import { tools } from "@/lib/tools";

export function ToolsGrid() {
  return (
    <Section id="tools" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead
          eyebrow="Tools"
          title="Ten tools. One workflow."
          lead="Everything a listing needs, and nothing you'll never open."
        />

        <div className="grid grid-cols-5 gap-px overflow-hidden rounded-card border border-border bg-border max-lap:grid-cols-3 max-mob:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const slug = landingSlugFor(tool.slug);
            const className =
              "relative flex min-h-[132px] flex-col bg-white px-[18px] py-5 hover:bg-surface";
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
                <h4 className="text-[14.5px] font-medium tracking-[-0.015em]">
                  {tool.display.gridTitle}
                </h4>
                <p className="mt-1.5 text-[13px] leading-[1.45] text-muted">
                  {tool.display.gridLine}
                </p>
              </>
            );

            return (
              <Link
                key={tool.slug}
                href={slug ? `/tools/${slug}` : `/editor?tool=${tool.slug}`}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
