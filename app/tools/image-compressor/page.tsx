import React from "react";
import Link from "next/link";
import { FileCheck, ArrowLeft, ShieldCheck, CheckCircle2, HelpCircle } from "lucide-react";
import { ImageCompressor } from "@/components/compressor/ImageCompressor";
import { CropCorners } from "@/components/brand/CropCorners";

export const metadata = {
  title: "Image Compressor — Compress to Target File Size (50KB, 100KB, 200KB) | ImageFit",
  description:
    "Compress JPEG, PNG, and WebP images to a strict maximum file size limit with real-time verified candidate measurement in your browser.",
};

export default function CompressorPage() {
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
          <FileCheck className="w-3.5 h-3.5" />
          <span>Verified Target-Size Compression</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          Compress Image to Target File Size
        </h1>
        <p className="text-base text-slate leading-relaxed max-w-2xl">
          Hit strict upload limits like 50 KB, 100 KB, or 200 KB. Our engine performs bounded search over candidate encodings and measures the real output Blob size directly in your browser.
        </p>
      </div>

      {/* Main Interactive Compressor Engine */}
      <ImageCompressor />

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
              How does target-size compression work?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              Instead of guessing a single compression slider, ImageFit uses a bounded binary search (up to 8 iterations). It encodes actual candidate images in browser memory and measures their exact byte size to find the highest visual quality that stays under your target.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              What if the file cannot reach the target?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              If an image is very large (e.g. 12 megapixels) and your target is tiny (e.g. 50 KB), quality reduction alone may not suffice. ImageFit gives you honest feedback and lets you scale pixel dimensions (75% or 50%) to reach the target cleanly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              How are transparent PNGs handled?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              PNG is a lossless format and does not support lossy quality sliders in standard browser canvas. To reach strict byte limits with transparency, we recommend converting to WebP, which supports transparency with full lossy compression.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              Do my photos leave my computer?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              No. All operations use the browser Canvas API locally on your device. Zero bytes are uploaded to remote servers or stored in any database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
