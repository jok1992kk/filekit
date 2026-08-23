import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/cookie";

/**
 * An optimistic guard: it only checks that a session cookie is present, which
 * is all the Edge runtime can do without the auth store. Whether the token is
 * still valid is settled in `app/(app)/layout.tsx`, which runs on Node and
 * re-checks it against the store before rendering anything private.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/signin";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/tokens/:path*", "/checkout/:path*"],
};
