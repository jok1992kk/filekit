import { BeforeAfter } from "@/components/site/BeforeAfter";
import { FAQ } from "@/components/site/FAQ";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { MarketplacePack } from "@/components/site/MarketplacePack";
import { MarketplaceRow } from "@/components/site/MarketplaceRow";
import { Pricing } from "@/components/site/Pricing";
import { ProofPoints } from "@/components/site/ProofPoints";
import { TokenTopUp } from "@/components/site/TokenTopUp";
import { ToolsGrid } from "@/components/site/ToolsGrid";
import { TrustStrip } from "@/components/site/TrustStrip";
import { Workflow } from "@/components/site/Workflow";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarketplaceRow />
      <TrustStrip />
      <Workflow />
      <ToolsGrid />
      <MarketplacePack />
      <BeforeAfter />
      <ProofPoints />
      <Pricing />
      <TokenTopUp />
      <FAQ />
      <Footer />
    </>
  );
}
