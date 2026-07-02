import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #FF8A4C 0%, #FF4D6D 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 72,
              height: 56,
              border: "13px solid #0B0B0F",
              borderBottom: "none",
              borderRadius: "40px 40px 0 0",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 94,
              height: 66,
              borderRadius: 16,
              background: "#0B0B0F",
              marginTop: -6,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
