import { createClient } from "@supabase/supabase-js";

/**
 * Publishable-key client used only for the auth calls that must run as the
 * end user (sign up, sign in, validating a session token) — one per call,
 * stateless, since the app keeps its own session in the waresnap_session
 * cookie rather than relying on supabase-js's client-side session storage.
 */
export function createAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
