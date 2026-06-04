import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b0f1a 0%, #111827 100%)",
          borderRadius: "12px",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized "A" with dragon wing + arrow inspired by the AniYume logo */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          {/* Main "A" shape with dragon silhouette */}
          <path
            d="M24 4L6 44h8l3-7h14l3 7h8L24 4zm0 12l5 14H19l5-14z"
            fill="url(#grad1)"
          />
          {/* Wing accent */}
          <path
            d="M32 16c2-3 5-5 9-6-2 4-4 7-7 9l-2-3z"
            fill="#14b8a6"
            opacity="0.8"
          />
          {/* Arrow accent */}
          <path
            d="M34 32l8-4-2 6-6-2z"
            fill="#14b8a6"
            opacity="0.6"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
