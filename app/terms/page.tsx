import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | ImageFit",
  description: "Terms of service and fair use conditions for the ImageFit web utility.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-slate">Last updated: October 2026</p>
      </header>

      <div className="space-y-6 text-slate leading-relaxed text-base">
        <h2 className="text-xl font-heading font-bold text-ink">1. Acceptance of Terms</h2>
        <p>
          By using ImageFit, you agree to these Terms. ImageFit is a client-side browser image utility provided to help you optimize file sizes, resize dimensions, and convert supported formats.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">2. Permitted Use</h2>
        <p>
          You may use ImageFit for personal, academic, and commercial purposes. Because all operations execute locally in your web browser, you remain entirely responsible for the images you choose to process and ensuring you hold the right to handle them.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">3. Disclaimer of Warranties</h2>
        <p>
          ImageFit is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. While our algorithms measure exact candidate Blob bytes to ensure compliance with selected file-size limits, we do not warrant that all arbitrary compression targets can be reached without visual trade-offs.
        </p>

        <h2 className="text-xl font-heading font-bold text-ink">4. Limitation of Liability</h2>
        <p>
          In no event shall ImageFit be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this service.
        </p>
      </div>
    </div>
  );
}
