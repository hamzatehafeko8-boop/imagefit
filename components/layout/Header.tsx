"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck } from "lucide-react";
import { ImageFitLogo } from "@/components/brand/ImageFitLogo";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close menu on route change during render (React 19 recommended pattern)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Compress", href: "/tools/image-compressor", badge: "Target Size" },
    { label: "Resize", href: "/tools/image-resizer" },
    { label: "Convert", href: "/tools/image-converter" },
    { label: "Guides", href: "/guides" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <ImageFitLogo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors relative flex items-center gap-1.5 ${
                    isActive
                      ? "text-cobalt bg-cobalt/5 font-semibold"
                      : "text-slate hover:text-ink hover:bg-cloud"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cobalt/10 text-cobalt">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side - Privacy Trust Pill & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Privacy badge */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-success-light text-success border border-success/20"
            title="All image files are processed locally in your browser memory"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>Local Browser Processing</span>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate hover:text-ink hover:bg-cloud focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-white px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cloud text-xs text-slate mb-3">
            <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
            <span>Files stay on your device. Zero server uploads.</span>
          </div>
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? "text-cobalt bg-cobalt/10 font-semibold"
                      : "text-ink hover:bg-cloud"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cobalt/10 text-cobalt">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border mt-2">
              <Link
                href="/privacy"
                className="px-3 py-2 rounded-lg text-sm text-slate hover:text-ink block"
              >
                Privacy Statement
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 rounded-lg text-sm text-slate hover:text-ink block"
              >
                Contact & Feedback
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
