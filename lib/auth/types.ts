import type { BillingCycle, PlanId } from "@/lib/plans";

/** A fresh account is on `free` until it subscribes — SPEC.md §11. */
export type AccountPlan = "free" | PlanId;

export type User = {
  id: string;
  email: string;
  fullName: string;
  /** `salt:key`, scrypt. Never leaves the server — see `PublicUser`. */
  passwordHash: string;
  plan: AccountPlan;
  billingCycle: BillingCycle;
  tokensSubscription: number;
  tokensPurchased: number;
  renewsOn: string;
  createdAt: string;
};

/** What server components and actions are allowed to hand to the client. */
export type PublicUser = Omit<User, "passwordHash">;

export type Session = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type LedgerReason =
  | "signup_bonus"
  | "tool_run"
  | "pack_purchase"
  | "plan_change";

export type LedgerEntry = {
  id: number;
  userId: string;
  /** Negative for a spend, positive for a top-up. */
  delta: number;
  reason: LedgerReason;
  tool: string | null;
  createdAt: string;
};

export type SpendResult =
  | { ok: true; balance: number }
  | { ok: false; error: "insufficient_tokens"; needed: number };

export type AuthResult =
  | { ok: true; user: PublicUser; token: string }
  | { ok: false; error: string };

/**
 * The seam Supabase drops into later. `lib/auth/local.ts` is the only
 * implementation today; swapping it means changing `lib/auth/index.ts`
 * and nothing else — the same pattern `lib/billing/` uses for Stripe.
 */
export interface AuthProvider {
  signUp(input: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<AuthResult>;
  signIn(input: { email: string; password: string }): Promise<AuthResult>;
  signOut(token: string): Promise<void>;
  getUserBySession(token: string): Promise<PublicUser | null>;
  spendTokens(
    userId: string,
    cost: number,
    reason: LedgerReason,
    tool?: string,
  ): Promise<SpendResult>;
  addTokens(
    userId: string,
    amount: number,
    reason: LedgerReason,
  ): Promise<number>;
  setPlan(
    userId: string,
    plan: AccountPlan,
    cycle: BillingCycle,
    monthlyTokens: number,
  ): Promise<void>;
  ledgerFor(userId: string, limit?: number): Promise<LedgerEntry[]>;
}
