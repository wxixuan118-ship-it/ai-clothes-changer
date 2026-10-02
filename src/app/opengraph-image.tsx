import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — try on any outfit in seconds`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIME = "#C6F648";
const ARCHES = ["#8CC5C9", "#E6879A", "#1F5F4F", "#F2B134", "#F0C9A8"];

// Branded share card: wordmark + tagline + the arch motif from the hero.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0B0A09",
        color: "#F7F6F2",
        padding: "64px 72px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            background: LIME,
            display: "flex",
          }}
        />
        <div style={{ fontSize: 30, letterSpacing: -0.5 }}>
          {siteConfig.name}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>
          Try on any outfit in seconds
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Garment photo", "Text prompt", "Curated styles"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                border: `2px solid ${LIME}`,
                color: LIME,
                borderRadius: 999,
                padding: "8px 22px",
                fontSize: 26,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
        {ARCHES.map((color, i) => (
          <div
            key={color}
            style={{
              width: 196,
              height: [150, 190, 130, 170, 140][i],
              background: color,
              borderTopLeftRadius: 98,
              borderTopRightRadius: 98,
              display: "flex",
            }}
          />
        ))}
      </div>
    </div>,
    size,
  );
}
