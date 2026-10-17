import React from "react";

interface CropCornersProps {
  color?: string;
  size?: number;
  className?: string;
}

export function CropCorners({ color = "text-cobalt/40", size = 12, className = "" }: CropCornersProps) {
  const style = { width: size, height: size };
  return (
    <div className={`pointer-events-none select-none absolute inset-0 ${className}`} aria-hidden="true">
      {/* Top-Left */}
      <span
        style={style}
        className={`absolute top-2 left-2 border-t-2 border-l-2 rounded-tl-sm ${color}`}
      />
      {/* Top-Right */}
      <span
        style={style}
        className={`absolute top-2 right-2 border-t-2 border-r-2 rounded-tr-sm ${color}`}
      />
      {/* Bottom-Left */}
      <span
        style={style}
        className={`absolute bottom-2 left-2 border-b-2 border-l-2 rounded-bl-sm ${color}`}
      />
      {/* Bottom-Right */}
      <span
        style={style}
        className={`absolute bottom-2 right-2 border-b-2 border-r-2 rounded-br-sm ${color}`}
      />
    </div>
  );
}
