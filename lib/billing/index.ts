import { mockBilling } from "@/lib/billing/mock";
import type { BillingProvider } from "@/lib/billing/types";

/** Swap this one line for `stripeBilling` when the processor is connected. */
export const billing: BillingProvider = mockBilling;

/** The simulate-payment button is hidden in production unless explicitly on. */
export const demoCheckoutEnabled =
  process.env.NEXT_PUBLIC_DEMO_CHECKOUT === "true" ||
  process.env.NODE_ENV !== "production";

export type { BillingProvider };
