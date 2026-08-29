import type { NextConfig } from "next";

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
          // Content-Security-Policy is set per-request in middleware.ts
          // instead — it needs a fresh nonce every time.
        ],
      },
    ];
  },
};

export default nextConfig;
