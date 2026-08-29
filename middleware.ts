import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/cookie";

const isDev = process.env.NODE_ENV !== "production";

// Same origin next.config.ts's old static CSP allowed — auth calls Supabase
// directly from the browser, so its origin has to be in connect-src or every
// request is silently blocked by CSP rather than by Supabase.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const PROTECTED_PREFIXES = ["/dashboard", "/account", "/tokens", "/checkout"];

/**
 * Runs on every request for two unrelated reasons that both need to happen
 * before a response is built, which is why they share one function:
 *
 * 1. CSP nonce — script-src used to need 'unsafe-inline' because Next's own
 *    hydration payload is an inline <script>. A per-request nonce lets us
 *    drop that: Next automatically stamps its own inline scripts with the
 *    nonce it finds in the CSP header on the response, so nothing else in
 *    the app has to change — see
 *    https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 * 2. Session gate — an optimistic check that a session cookie is present,
 *    which is all the Edge runtime can do without the auth store. Whether
 *    the token is still valid is settled in `app/(app)/layout.tsx`, which
 *    runs on Node and re-checks it before rendering anything private.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline style attributes (style={{...}}) can't take a nonce — CSP has
    // no mechanism for that, only for <style> elements — so this one stays.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  if (isProtected && !request.cookies.get(SESSION_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = "";
    url.searchParams.set("next", request.nextUrl.pathname);
    const response = NextResponse.redirect(url);
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Everything except static assets and Next's own internals — the nonce
  // has to land on every document response, not just the protected routes
  // the session gate cares about.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
