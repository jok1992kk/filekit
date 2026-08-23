import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Section";
import { getCurrentUser, tokenBalance } from "@/lib/auth";
import { billing } from "@/lib/billing";
import {
  packsFineprint,
  pricePerTokenLabel,
  savingPercent,
  tokenPacks,
} from "@/lib/token-packs";
import { formatCount, formatUsd } from "@/lib/utils";

export const metadata: Metadata = { title: "Get more tokens" };

export default async function TokensPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <Container className="py-11 max-mob:py-8">
      <div className="max-w-[640px]">
        <h1 className="text-[clamp(26px,3vw,34px)]">Get more tokens.</h1>
        <p className="mt-3 text-[16px] leading-[1.55]">
          You have <b className="font-medium text-ink">{formatCount(tokenBalance(user))} tokens</b>{" "}
          available. Top up any time — larger packs cost less per token.
        </p>
      </div>

      <div className="mt-9 grid grid-cols-3 gap-4 max-tab:grid-cols-2 max-mob:grid-cols-1">
        {tokenPacks.map((pack) => {
          const saving = savingPercent(pack);
          return (
            <Link
              key={pack.id}
              href={billing.packCheckoutUrl(pack.id)}
              className={
                "relative flex flex-col rounded-card border bg-white p-5 transition-colors duration-150 hover:border-border-strong " +
                (pack.badge === "Most Popular" ? "border-accent" : "border-border")
              }
            >
              {pack.badge ? (
                <span
                  className={
                    "absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-medium " +
                    (pack.badge === "Most Popular"
                      ? "bg-accent-tint text-accent"
                      : "bg-surface-2 text-body")
                  }
                >
                  {pack.badge}
                </span>
              ) : null}

              <div className="text-[24px] font-medium tracking-[-0.02em] text-ink">
                {formatCount(pack.tokens)}
              </div>
              <div className="text-[13.5px] text-muted">tokens</div>

              <div className="mt-4 text-[19px] font-medium text-ink">
                {formatUsd(pack.price)}
              </div>
              <div className="mt-1 text-[12.5px] text-muted">{pricePerTokenLabel(pack)}</div>

              {saving !== null && saving > 0 ? (
                <div className="mt-3 text-[12.5px] font-medium text-accent">Save {saving}%</div>
              ) : null}
            </Link>
          );
        })}
      </div>

      <p className="mt-6 text-[13.5px] text-muted">{packsFineprint}</p>
    </Container>
  );
}
