import { createAdminClient } from "@/lib/supabase/admin";
import { createAuthClient } from "@/lib/supabase/auth-client";
import type {
  AccountPlan,
  AuthProvider,
  AuthResult,
  LedgerEntry,
  PublicUser,
  SpendResult,
} from "@/lib/auth/types";
import type { BillingCycle } from "@/lib/plans";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  plan: AccountPlan;
  billing_cycle: BillingCycle;
  tokens_subscription: number;
  tokens_purchased: number;
  renews_on: string;
  created_at: string;
};

function toPublic(row: ProfileRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    plan: row.plan,
    billingCycle: row.billing_cycle,
    tokensSubscription: row.tokens_subscription,
    tokensPurchased: row.tokens_purchased,
    renewsOn: row.renews_on,
    createdAt: row.created_at,
  };
}

/** The trigger in supabase/schema.sql inserts this row in the same
 * transaction as the auth.users insert, so it already exists by the time
 * signUp()'s HTTP response reaches this server. */
async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

function addMonths(from: Date, months: number): string {
  const date = new Date(from);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

export const supabaseAuth: AuthProvider = {
  async signUp({ email, password, fullName }): Promise<AuthResult> {
    const client = createAuthClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (error) return { ok: false, error: error.message };
    if (!data.session || !data.user) {
      // "Confirm email" is on for this project — see README for how to turn
      // it off until Resend SMTP is wired up in the Supabase dashboard.
      return {
        ok: false,
        error: "Check your inbox to confirm your account, then sign in.",
      };
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      return { ok: false, error: "Account created, but the profile is missing. Try signing in." };
    }

    return { ok: true, user: toPublic(profile), token: data.session.access_token };
  },

  async signIn({ email, password }): Promise<AuthResult> {
    const client = createAuthClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    // Same message either way — never reveal whether the email is registered.
    const rejection = { ok: false, error: "Email or password is incorrect." } as const;
    if (error || !data.session || !data.user) return rejection;

    const profile = await fetchProfile(data.user.id);
    if (!profile) return rejection;

    return { ok: true, user: toPublic(profile), token: data.session.access_token };
  },

  async signOut(token: string): Promise<void> {
    const admin = createAdminClient();
    try {
      await admin.auth.admin.signOut(token, "global");
    } catch {
      // The waresnap_session cookie is cleared by the caller regardless —
      // this best-effort call just revokes the token a little earlier.
    }
  },

  async getUserBySession(token: string): Promise<PublicUser | null> {
    const client = createAuthClient();
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;

    const profile = await fetchProfile(data.user.id);
    return profile ? toPublic(profile) : null;
  },

  /** Subscription tokens first, then purchased — SPEC.md §4, enforced
   * atomically by the spend_tokens() function in supabase/schema.sql. */
  async spendTokens(userId, cost, reason, tool): Promise<SpendResult> {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("spend_tokens", {
      p_user_id: userId,
      p_cost: cost,
      p_reason: reason,
      p_tool: tool ?? null,
    });

    if (error) {
      console.error("spend_tokens RPC failed:", error.message);
      return { ok: false, error: "insufficient_tokens", needed: cost };
    }
    if (!data.ok) return { ok: false, error: "insufficient_tokens", needed: data.needed };
    return { ok: true, balance: data.balance };
  },

  async addTokens(userId, amount, reason): Promise<number> {
    const admin = createAdminClient();
    const profile = await fetchProfile(userId);
    if (!profile) return 0;

    // Bought tokens land in the bucket that never expires.
    const tokensPurchased = profile.tokens_purchased + amount;
    await admin.from("profiles").update({ tokens_purchased: tokensPurchased }).eq("id", userId);
    await admin.from("token_ledger").insert({ user_id: userId, delta: amount, reason, tool: null });

    return profile.tokens_subscription + tokensPurchased;
  },

  async setPlan(userId, plan, cycle, monthlyTokens): Promise<void> {
    const admin = createAdminClient();
    const renewsOn = addMonths(new Date(), cycle === "yearly" ? 12 : 1);

    await admin
      .from("profiles")
      .update({
        plan,
        billing_cycle: cycle,
        tokens_subscription: monthlyTokens,
        renews_on: renewsOn,
      })
      .eq("id", userId);

    await admin.from("token_ledger").insert({
      user_id: userId,
      delta: monthlyTokens,
      reason: "plan_change",
      tool: null,
    });
  },

  async ledgerFor(userId, limit = 20): Promise<LedgerEntry[]> {
    const admin = createAdminClient();
    const { data } = await admin
      .from("token_ledger")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(limit);

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      delta: row.delta,
      reason: row.reason,
      tool: row.tool,
      createdAt: row.created_at,
    }));
  },
};
