import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Maximize2, CheckCircle2 } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";

export const metadata = {
  title: "Image Dimensions vs File Size: Aspect Ratio Guide | ImageFit",
  description:
    "Learn the difference between pixel dimensions and file size, how aspect ratios work, and how to avoid stretched or distorted images.",
};

export default function DimensionsGuidePage() {
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
          <span>Technical Guide • 4 min read</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          Image Dimensions vs File Size: Pixels, DPI, and Aspect Ratios Explained
        </h1>
        <p className="text-base text-slate leading-relaxed">
          Many people confuse dimensions (width and height in pixels) with file size (kilobytes or megabytes). Understanding how they relate ensures your images look sharp and load quickly.
        </p>
      </header>

      <div className="prose prose-slate max-w-none space-y-6 text-slate leading-relaxed text-base">
        <h2 className="text-xl font-heading font-bold text-ink">1. Dimensions vs File Size</h2>
        <p>
          <strong>Dimensions</strong> describe the physical pixel grid of the image: e.g. 1920 pixels wide by 1080 pixels high. Total pixels equal 2,073,600 (about 2 megapixels).
        </p>
        <p>
          <strong>File size</strong> is the amount of storage space needed to store those pixels on disk (measured in KB or MB). Compression determines how many bytes are required to represent that pixel grid.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">2. Understanding Aspect Ratio</h2>
        <p>
          The aspect ratio is the proportional relationship between width and height. For example:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>16:9</strong> — Standard widescreen monitor, YouTube thumbnails, video displays.</li>
          <li><strong>4:3</strong> — Classic monitors and many tablet displays.</li>
          <li><strong>1:1</strong> — Square formats commonly used for profile avatars and social feeds.</li>
          <li><strong>3:2</strong> — Standard 35mm DSLR sensor ratio.</li>
        </ul>
        <p>
          When resizing an image, locking the aspect ratio ensures that changing the width automatically adjusts the height proportionally, avoiding squished or stretched distortions.
        </p>

        <div className="relative rounded-2xl bg-white border border-border p-6 shadow-card space-y-4 my-8">
          <CropCorners size={12} color="text-cobalt" />
          <h3 className="font-heading font-bold text-ink text-base flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-cobalt" />
            <span>Need to adjust dimensions with locked ratio?</span>
          </h3>
          <p className="text-sm text-slate">
            Use the ImageFit Resizer to scale your images safely without distortion.
          </p>
          <Link
            href="/tools/image-resizer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cobalt text-white text-sm font-semibold hover:bg-cobalt-hover transition-colors"
          >
            <span>Open Image Resizer</span>
            <CheckCircle2 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
