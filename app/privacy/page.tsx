import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, ServerOff } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";

export const metadata = {
  title: "Privacy Statement | ImageFit",
  description:
    "ImageFit operates 100% in your browser. We never upload your images to remote servers or collect personal file contents.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-cobalt transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <header className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-success px-2.5 py-1 rounded bg-success-light inline-block">
          Privacy by Design
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          Privacy Statement
        </h1>
        <p className="text-sm text-slate">Last updated: October 2026</p>
      </header>

      <div className="space-y-6 text-slate leading-relaxed text-base">
        <div className="rounded-2xl bg-white border border-border p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-success font-bold font-heading">
            <ShieldCheck className="w-5 h-5 text-success" />
            <span>Core Privacy Guarantee</span>
          </div>
          <p className="text-sm text-slate">
            When you select or drop an image into ImageFit, <strong>the image file never leaves your computer or phone</strong>. All reading, dimension scaling, bounded quality compression, and format encoding run locally in your browser memory via native HTML5 Canvas APIs.
          </p>
        </div>

        <h2 className="text-xl font-heading font-bold text-ink">1. Zero File Transmission</h2>
        <p>
          We do not operate backend servers that store, process, or view your photos. You can even disconnect your internet after loading the ImageFit page and the image processing features will continue to operate entirely offline.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">2. Zero Mandatory Registration</h2>
        <p>
          ImageFit requires no user accounts, passwords, email addresses, or payment cards. You arrive, optimize your image, and download your result immediately.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">3. Analytics & Telemetry</h2>
        <p>
          ImageFit contains no third-party analytics libraries, advertising trackers, or external error beacons. We do not transmit your image pixels, file names, or embedded EXIF metadata to any remote server or third-party service.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">4. Object URL Lifecycle & Memory Safety</h2>
        <p>
          When you generate a preview or download link, your browser creates a temporary in-memory reference (`blob:http...`). ImageFit explicitly cleans up and revokes these memory references when you remove an image or close the page.
        </p>
      </div>
    </div>
  );
}
