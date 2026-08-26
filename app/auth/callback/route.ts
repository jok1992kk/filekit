import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { setSessionCookie } from "@/lib/auth";
import { createAuthClient } from "@/lib/supabase/auth-client";

/**
 * Where Supabase's "Confirm signup" and "Reset password" email templates
 * point (see README's Resend setup notes) — both are customised to link
 * here with `token_hash`/`type` rather than Supabase's own hosted /verify
 * redirect, so the resulting session lands in our own cookie the same way
 * signUp()/signIn() do.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/signin?error=invalid_link`);
  }

  const client = createAuthClient();
  const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/signin?error=expired_link`);
  }

  await setSessionCookie(data.session.access_token);

  // A confirmed signup lands in the dashboard; a recovery link still needs a
  // new password before the account is usable again.
  const destination = type === "recovery" ? "/reset-password" : "/dashboard";
  return NextResponse.redirect(`${origin}${destination}`);
}
