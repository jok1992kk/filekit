import { mockBilling } from "@/lib/billing/mock";
import type { BillingProvider } from "@/lib/billing/types";

/** Swap this one line for `stripeBilling` when the processor is connected. */
export const billing: BillingProvider = mockBilling;

export type { BillingProvider };
