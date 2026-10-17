import React from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import { ImageConverter } from "@/components/converter/ImageConverter";

export const metadata = {
  title: "Image Converter — Convert JPEG, PNG, WebP with MIME Verification | ImageFit",
  description:
    "Convert images between JPEG, PNG, and WebP with actual output MIME verification, transparency flattening controls, and honest file size measurements. 100% in-browser.",
};

export default function ConverterPage() {
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
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Verified Format Conversion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          Convert Image Format
        </h1>
        <p className="text-base text-slate leading-relaxed max-w-2xl">
          Convert between tested web formats (JPEG, PNG, WebP) with verified output MIME types, explicit alpha transparency controls, and honest byte-size measurements.
        </p>
      </div>

      {/* Main Interactive Converter Engine */}
      <ImageConverter />

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
              Why does converting JPEG to PNG make the file size larger?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              JPEG is a lossy format that discards subtle color data to achieve tiny file sizes. PNG is a lossless format (Deflate compression) that stores every single pixel with exact precision. Converting from lossy to lossless cannot restore lost fidelity, but stores all existing pixels losslessly, which typically increases the byte size.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              How does ImageFit verify the actual output format?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              Some browser canvas encoders silently fall back to PNG when a requested format (such as WebP on older browsers) is unsupported. ImageFit explicitly inspects the resulting Blob MIME type and verifies that it strictly matches what you requested before declaring success.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              What happens to transparent pixels when converting to JPEG?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              The JPEG standard has no alpha transparency channel. ImageFit never silently replaces transparency with ugly black backgrounds. Instead, you can choose an explicit background color (default pure white) to cleanly flatten transparent areas before encoding.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="text-sm font-heading font-bold text-ink">
              Are vector formats like SVG or animated GIFs supported?
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              No. SVG is an XML-based vector format and animated GIFs contain multiple time-sequenced frames. ImageFit focuses on high-performance static raster conversions (JPEG, PNG, WebP) with verified pixel-perfect local Canvas rendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
