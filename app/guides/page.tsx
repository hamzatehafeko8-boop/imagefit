import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";

export const metadata = {
  title: "Image Optimization Guides & Tutorials | ImageFit",
  description:
    "Learn practical techniques for reducing image file size, understanding aspect ratios, and preparing images for websites and admissions portals.",
};

export default function GuidesPage() {
  const guides = [
    {
      slug: "reduce-image-size",
      title: "How to Reduce Image File Size Without Noticeable Quality Loss",
      description:
        "Understand the difference between lossy and lossless compression, quality thresholds, and when dimension scaling is necessary.",
      category: "Compression",
      readTime: "5 min read",
    },
    {
      slug: "image-dimensions-and-aspect-ratio",
      title: "Image Dimensions vs File Size: Pixels, DPI, and Aspect Ratios Explained",
      description:
        "Why a 4000×3000px image takes megabytes, how aspect ratios prevent distortion, and choosing the right dimensions for the web.",
      category: "Dimensions",
      readTime: "4 min read",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-cobalt transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Educational Guides</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          Image Optimization Guides
        </h1>
        <p className="text-base text-slate leading-relaxed max-w-2xl">
          Practical, honest guides to help you meet application requirements and optimize images for the web.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group relative rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-card hover:shadow-elevated transition-all space-y-3 block"
          >
            <CropCorners size={12} color="text-cobalt/30 group-hover:text-cobalt" />
            <div className="flex items-center justify-between text-xs text-slate">
              <span className="font-semibold text-cobalt bg-cobalt/10 px-2 py-0.5 rounded">
                {guide.category}
              </span>
              <span>{guide.readTime}</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-ink group-hover:text-cobalt transition-colors">
              {guide.title}
            </h2>
            <p className="text-sm text-slate leading-relaxed">{guide.description}</p>
            <div className="pt-2 flex items-center gap-1 text-sm font-bold text-cobalt">
              <span>Read Guide</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
