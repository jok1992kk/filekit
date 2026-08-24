import Link from "next/link";

import { EditorPreview } from "@/components/editor/EditorPreview";
import { Container } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative pt-[84px] pb-[72px] max-lap:py-14">
      <Container className="grid grid-cols-[minmax(0,470px)_minmax(0,1fr)] items-center gap-14 max-lap:grid-cols-1 max-lap:gap-11">
        <div>
          <h1 className="text-[clamp(38px,4.6vw,58px)] leading-[1.03] tracking-[-0.033em]">
            Product photos ready for every marketplace.
          </h1>
          <p className="mt-5 max-w-[452px] text-[17.5px] leading-[1.55] text-body max-lap:max-w-[600px]">
            Resize, optimize and prepare your product images for Amazon, Etsy,
            Shopify and eBay — without doing the same work over and over.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3 max-mob:[&>a]:flex-1">
            <Link href="/signup" className={buttonClass()}>
              Prepare Your Photos
            </Link>
            <a href="#how" className={buttonClass({ variant: "ghost" })}>
              See How It Works
            </a>
          </div>
          <p className="mt-[18px] flex items-center gap-2 text-[13px] text-muted">
            <span className="h-[5px] w-[5px] flex-none rounded-full bg-accent" />
            25 free tokens to start. No card required.
          </p>
        </div>

        {/* A passive showcase loop — not clickable. The real, clickable
          * editor lives on /editor and in the dashboard. */}
        <div className="mr-[-140px] max-lap:mr-0">
          <EditorPreview mode="demo" />
        </div>
      </Container>
    </section>
  );
}
