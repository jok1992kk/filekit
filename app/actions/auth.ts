"use server";

import { redirect } from "next/navigation";

import {
  auth,
  clearSessionCookie,
  getCurrentUser,
  setSessionCookie,
} from "@/lib/auth";
import { brand } from "@/lib/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAuthClient } from "@/lib/supabase/auth-client";

/**
 * React resets a form once its action resolves, so a rejected submission
 * comes back with every field blank. Echoing the harmless fields back lets
 * the form repopulate them — nobody should retype their email because they
 * fat-fingered their password. The password itself is never echoed.
 */
export type AuthFormState = {
  error?: string;
  email?: string;
  fullName?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** Where to land after signing in. Only same-site paths are accepted, so a
 * crafted `?next=//evil.example` cannot turn the form into an open redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const entered = { email, fullName };

  if (fullName.length < 2) return { ...entered, error: "Please enter your name." };
  if (!EMAIL_PATTERN.test(email)) {
    return { ...entered, error: "Please enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD) {
    return { ...entered, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const result = await auth.signUp({ email, password, fullName });
  if (!result.ok) return { ...entered, error: result.error };

  await setSessionCookie(result.token);
  redirect(next);
}

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { email, error: "Enter your email and password." };

  const result = await auth.signIn({ email, password });
  if (!result.ok) return { email, error: result.error };

  await setSessionCookie(result.token);
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const token = await clearSessionCookie();
  if (token) await auth.signOut(token);
  redirect("/");
}

export type ForgotPasswordState = { sent?: boolean; error?: string };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const client = createAuthClient();
  await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${brand.url}/auth/callback?type=recovery`,
  });

  // Same response whether or not the email is registered — see signInAction.
  return { sent: true };
}

export type ResetPasswordState = { error?: string };

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  // Reaching this page at all only happens via a same-request redirect from
  // /auth/callback?type=recovery, which already set a fresh session cookie —
  // so the signed-in user here is exactly the one who clicked the email link.
  const user = await getCurrentUser();
  if (!user) return { error: "This reset link has expired. Request a new one." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, { password });
  if (error) return { error: "Could not update your password. Try again." };

  redirect("/dashboard");
}
