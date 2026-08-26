import { BeforeAfter } from "@/components/site/BeforeAfter";
import { BrandCases } from "@/components/site/BrandCases";
import { FAQ } from "@/components/site/FAQ";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { MarketplacePack } from "@/components/site/MarketplacePack";
import { MarketplaceRow } from "@/components/site/MarketplaceRow";
import { Pricing } from "@/components/site/Pricing";
import { TokenTopUp } from "@/components/site/TokenTopUp";
import { ToolsGrid } from "@/components/site/ToolsGrid";
import { TrustStrip } from "@/components/site/TrustStrip";
import { TryItPanel } from "@/components/site/TryItPanel";
import { Workflow } from "@/components/site/Workflow";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TryItPanel />
      <MarketplaceRow />
      <TrustStrip />
      <Workflow />
      <ToolsGrid />
      <BrandCases />
      <MarketplacePack />
      <BeforeAfter />
      <Pricing />
      <TokenTopUp />
      <FAQ />
      <Footer />
    </>
  );
}
