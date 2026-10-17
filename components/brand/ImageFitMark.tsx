import React from "react";

interface ImageFitMarkProps {
  className?: string;
  size?: number;
}

export function ImageFitMark({ className = "w-8 h-8", size }: ImageFitMarkProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      {/* Precision Crop Corners */}
      {/* Top Left */}
      <path d="M 4 11 V 6 C 4 4.895 4.895 4 6 4 H 11" stroke="#4463F5" strokeWidth="2.5" strokeLinecap="round" />
      {/* Top Right */}
      <path d="M 25 4 H 30 C 31.105 4 32 4.895 32 6 V 11" stroke="#4463F5" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom Left */}
      <path d="M 4 25 V 30 C 4 31.105 4.895 32 6 32 H 11" stroke="#4463F5" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom Right */}
      <path d="M 25 32 H 30 C 31.105 32 32 31.105 32 30 V 25" stroke="#4463F5" strokeWidth="2.5" strokeLinecap="round" />

      {/* Internal Fitted Frame (The "Fit" Image Canvas) */}
      <rect x="9.5" y="9.5" width="17" height="17" rx="3.5" fill="#15233B" />

      {/* Mountain/Geometry representation of image + Fit indicator dot */}
      <path
        d="M 12 22 L 15.5 17.5 L 18 20.5 L 21 16.5 L 24 22 H 12 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      {/* Fit Lime Precision Accent Accent Dot */}
      <circle cx="21.5" cy="13.5" r="2" fill="#C9F36A" />
    </svg>
  );
}
