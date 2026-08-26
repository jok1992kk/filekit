import { Container, Section } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";

export function TokenTopUp() {
  return (
    <Section id="token-top-up" className="pt-0 max-mob:pt-0">
      <Container>
        {/* The page's one solid-green surface. Green everywhere else is a
          * thin thread — eyebrows, ticks, badges — so spending the full
          * brand colour here marks this as the closing call to action. */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-card bg-accent px-9 py-9 max-mob:flex-col max-mob:items-start max-mob:px-6 max-mob:py-7">
          <div className="max-w-[480px]">
            <h2 className="text-[24px] tracking-[-0.02em] text-white">
              Need more processing?
            </h2>
            <p className="mt-2.5 text-[15px] leading-[1.55] text-white/75">
              Your plan doesn&apos;t have to limit your busy months. Buy extra
              tokens anytime — they never expire.
            </p>
          </div>
          <a
            href="/pricing"
            className={buttonClass({
              className:
                "bg-white text-accent hover:bg-accent-tint max-mob:w-full",
            })}
          >
            Compare Plans
          </a>
        </div>
      </Container>
    </Section>
  );
}
