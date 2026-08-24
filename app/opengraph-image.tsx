import { ImageResponse } from "next/og";

import { brand } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default OG/Twitter card for every page that doesn't set its own — the
 * approved palette (see CLAUDE.md), reproduced with the shapes from
 * components/site/Wordmark.tsx rather than a screenshot or stock photo. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", width: 64, height: 64, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "#15803D",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#111111",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#0F0F10",
            }}
          >
            {brand.name}
          </span>
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "#0F0F10",
            maxWidth: 880,
          }}
        >
          Product photos ready for every marketplace.
        </div>

        <div style={{ marginTop: 20, fontSize: 24, color: "#8B8B93", maxWidth: 820 }}>
          {brand.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
