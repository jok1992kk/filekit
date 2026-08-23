/**
 * The session cookie's name, alone in its own module so `middleware.ts` can
 * import it without pulling in `next/headers`, `node:fs` or `node:crypto` —
 * none of which exist on the Edge runtime the middleware runs on.
 */
export const SESSION_COOKIE = "waresnap_session";
