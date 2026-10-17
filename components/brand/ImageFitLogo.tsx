import React from "react";
import Link from "next/link";
import { ImageFitMark } from "./ImageFitMark";

interface ImageFitLogoProps {
  className?: string;
  markSize?: number;
  textColor?: string;
}

export function ImageFitLogo({ className = "", markSize = 32, textColor = "text-ink" }: ImageFitLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt rounded-lg p-1 transition-opacity hover:opacity-95 ${className}`}
      aria-label="ImageFit Homepage"
    >
      <ImageFitMark size={markSize} />
      <div className="flex items-baseline tracking-tight">
        <span className={`font-heading font-extrabold text-xl ${textColor}`}>
          Image<span className="text-cobalt">Fit</span>
        </span>
        <span className="sr-only"> — Every image. The right fit.</span>
      </div>
    </Link>
  );
}
