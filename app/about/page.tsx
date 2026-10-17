import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, Target, Users } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "About ImageFit — Precision Image Optimization",
  description:
    "Learn about ImageFit, our mission for honest file-size compression, in-browser privacy, and precision tooling.",
};

export default function AboutPage() {
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
        <span className="text-xs font-bold uppercase tracking-wider text-cobalt px-2.5 py-1 rounded bg-cobalt/10 inline-block">
          Our Philosophy
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          About ImageFit
        </h1>
        <p className="text-base text-slate leading-relaxed">
          {BRAND.slogan} We believe an image tool should be dependable, honest, and completely respectful of your privacy.
        </p>
      </header>

      <div className="space-y-6 text-slate leading-relaxed text-base">
        <h2 className="text-xl font-heading font-bold text-ink">Why We Built ImageFit</h2>
        <p>
          Too many image utility sites force users through cluttered ad banners, deceptive &ldquo;Start Download&rdquo; traps, and vague sliders that leave you guessing whether your photo meets an institution&apos;s strict 100 KB limit.
        </p>
        <p>
          ImageFit was created as a <strong>precision tool</strong>. We built an engine that directly measures the resulting Blob size in your browser memory and provides clear, truthful feedback: if the file meets your limit, it turns green; if not, we tell you exactly how many kilobytes remain and suggest realistic dimension adjustments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
          <div className="rounded-2xl bg-white border border-border p-6 shadow-card space-y-2">
            <Target className="w-6 h-6 text-cobalt" />
            <h3 className="font-heading font-bold text-ink text-base">Verified Limits</h3>
            <p className="text-xs text-slate leading-relaxed">
              We never label a file &ldquo;Target Met&rdquo; unless the exact byte count is verified to be under your target limit.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-border p-6 shadow-card space-y-2">
            <ShieldCheck className="w-6 h-6 text-success" />
            <h3 className="font-heading font-bold text-ink text-base">100% In-Browser Privacy</h3>
            <p className="text-xs text-slate leading-relaxed">
              Your files never leave your device. All compression and format conversion occurs inside your local browser memory.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-heading font-bold text-ink">Who ImageFit Is For</h2>
        <p>
          Whether you are a student submitting passport photos for an exam board, a designer optimizing UI assets, or a website manager striving for faster loading times, ImageFit gives you exact control without subscriptions or sign-ups.
        </p>
      </div>
    </div>
  );
}
