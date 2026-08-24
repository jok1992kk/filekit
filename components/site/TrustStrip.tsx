import { Container } from "@/components/site/Section";
import { marketplaces } from "@/lib/brand";
import { SIGNUP_FREE_TOKENS } from "@/lib/plans";
import { tools } from "@/lib/tools";

/** Real facts about the product — no invented customer metrics, see CLAUDE.md. */
const stats = [
  { value: `${marketplaces.length}`, label: "marketplaces from one upload" },
  { value: `${tools.length}`, label: "tools, everything a listing needs" },
  { value: `${SIGNUP_FREE_TOKENS}`, label: "free tokens on signup, no card" },
];

export function TrustStrip() {
  return (
    <div className="border-b border-border bg-surface">
      <Container className="grid grid-cols-3 gap-6 py-10 max-mob:grid-cols-1 max-mob:gap-7 max-mob:py-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-2.5 max-mob:items-center">
            <b className="text-[30px] font-medium leading-none tracking-[-0.03em] text-accent">
              {stat.value}
            </b>
            <span className="text-[14px] leading-[1.35] text-muted">{stat.label}</span>
          </div>
        ))}
      </Container>
    </div>
  );
}
