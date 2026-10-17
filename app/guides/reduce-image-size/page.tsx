import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileCheck, CheckCircle2 } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";

export const metadata = {
  title: "How to Reduce Image File Size Without Quality Loss | ImageFit",
  description:
    "A practical guide to compressing images to target sizes (50 KB, 100 KB, 200 KB) while preserving visual clarity.",
};

export default function ReduceImageSizeGuidePage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-cobalt transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Guides</span>
        </Link>
      </div>

      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-cobalt">
          <BookOpen className="w-4 h-4" />
          <span>Practical Guide • 5 min read</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          How to Reduce Image File Size Without Noticeable Quality Loss
        </h1>
        <p className="text-base text-slate leading-relaxed">
          Whether applying for a job, submitting academic admission forms, or optimizing a web page, hitting an exact file-size limit without ruining visual fidelity is a common challenge.
        </p>
      </header>

      <div className="prose prose-slate max-w-none space-y-6 text-slate leading-relaxed text-base">
        <h2 className="text-xl font-heading font-bold text-ink">1. Understand How Image Compression Works</h2>
        <p>
          Digital images store color values for thousands or millions of individual pixels. Uncompressed images contain massive amounts of redundant spatial data.
        </p>
        <p>
          <strong>Lossy compression</strong> (used by JPEG and lossy WebP) selectively discards subtle high-frequency color variations that human eyes struggle to perceive. At reasonable quality levels (70%–85%), file size can be reduced by 60%–80% with virtually zero perceptible degradation.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">2. Why a Single Quality Slider Doesn&apos;t Guarantee a Target Size</h2>
        <p>
          Every image has a unique level of complexity. An image of a clear blue sky compresses dramatically because large areas have identical pixel values. In contrast, an image of foliage or dense text contains high entropy and requires many more bytes to store.
        </p>
        <p>
          This is why setting quality to &ldquo;80%&rdquo; on different photos produces wildly different file sizes. To hit a strict limit such as <strong>100 KB</strong>, an iterative search that measures the actual encoded Blob size is required.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">3. When You Must Scale Dimensions</h2>
        <p>
          If your original photo is 4000×3000 pixels (12 megapixels) and you need it under 50 KB, reducing quality alone will cause ugly compression artifacts or blurriness. In such cases, the mathematically sound strategy is to scale down the pixel dimensions (e.g., to 1200×900 px) before applying compression.
        </p>

        <div className="relative rounded-2xl bg-white border border-border p-6 shadow-card space-y-4 my-8">
          <CropCorners size={12} color="text-cobalt" />
          <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cobalt" />
            <span>Ready to test on your own image?</span>
          </h3>
          <p className="text-sm text-slate">
            Use the ImageFit Compressor to specify an exact target limit like 50 KB, 100 KB, or 200 KB with real-time verification.
          </p>
          <Link
            href="/tools/image-compressor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cobalt text-white text-sm font-semibold hover:bg-cobalt-hover transition-colors"
          >
            <span>Open Image Compressor</span>
            <CheckCircle2 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
