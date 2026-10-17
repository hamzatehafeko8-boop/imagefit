import React from "react";
import Link from "next/link";
import { ImageFitLogo } from "@/components/brand/ImageFitLogo";
import { ShieldCheck, Cpu, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <ImageFitLogo />
            <p className="text-sm text-slate leading-relaxed">
              Every image. The right fit. High-precision browser-based compression to target file sizes, dimension resizing, and format conversion.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-success pt-1">
              <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
              <span>Client-Side Processing. No remote uploads.</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4 font-heading">
              Image Tools
            </h3>
            <ul className="space-y-2.5 text-sm" role="list">
              <li>
                <Link
                  href="/tools/image-compressor"
                  className="text-slate hover:text-cobalt transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Image Compressor</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cobalt/10 text-cobalt font-semibold">
                    Target Size
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/image-resizer"
                  className="text-slate hover:text-cobalt transition-colors"
                >
                  Image Resizer
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/image-converter"
                  className="text-slate hover:text-cobalt transition-colors"
                >
                  Image Converter
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Guides */}
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4 font-heading">
              Guides & Resources
            </h3>
            <ul className="space-y-2.5 text-sm" role="list">
              <li>
                <Link
                  href="/guides/reduce-image-size"
                  className="text-slate hover:text-cobalt transition-colors"
                >
                  How to Reduce Image Size
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/image-dimensions-and-aspect-ratio"
                  className="text-slate hover:text-cobalt transition-colors"
                >
                  Dimensions & Aspect Ratio Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-slate hover:text-cobalt transition-colors"
                >
                  All Guides & Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Product Trust */}
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4 font-heading">
              Product & Trust
            </h3>
            <ul className="space-y-2.5 text-sm" role="list">
              <li>
                <Link href="/about" className="text-slate hover:text-cobalt transition-colors">
                  About ImageFit
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate hover:text-cobalt transition-colors">
                  Privacy Statement
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate hover:text-cobalt transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate hover:text-cobalt transition-colors">
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
          <p>© {new Date().getFullYear()} ImageFit. Precision image optimization. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cobalt" /> Client-Side WebCanvas
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-success" /> Zero Server Transmission
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
