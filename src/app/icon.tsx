import { ImageResponse } from "next/og";

export const runtime = "edge";
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
          backgroundColor: "#1A1817",
          color: "#C9A84C",
          fontFamily: "serif",
          fontSize: "20px",
          fontWeight: 300,
          letterSpacing: "0.15em",
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}
