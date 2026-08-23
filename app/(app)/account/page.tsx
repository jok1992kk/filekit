import type { Metadata } from "next";
import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Container } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";
import { auth, getCurrentUser } from "@/lib/auth";
import type { LedgerEntry } from "@/lib/auth/types";
import { cycleLabels, monthlyAllowanceFor, planLabel } from "@/lib/plans";
import { getTool } from "@/lib/tools";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function describe(entry: LedgerEntry): string {
  switch (entry.reason) {
    case "signup_bonus":
      return "Signup bonus";
    case "pack_purchase":
      return "Token pack";
    case "plan_change":
      return "Plan tokens";
    case "tool_run":
      return entry.tool ? (getTool(entry.tool)?.name ?? "Tool run") : "Tool run";
  }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border py-3.5 last:border-b-0">
      <span className="text-[14px] text-muted">{label}</span>
      <span className="text-right text-[14.5px] text-ink">{value}</span>
    </div>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const allowance = monthlyAllowanceFor(user.plan);
  const ledger = await auth.ledgerFor(user.id, 8);

  return (
    <Container className="py-11 max-mob:py-8">
      <h1 className="text-[clamp(26px,3vw,34px)]">Account</h1>

      <div className="mt-8 grid grid-cols-2 gap-6 max-tab:grid-cols-1">
        <section className="rounded-card border border-border bg-white p-6">
          <h2 className="mb-1 text-[17px]">Plan</h2>
          <Row label="Email" value={user.email} />
          <Row label="Current plan" value={planLabel(user.plan)} />
          <Row
            label="Billing cycle"
            value={user.plan === "free" ? "—" : cycleLabels[user.billingCycle].split(" ·")[0]}
          />
          <Row
            label="Renews on"
            value={user.plan === "free" ? "—" : formatDate(user.renewsOn)}
          />

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/#pricing" className={buttonClass({ variant: "ghost", size: "sm" })}>
              Manage Plan
            </Link>
            <form action={signOutAction}>
              <button type="submit" className={buttonClass({ variant: "ghost", size: "sm" })}>
                Sign Out
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-card border border-border bg-white p-6">
          <h2 className="mb-1 text-[17px]">Tokens</h2>
          <Row
            label="Monthly tokens"
            value={`${formatCount(user.tokensSubscription)} of ${formatCount(allowance)} left`}
          />
          <Row label="Purchased tokens" value={formatCount(user.tokensPurchased)} />
          <Row
            label="Total available"
            value={
              <b className="font-medium">
                {formatCount(user.tokensSubscription + user.tokensPurchased)}
              </b>
            }
          />

          <p className="mt-4 text-[13px] text-muted">Purchased tokens never expire.</p>

          <Link href="/tokens" className={buttonClass({ size: "sm", className: "mt-4" })}>
            Buy Tokens
          </Link>
        </section>
      </div>

      <section className="mt-11">
        <h2 className="text-[19px]">Token history</h2>

        <div className="mt-4 overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full min-w-[420px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted">Activity</th>
                <th className="px-5 py-3 font-medium text-muted">Date</th>
                <th className="px-5 py-3 text-right font-medium text-muted">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-3 text-ink">{describe(entry)}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(entry.createdAt)}</td>
                  <td
                    className={
                      "px-5 py-3 text-right font-medium " +
                      (entry.delta > 0 ? "text-accent" : "text-ink")
                    }
                  >
                    {entry.delta > 0 ? "+" : ""}
                    {formatCount(entry.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[12.5px] text-muted">
          Invoices will appear here once a payment provider is connected.
        </p>
      </section>
    </Container>
  );
}
