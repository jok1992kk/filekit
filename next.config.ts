import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Auth (sign up, sign in, password reset) calls Supabase directly from the
// browser, so its origin needs to be in connect-src or every request is
// silently blocked by CSP rather than by Supabase.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Next's own hydration payload is an inline <script>, so script-src needs
// 'unsafe-inline' short of a nonce-based setup. Dev additionally needs
// 'unsafe-eval' for the webpack HMR runtime. Fonts are self-hosted by
// next/font at build time, so font-src stays on 'self'.
//
// A per-request nonce (dropping 'unsafe-inline') was tried and reverted —
// Next's documented "automatic nonce" propagation to its own bootstrap
// scripts did not actually apply it in production on this version, so every
// script on the site was blocked. Not safe to retry without reproducing and
// fixing that in a preview deployment first.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // `next dev` binds to 0.0.0.0 so the site can be opened from a phone on the
  // same Wi-Fi. Next treats a request arriving on any other host as a
  // cross-origin dev request, so the private ranges are allowed explicitly.
  allowedDevOrigins: ["192.168.1.16", "192.168.1.*", "10.0.*.*"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
