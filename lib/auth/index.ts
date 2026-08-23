import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/auth/cookie";
import { localAuth } from "@/lib/auth/local";
import type { AuthProvider, PublicUser } from "@/lib/auth/types";

/**
 * The active auth provider. Today it is the local, file-backed one; when a
 * Supabase project exists this becomes `supabaseAuth` and nothing else in the
 * app changes — every page and action talks to the `AuthProvider` interface.
 */
export const auth: AuthProvider = localAuth;

export { SESSION_COOKIE };

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/** Reads the session cookie and resolves it to a user. `null` when signed out. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return auth.getUserBySession(token);
}

/** Server actions and route handlers only — server components cannot set cookies. */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value ?? null;
  store.delete(SESSION_COOKIE);
  return token;
}

/** Total spendable balance, the number shown in the header pill. */
export function tokenBalance(user: Pick<PublicUser, "tokensSubscription" | "tokensPurchased">): number {
  return user.tokensSubscription + user.tokensPurchased;
}

export type { PublicUser };
