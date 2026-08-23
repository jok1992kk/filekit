import { Container } from "@/components/site/Section";
import { marketplaces } from "@/lib/brand";

export function MarketplaceRow() {
  return (
    <div className="border-y border-border bg-surface">
      <Container className="flex flex-wrap items-center gap-11 py-[26px] max-mob:flex-col max-mob:items-start max-mob:gap-4">
        <div className="eyebrow flex-none">Built for where you sell</div>
        <div className="min-w-0 flex-1 overflow-hidden max-mob:w-full">
          <div className="marquee-track flex w-max gap-11 max-mob:gap-[26px]">
            {[...marketplaces, ...marketplaces].map((marketplace, index) => (
              <span
                key={`${marketplace.id}-${index}`}
                className="flex-none text-[19px] font-medium tracking-[-0.02em] text-[#A1A1AA] max-mob:text-[17px]"
              >
                {marketplace.name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
