"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";
import { billing } from "@/lib/billing";
import {
  cycleLabels,
  perLabels,
  plans,
  pricingFineprint,
  yearlyPerMonth,
  type BillingCycle,
} from "@/lib/plans";
import { cn, formatCount, formatUsd } from "@/lib/utils";

const cycles: BillingCycle[] = ["monthly", "yearly"];

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <Section id="pricing" className="pt-0 max-mob:pt-0">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            flush
            eyebrow="Pricing"
            title="Plans that fit how much you list."
          />
          <div className="inline-flex rounded-[9px] bg-surface-2 p-[3px]">
            {cycles.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCycle(option)}
                className={cn(
                  "rounded-[7px] border-0 bg-transparent px-3.5 py-[7px] text-[13.5px] font-[450] text-body",
                  cycle === option &&
                    "bg-white font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,.06)]",
                )}
              >
                {cycleLabels[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 items-start gap-5 max-tab:grid-cols-1">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-card border border-border bg-white px-6 py-[26px]",
                plan.featured && "-mt-2.5 border-accent pt-9 max-tab:mt-0",
              )}
            >
              {plan.badge ? (
                <span className="absolute top-3.5 right-5 rounded-full bg-accent px-[9px] py-[3px] text-[10.5px] font-medium tracking-[.02em] text-white">
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="text-[15.5px] font-medium">{plan.name}</h3>

              <div className="mt-4 flex items-baseline gap-1.5">
                <b className="text-[38px] font-medium leading-none tracking-[-0.035em] text-ink">
                  {formatUsd(plan.price[cycle])}
                </b>
                <span className="text-[14px] text-muted">
                  {perLabels[cycle]}
                </span>
              </div>

              <div className="mt-2 min-h-5 text-[13px] text-muted">
                {formatCount(plan.monthlyTokens)} tokens every month
                {cycle === "yearly"
                  ? ` · ${formatUsd(yearlyPerMonth(plan))}/mo billed yearly`
                  : ""}
              </div>

              {/* Signed-out visitors land on sign-up first; middleware sends
                * them on to checkout once they have an account. */}
              <Link
                href={`/signup?next=${encodeURIComponent(billing.planCheckoutUrl(plan.id, cycle))}`}
                className={buttonClass({
                  variant: plan.featured ? "primary" : "ghost",
                  block: true,
                  className: "mt-5",
                })}
              >
                {plan.cta}
              </Link>

              <ul className="mt-[22px] flex flex-col gap-[9px] border-t border-border pt-5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-[9px] text-[14px] leading-[1.45] text-body"
                  >
                    <Check
                      width={13}
                      height={13}
                      strokeWidth={1.8}
                      className="mt-1 flex-none text-accent"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-[26px] text-[13px] text-muted">{pricingFineprint}</p>
      </Container>
    </Section>
  );
}
