import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Tab favicon — a simplified version of the Wordmark mark (see
 * components/site/Wordmark.tsx), simplified because the overlapping frames
 * read as noise at 32px; the monogram plus the accent square carries the
 * same "frame → ready listing" idea legibly at tab size. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          borderRadius: 7,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 3,
            bottom: 3,
            width: 11,
            height: 11,
            borderRadius: 3,
            background: "#15803D",
          }}
        />
        <span
          style={{
            position: "relative",
            fontSize: 19,
            fontWeight: 700,
            color: "#FFFFFF",
            fontFamily: "sans-serif",
          }}
        >
          W
        </span>
      </div>
    ),
    { ...size },
  );
}
