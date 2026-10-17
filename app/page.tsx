import React from "react";
import Link from "next/link";
import {
  FileCheck,
  Maximize2,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Layers,
  GraduationCap,
  Palette,
  Globe,
  FileText,
  BookOpen,
} from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { CropCorners } from "@/components/brand/CropCorners";

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* 1. Hero & Primary Upload Entry Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt/10 text-cobalt text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cobalt animate-pulse" />
            <span>Precision Client-Side Image Optimization</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-ink tracking-tight leading-[1.1]">
            Every image. <br className="hidden sm:inline" />
            <span className="text-cobalt">The right fit.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate max-w-2xl mx-auto leading-relaxed">
            Compress images to a file-size limit, resize dimensions, and convert supported formats—with{" "}
            <strong className="text-ink font-semibold">real output verification</strong> before you download.
          </p>
        </div>

        {/* Primary Interactive Upload Entry Box */}
        <UploadDropzone />
      </section>

      {/* 2. Quick Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Purpose-Built Precision Tools
          </h2>
          <p className="text-sm text-slate">
            Select a specialized tool to meet your exact image requirement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Compressor */}
          <div className="relative rounded-2xl bg-white border border-border p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
            <CropCorners size={12} color="text-cobalt/30 group-hover:text-cobalt" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
                <FileCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-cobalt transition-colors">
                    Image Compressor
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-lime text-ink">
                    Target Limit
                  </span>
                </div>
                <p className="text-sm text-slate leading-relaxed">
                  Hit strict size constraints like 50 KB, 100 KB, or 200 KB. Our bounded search tests real candidate Blobs for verified results.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-slate">Presets + Custom Target</span>
              <Link
                href="/tools/image-compressor"
                className="inline-flex items-center gap-1 text-sm font-bold text-cobalt group-hover:underline"
              >
                <span>Compress</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 2: Resizer */}
          <div className="relative rounded-2xl bg-white border border-border p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
            <CropCorners size={12} color="text-cobalt/30 group-hover:text-cobalt" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
                <Maximize2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-cobalt transition-colors">
                    Image Resizer
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cloud text-slate">
                    Dimensions
                  </span>
                </div>
                <p className="text-sm text-slate leading-relaxed">
                  Adjust pixel width and height with aspect-ratio locking. Preserves clarity with contain, fit, or intentional cropping options.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-slate">Ratio Lock & Scale</span>
              <Link
                href="/tools/image-resizer"
                className="inline-flex items-center gap-1 text-sm font-bold text-cobalt group-hover:underline"
              >
                <span>Resize</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 3: Converter */}
          <div className="relative rounded-2xl bg-white border border-border p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
            <CropCorners size={12} color="text-cobalt/30 group-hover:text-cobalt" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
                <RefreshCw className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-bold text-ink group-hover:text-cobalt transition-colors">
                    Image Converter
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cloud text-slate">
                    Formats
                  </span>
                </div>
                <p className="text-sm text-slate leading-relaxed">
                  Convert between JPEG, PNG, and WebP with actual output MIME verification and transparent alpha handling warnings.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-slate">JPEG • PNG • WebP</span>
              <Link
                href="/tools/image-converter"
                className="inline-flex items-center gap-1 text-sm font-bold text-cobalt group-hover:underline"
              >
                <span>Convert</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="bg-white border-y border-border py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cloud text-xs font-semibold text-slate">
              <Sparkles className="w-3.5 h-3.5 text-cobalt" />
              <span>Simple, Honest Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
              How ImageFit Delivers The Right Fit
            </h2>
            <p className="text-sm text-slate">
              No complex software to install, no accounts to register. Four steps to guaranteed compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-cobalt text-white flex items-center justify-center font-heading font-extrabold text-base shadow-sm">
                1
              </div>
              <h3 className="font-heading font-bold text-ink text-base">Select or Drop Image</h3>
              <p className="text-sm text-slate leading-relaxed">
                Choose any JPEG, PNG, or WebP image up to 50 MB. Loaded instantly into your browser memory.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center font-heading font-extrabold text-base shadow-sm">
                2
              </div>
              <h3 className="font-heading font-bold text-ink text-base">Define Requirements</h3>
              <p className="text-sm text-slate leading-relaxed">
                Pick a target file size limit (e.g. 100 KB), set pixel dimensions, or choose a new format.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center font-heading font-extrabold text-base shadow-sm">
                3
              </div>
              <h3 className="font-heading font-bold text-ink text-base">Verified In-Browser Encoding</h3>
              <p className="text-sm text-slate leading-relaxed">
                Our engine iteratively encodes and measures actual byte output. Never guesses or assumes success.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-lime text-ink flex items-center justify-center font-heading font-extrabold text-base shadow-sm">
                4
              </div>
              <h3 className="font-heading font-bold text-ink text-base">Inspect & Download</h3>
              <p className="text-sm text-slate leading-relaxed">
                Examine before/after preview, verify the exact byte size, and save the compliant file immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trust & Differentiators Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-ink text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle Crop Corner Accents on dark surface */}
          <CropCorners size={20} color="text-white/20" />

          <div className="max-w-3xl space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-lime px-2.5 py-1 rounded bg-lime/10 inline-block">
              Why ImageFit is Different
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-bold tracking-tight">
              Precision engineering over marketing claims.
            </h2>
            <p className="text-slate-light text-sm sm:text-base leading-relaxed">
              Most image sites run generic compression sliders and claim &ldquo;lossless compression for all files.&rdquo; ImageFit is built on honesty, precision, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-lime flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Actual Byte Verification</h3>
              <p className="text-slate-light text-sm leading-relaxed">
                &ldquo;Smaller than original&rdquo; is not the same as &ldquo;meets target.&rdquo; A green Target Met status is awarded strictly when actual Blob bytes are within your requirement.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-lime flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Local Browser Privacy</h3>
              <p className="text-slate-light text-sm leading-relaxed">
                Files are processed locally via Web Canvas APIs. Image bytes are never uploaded to a server, saved in a database, or analyzed for telemetry.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-lime flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Zero Sign-up Friction</h3>
              <p className="text-slate-light text-sm leading-relaxed">
                No credit cards, no subscriptions, no forced account creation. Arrive, optimize your file, and get back to your work in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Common Use Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Tailored For Real-World Requirements
          </h2>
          <p className="text-sm text-slate">
            Every platform has different size limits and dimension standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-ink text-base">Students & Applicants</h3>
            <p className="text-xs text-slate leading-relaxed">
              Exam portals, scholarship forms, and passport applications requiring photos under 50 KB or 100 KB.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-ink text-base">Designers & Creators</h3>
            <p className="text-xs text-slate leading-relaxed">
              Exporting clean WebP assets, portfolio mockups, and social media headers with consistent pixel dimensions.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-ink text-base">Website Owners</h3>
            <p className="text-xs text-slate leading-relaxed">
              Boosting Google Core Web Vitals and PageSpeed scores by reducing image weight without compromising layout.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-ink text-base">Documents & Resumes</h3>
            <p className="text-xs text-slate leading-relaxed">
              Attaching profile photos and scanned document images to email applications without hitting attachment caps.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Guides & Educational Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cobalt mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Base</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
              Image Optimization Guides
            </h2>
          </div>
          <Link
            href="/guides"
            className="text-xs font-bold text-cobalt hover:underline flex items-center gap-1"
          >
            <span>View All Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/guides/reduce-image-size"
            className="group rounded-2xl bg-white border border-border p-6 shadow-card hover:shadow-elevated transition-all space-y-3 block"
          >
            <div className="flex items-center justify-between text-xs text-slate">
              <span className="font-semibold text-cobalt bg-cobalt/10 px-2 py-0.5 rounded">
                Compression
              </span>
              <span>5 min read</span>
            </div>
            <h3 className="text-lg font-heading font-bold text-ink group-hover:text-cobalt transition-colors">
              How to Reduce Image File Size Without Noticeable Quality Loss
            </h3>
            <p className="text-sm text-slate leading-relaxed">
              Understand the difference between lossy and lossless compression, quality thresholds, and when dimension scaling is necessary.
            </p>
          </Link>

          <Link
            href="/guides/image-dimensions-and-aspect-ratio"
            className="group rounded-2xl bg-white border border-border p-6 shadow-card hover:shadow-elevated transition-all space-y-3 block"
          >
            <div className="flex items-center justify-between text-xs text-slate">
              <span className="font-semibold text-cobalt bg-cobalt/10 px-2 py-0.5 rounded">
                Dimensions
              </span>
              <span>4 min read</span>
            </div>
            <h3 className="text-lg font-heading font-bold text-ink group-hover:text-cobalt transition-colors">
              Image Dimensions vs File Size: Pixels, DPI, and Aspect Ratios Explained
            </h3>
            <p className="text-sm text-slate leading-relaxed">
              Why a 4000×3000px image takes megabytes, how aspect ratios prevent distortion, and choosing the right dimensions for the web.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
