import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { EditorPreview } from "@/components/editor/EditorPreview";
import { Container, Section } from "@/components/site/Section";
import { Footer } from "@/components/site/Footer";
import { buttonClass } from "@/components/ui/Button";
import { getToolPage, landingSlugFor, relatedTools, toolPages } from "@/lib/tool-pages";
import { costLabel } from "@/lib/tools";

export function generateStaticParams() {
  return toolPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getToolPage(slug);
  if (!page) return {};
  return { title: page.title, description: page.metaDescription };
}

export default async function ToolLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getToolPage(slug);
  if (!page) notFound();

  const related = relatedTools(page.toolSlug);

  return (
    <>
      <Section className="pb-0">
        <Container>
          <div className="max-w-[640px]">
            <div className="eyebrow">Tool</div>
            <h1 className="mt-3 text-[clamp(28px,3.2vw,38px)]">{page.title}</h1>
            <p className="mt-3.5 text-[16.5px] leading-[1.55]">{page.intro}</p>
            <Link href="/signup" className={buttonClass({ className: "mt-6" })}>
              Prepare Your Photos
            </Link>
          </div>

          <div className="mt-10">
            <EditorPreview
              mode="interactive"
              initialToolSlug={page.toolSlug}
              initialMarketplaceId={page.marketplaceId}
            />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="eyebrow">Related tools</div>
          <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-card border border-border bg-border max-tab:grid-cols-1">
            {related.map((tool) => {
              const Icon = tool.icon;
              const href = landingSlugFor(tool.slug)
                ? `/tools/${landingSlugFor(tool.slug)}`
                : "/tools";
              return (
                <Link
                  key={tool.slug}
                  href={href}
                  className="flex items-start gap-3 bg-white px-5 py-5 hover:bg-surface"
                >
                  <Icon width={18} height={18} strokeWidth={1.4} className="mt-0.5 flex-none text-body" />
                  <span>
                    <span className="flex items-center gap-1.5 text-[14.5px] font-medium tracking-[-0.01em] text-ink">
                      {tool.name}
                      <ArrowRight width={13} height={13} strokeWidth={1.8} className="text-muted" />
                    </span>
                    <span className="mt-1 block text-[13px] text-muted">
                      {costLabel(tool.cost)}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  );
}
