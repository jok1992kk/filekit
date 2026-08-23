import type { BillingCycle, PlanId } from "@/lib/plans";
import type { PackId } from "@/lib/token-packs";

/**
 * The payment seam (SPEC.md §12). Buy buttons are written against this today
 * and keep working unchanged when Stripe replaces the mock provider.
 *
 * Checkout is expressed as a URL rather than an imperative `Promise<void>`:
 * in an App Router app the buy button is a link, which keeps it working
 * without JavaScript and gives it real hover and open-in-new-tab behaviour.
 */
export interface BillingProvider {
  /** False while no real payment processor is wired up. */
  readonly connected: boolean;
  planCheckoutUrl(planId: PlanId, cycle: BillingCycle): string;
  packCheckoutUrl(packId: PackId): string;
  /** Where "Manage plan" points. */
  readonly portalUrl: string;
}
