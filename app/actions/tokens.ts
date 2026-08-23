"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth, getCurrentUser } from "@/lib/auth";
import type { SpendResult } from "@/lib/auth/types";
import { monthlyAllowanceFor, type BillingCycle, type PlanId, plans } from "@/lib/plans";
import { getTool } from "@/lib/tools";
import { tokenPacks, type PackId } from "@/lib/token-packs";

export type RunToolResult =
  | { ok: true; balance: number; cost: number }
  | { ok: false; error: "signed_out" }
  | { ok: false; error: "unknown_tool" }
  | { ok: false; error: "insufficient_tokens"; needed: number };

/**
 * Charges for one run of a tool. The cost is looked up from `lib/tools.ts`
 * here rather than accepted from the caller — a server action is a public
 * endpoint, so a client-supplied price would be a client-supplied discount.
 */
export async function runToolAction(
  toolSlug: string,
  imageCount = 1,
): Promise<RunToolResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "signed_out" };

  const tool = getTool(toolSlug);
  if (!tool) return { ok: false, error: "unknown_tool" };

  const batches = Math.ceil(Math.max(1, imageCount) / tool.cost.perImages);
  const cost = tool.cost.tokens * batches;

  const result: SpendResult = await auth.spendTokens(
    user.id,
    cost,
    "tool_run",
    tool.slug,
  );

  if (!result.ok) {
    return { ok: false, error: "insufficient_tokens", needed: result.needed };
  }

  revalidatePath("/", "layout");
  return { ok: true, balance: result.balance, cost };
}

/** Mock checkout completion for a token pack (SPEC.md §12). */
export async function purchasePackAction(packId: PackId): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const pack = tokenPacks.find((candidate) => candidate.id === packId);
  if (!pack) return;

  await auth.addTokens(user.id, pack.tokens, "pack_purchase");
  revalidatePath("/", "layout");
}

/** Mock checkout completion for a subscription (SPEC.md §12). */
export async function subscribePlanAction(
  planId: PlanId,
  cycle: BillingCycle,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  if (!plans.some((plan) => plan.id === planId)) return;

  await auth.setPlan(user.id, planId, cycle, monthlyAllowanceFor(planId));
  revalidatePath("/", "layout");
}

/**
 * Stands in for the payment processor's success webhook (SPEC.md §12).
 * Takes its arguments from the form rather than from a closure: an inline
 * server action would have to capture the parsed pack/plan objects, and Next
 * cannot encode a closure over a value that is `undefined` on one branch.
 */
export async function completeCheckoutAction(formData: FormData): Promise<void> {
  const type = String(formData.get("type") ?? "");
  const id = String(formData.get("id") ?? "");
  const cycle: BillingCycle = formData.get("cycle") === "yearly" ? "yearly" : "monthly";

  // Both callees re-validate the id against the catalogue before charging.
  if (type === "pack") await purchasePackAction(id as PackId);
  else if (type === "plan") await subscribePlanAction(id as PlanId, cycle);

  redirect("/account");
}
