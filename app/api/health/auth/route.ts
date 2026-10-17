export const dynamic = "force-dynamic";

// Operational readiness only. Never return environment values, provider
// response bodies, credentials, account data or raw exception messages.
function result(ok: boolean, code: string, upstreamStatus?: number): Response {
  return Response.json(
    { ok, code, ...(upstreamStatus ? { upstreamStatus } : {}) },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(): Promise<Response> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) return result(false, "AUTH_URL_MISSING");
  if (!key) return result(false, "AUTH_KEY_MISSING");

  let origin: URL;
  try {
    origin = new URL(url);
    if (!['https:', 'http:'].includes(origin.protocol)) {
      return result(false, "AUTH_URL_INVALID");
    }
  } catch {
    return result(false, "AUTH_URL_INVALID");
  }

  try {
    // Settings is a public, read-only Auth endpoint. It creates no sessions
    // or users, sends no mail and needs only the publishable key.
    const response = await fetch(new URL("/auth/v1/settings", origin), {
      headers: { apikey: key },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(7000),
    });
    // Discard the provider's body so no upstream details leak into this API.
    await response.body?.cancel();
    if (response.status === 401 || response.status === 403) {
      return result(false, "AUTH_KEY_REJECTED", response.status);
    }
    if (!response.ok) {
      return result(false, "AUTH_UPSTREAM_ERROR", response.status);
    }
    return result(true, "AUTH_READY");
  } catch (error) {
    const failure = error as { name?: string; cause?: { code?: string } };
    const codes: Record<string, string> = {
      ENOTFOUND: "AUTH_DNS_FAILED",
      EAI_AGAIN: "AUTH_DNS_FAILED",
      ECONNREFUSED: "AUTH_CONNECTION_REFUSED",
      ETIMEDOUT: "AUTH_CONNECTION_TIMEOUT",
      UND_ERR_CONNECT_TIMEOUT: "AUTH_CONNECTION_TIMEOUT",
      ERR_INVALID_CHAR: "AUTH_HEADER_INVALID",
    };
    return result(false, failure.name === "TimeoutError"
      ? "AUTH_CONNECTION_TIMEOUT"
      : codes[failure.cause?.code ?? ""] ?? "AUTH_CONNECTION_FAILED");
  }
}
