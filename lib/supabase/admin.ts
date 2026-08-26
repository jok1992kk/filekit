import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client: bypasses RLS. Server-only — every call site in
 * lib/auth/supabase.ts runs after the app has already checked the caller's
 * own session cookie, so this is the app's one trusted door into the data,
 * the same role local.ts's file store played before the migration.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
