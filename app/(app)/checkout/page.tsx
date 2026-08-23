import type { Metadata } from "next";
import Link from "next/link";

import { completeCheckoutAction } from "@/app/actions/tokens";
import { Container } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";
import { demoCheckoutEnabled } from "@/lib/billing";
import { getPlan, perLabels, type BillingCycle, type PlanId } from "@/lib/plans";
import { tokenPacks } from "@/lib/token-packs";
import { formatCount, formatUsd } from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout" };

type Params = { type?: string; id?: string; cycle?: string };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { type, id, cycle: rawCycle } = await searchParams;
  const cycle: BillingCycle = rawCycle === "yearly" ? "yearly" : "monthly";

  const pack =
    type === "pack" ? tokenPacks.find((candidate) => candidate.id === id) : undefined;
  const plan = type === "plan" ? getPlan(id as PlanId) : undefined;

  if (!pack && !plan) {
    return (
      <Container className="py-11">
        <h1 className="text-[clamp(26px,3vw,34px)]">Nothing to check out.</h1>
        <p className="mt-3 text-[16px]">Pick a token pack or a plan first.</p>
        <Link href="/tokens" className={buttonClass({ className: "mt-6" })}>
          See token packs
        </Link>
      </Container>
    );
  }

  const title = pack ? `${formatCount(pack.tokens)} tokens` : `${plan!.name} plan`;
  const detail = pack
    ? "One-off purchase · never expires"
    : `Billed ${cycle} · ${formatCount(plan!.monthlyTokens)} tokens each month`;
  const price = pack ? pack.price : plan!.price[cycle];
  const per = pack ? "" : perLabels[cycle];

  return (
    <Container className="py-11 max-mob:py-8">
      <div className="mx-auto max-w-[440px]">
        <h1 className="text-[clamp(26px,3vw,34px)]">Checkout</h1>

        <div className="mt-7 rounded-card border border-border bg-white p-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-[16.5px] font-medium text-ink">{title}</div>
              <div className="mt-1 text-[13.5px] text-muted">{detail}</div>
            </div>
            <div className="whitespace-nowrap text-[19px] font-medium text-ink">
              {formatUsd(price)}
              <small className="text-[13px] font-normal text-muted">{per}</small>
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-[15px]">
            <span className="text-muted">Total due today</span>
            <b className="font-medium text-ink">{formatUsd(price)}</b>
          </div>
        </div>

        <p className="mt-4 text-[13.5px] text-muted">Payment provider not connected yet.</p>

        {demoCheckoutEnabled ? (
          <form action={completeCheckoutAction} className="mt-5">
            <input type="hidden" name="type" value={pack ? "pack" : "plan"} />
            <input type="hidden" name="id" value={pack ? pack.id : plan!.id} />
            <input type="hidden" name="cycle" value={cycle} />
            <button type="submit" className={buttonClass({ block: true })}>
              Simulate successful payment
            </button>
          </form>
        ) : null}

        <p className="mt-4 text-center text-[13px] text-muted">
          <Link href="/tokens" className="hover:text-ink">
            ← Back
          </Link>
        </p>
      </div>
    </Container>
  );
}
