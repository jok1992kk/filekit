import type { BillingProvider } from "@/lib/billing/types";

/** Routes every purchase to the in-app checkout page, which simulates it. */
export const mockBilling: BillingProvider = {
  connected: false,

  planCheckoutUrl(planId, cycle) {
    return `/checkout?type=plan&id=${planId}&cycle=${cycle}`;
  },

  packCheckoutUrl(packId) {
    return `/checkout?type=pack&id=${packId}`;
  },

  portalUrl: "/account",
};
