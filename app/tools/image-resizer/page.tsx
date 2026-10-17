import React from "react";
import Link from "next/link";
import { Maximize2, ArrowLeft, HelpCircle } from "lucide-react";
import { ImageResizer } from "@/components/resizer/ImageResizer";

export const metadata = {
  title: "Image Resizer — Dimensions, Aspect Ratio & Fit/Crop | ImageFit",
  description:
    "Resize image pixel width and height with aspect ratio locking, contain/cover crop modes, and visual previews. 100% in-browser Canvas processing.",
};

export default function ResizerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb / Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-cobalt transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Tool Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-semibold">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Professional Dimension Resizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          Resize Image Dimensions
        </h1>
        <p className="text-base text-slate leading-relaxed max-w-2xl">
          Scale pixel dimensions accurately with proportional aspect-ratio locking, contain fit, or cover crop modes. Real-time in-browser Canvas processing with high-quality smoothing.
        </p>
      </div>

      {/* Main Interactive Resizer Workspace */}
      <ImageResizer />

      {/* Helpful Instructions & FAQ */}
      <div className="pt-8 border-t border-border space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cobalt" />
          <h2 className="text-xl font-heading font-bold text-ink">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              What is the difference between Fit (Contain) and Crop (Cover)?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              <strong>Fit (Contain)</strong> preserves the entire original image without cropping, fitting it inside your requested bounding box while maintaining the original proportions. <strong>Crop (Cover)</strong> fills the exact requested dimensions by scaling proportionally and trimming excess edges.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              Why is aspect ratio lock enabled by default?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              Aspect ratio locking prevents accidental visual distortion (squishing or stretching). When locked, editing either width or height automatically calculates the other dimension proportionally. You can unlock it anytime if you intentionally want custom unconstrained dimensions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              What happens if I upscale an image?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              Upscaling increases pixel dimensions beyond the original resolution. ImageFit uses high-quality bicubic canvas interpolation, but upscaling cannot invent detail that was never in the original file. A notice will appear displaying the upscale factor.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              How is transparency handled when resizing?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              If your original PNG or WebP image contains transparency, choosing PNG or WebP preserves the alpha channel. If you choose JPEG, transparency cannot be saved and will be flattened against a clean white background.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
