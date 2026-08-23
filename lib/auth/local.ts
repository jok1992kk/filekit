import { hashPassword, newId, newToken, verifyPassword } from "@/lib/auth/passwords";
import { mutate, nextLedgerId, read } from "@/lib/auth/store";
import type {
  AuthProvider,
  AuthResult,
  LedgerEntry,
  PublicUser,
  SpendResult,
  User,
} from "@/lib/auth/types";
import { SIGNUP_FREE_TOKENS } from "@/lib/plans";

const SESSION_DAYS = 30;

/** Built field by field, so adding a secret to `User` cannot silently leak it. */
function toPublic(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    plan: user.plan,
    billingCycle: user.billingCycle,
    tokensSubscription: user.tokensSubscription,
    tokensPurchased: user.tokensPurchased,
    renewsOn: user.renewsOn,
    createdAt: user.createdAt,
  };
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function addMonths(from: Date, months: number): string {
  const date = new Date(from);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function createSession(
  db: { sessions: { token: string; userId: string; expiresAt: string }[] },
  userId: string,
): string {
  const token = newToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Drop this user's expired sessions while we are here — the file is small
  // and this is the only place sessions are ever added.
  const now = Date.now();
  db.sessions = db.sessions.filter(
    (session) => new Date(session.expiresAt).getTime() > now,
  );
  db.sessions.push({ token, userId, expiresAt });

  return token;
}

export const localAuth: AuthProvider = {
  async signUp({ email, password, fullName }): Promise<AuthResult> {
    const normalised = normaliseEmail(email);

    return mutate(async (db) => {
      if (db.users.some((user) => user.email === normalised)) {
        return { ok: false, error: "An account with this email already exists." };
      }

      const now = new Date();
      const user: User = {
        id: newId(),
        email: normalised,
        fullName: fullName.trim(),
        passwordHash: await hashPassword(password),
        plan: "free",
        billingCycle: "monthly",
        tokensSubscription: SIGNUP_FREE_TOKENS,
        tokensPurchased: 0,
        renewsOn: addMonths(now, 1),
        createdAt: now.toISOString(),
      };
      db.users.push(user);

      db.ledger.push({
        id: nextLedgerId(db),
        userId: user.id,
        delta: SIGNUP_FREE_TOKENS,
        reason: "signup_bonus",
        tool: null,
        createdAt: now.toISOString(),
      });

      return { ok: true, user: toPublic(user), token: createSession(db, user.id) };
    });
  },

  async signIn({ email, password }): Promise<AuthResult> {
    const normalised = normaliseEmail(email);
    const user = await read((db) =>
      db.users.find((candidate) => candidate.email === normalised),
    );

    // Same message either way — never reveal whether the email is registered.
    const rejection = { ok: false, error: "Email or password is incorrect." } as const;
    if (!user) return rejection;
    if (!(await verifyPassword(password, user.passwordHash))) return rejection;

    const token = await mutate((db) => createSession(db, user.id));
    return { ok: true, user: toPublic(user), token };
  },

  async signOut(token: string): Promise<void> {
    await mutate((db) => {
      db.sessions = db.sessions.filter((session) => session.token !== token);
    });
  },

  async getUserBySession(token: string): Promise<PublicUser | null> {
    return read((db) => {
      const session = db.sessions.find((candidate) => candidate.token === token);
      if (!session) return null;
      if (new Date(session.expiresAt).getTime() <= Date.now()) return null;

      const user = db.users.find((candidate) => candidate.id === session.userId);
      return user ? toPublic(user) : null;
    });
  },

  /** Subscription tokens first, then purchased — SPEC.md §4. */
  async spendTokens(userId, cost, reason, tool): Promise<SpendResult> {
    return mutate((db) => {
      const user = db.users.find((candidate) => candidate.id === userId);
      if (!user) return { ok: false, error: "insufficient_tokens", needed: cost };

      const balance = user.tokensSubscription + user.tokensPurchased;
      if (balance < cost) {
        return { ok: false, error: "insufficient_tokens", needed: cost - balance };
      }

      const fromSubscription = Math.min(user.tokensSubscription, cost);
      user.tokensSubscription -= fromSubscription;
      user.tokensPurchased -= cost - fromSubscription;

      db.ledger.push({
        id: nextLedgerId(db),
        userId,
        delta: -cost,
        reason,
        tool: tool ?? null,
        createdAt: new Date().toISOString(),
      });

      return {
        ok: true,
        balance: user.tokensSubscription + user.tokensPurchased,
      };
    });
  },

  async addTokens(userId, amount, reason): Promise<number> {
    return mutate((db) => {
      const user = db.users.find((candidate) => candidate.id === userId);
      if (!user) return 0;

      // Bought tokens land in the bucket that never expires.
      user.tokensPurchased += amount;

      db.ledger.push({
        id: nextLedgerId(db),
        userId,
        delta: amount,
        reason,
        tool: null,
        createdAt: new Date().toISOString(),
      });

      return user.tokensSubscription + user.tokensPurchased;
    });
  },

  async setPlan(userId, plan, cycle, monthlyTokens): Promise<void> {
    await mutate((db) => {
      const user = db.users.find((candidate) => candidate.id === userId);
      if (!user) return;

      const now = new Date();
      user.plan = plan;
      user.billingCycle = cycle;
      user.tokensSubscription = monthlyTokens;
      user.renewsOn = addMonths(now, cycle === "yearly" ? 12 : 1);

      db.ledger.push({
        id: nextLedgerId(db),
        userId,
        delta: monthlyTokens,
        reason: "plan_change",
        tool: null,
        createdAt: now.toISOString(),
      });
    });
  },

  async ledgerFor(userId, limit = 20): Promise<LedgerEntry[]> {
    return read((db) =>
      db.ledger
        .filter((entry) => entry.userId === userId)
        .sort((a, b) => b.id - a.id)
        .slice(0, limit),
    );
  },
};
