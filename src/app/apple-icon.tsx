import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon: the lime sparkle badge on the night canvas.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0A09",
      }}
    >
      <svg width="132" height="132" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="20" fill="#C6F648" />
        <path
          transform="translate(8 8) scale(0.6)"
          d="M20 2 L23 15 L36 9 L27 20 L38 25 L24 25 L20 38 L16 25 L2 25 L13 20 L4 9 L17 15 Z"
          fill="none"
          stroke="#121110"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  );
}
