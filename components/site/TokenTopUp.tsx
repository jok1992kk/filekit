import { Container, Section } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";

export function TokenTopUp() {
  return (
    <Section id="token-top-up" className="pt-0 max-mob:pt-0">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-card border border-border bg-surface px-9 py-9 max-mob:flex-col max-mob:items-start max-mob:px-6 max-mob:py-7">
          <div className="max-w-[480px]">
            <h2 className="text-[24px] tracking-[-0.02em]">Need more processing?</h2>
            <p className="mt-2.5 text-[15px] leading-[1.55] text-body">
              Your plan doesn&apos;t have to limit your busy months. Buy extra
              tokens anytime — they never expire.
            </p>
          </div>
          <a href="/signup?next=%2Ftokens" className={buttonClass({ className: "max-mob:w-full" })}>
            View Token Packs
          </a>
        </div>
      </Container>
    </Section>
  );
}
