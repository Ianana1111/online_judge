import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at request time (cached by Vercel's OG image handling) rather than a static asset —
// there's no /public directory in this app, and this keeps the brand mark/colors defined in one
// place instead of exporting a PNG by hand.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d12",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 20% 20%, rgba(232,163,61,0.16) 0%, transparent 55%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="120" height="120" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#12161d" />
            <path
              d="M20 20 L32 32 L20 44"
              fill="none"
              stroke="#e8a33d"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="36" y1="44" x2="48" y2="44" stroke="#f0b660" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: "#f5f2ea" }}>judge.</div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#9ba3af" }}>
          CPE / UVa 練習與虛擬模擬考平台
        </div>
      </div>
    ),
    { ...size },
  );
}
