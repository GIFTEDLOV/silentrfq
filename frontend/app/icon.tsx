import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          borderRadius: 7,
          background: "linear-gradient(135deg, #FF8A4C 0%, #FF4D6D 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 13,
              height: 10,
              border: "2.4px solid #0B0B0F",
              borderBottom: "none",
              borderRadius: "7px 7px 0 0",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 17,
              height: 12,
              borderRadius: 3,
              background: "#0B0B0F",
              marginTop: -1,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
