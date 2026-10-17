import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BRAND, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.slogan}`,
  description: BRAND.description,
  metadataBase: new URL(SITE_URL),
  keywords: [
    "image compressor to target size",
    "compress image to 50kb",
    "compress image to 100kb",
    "compress image to 200kb",
    "image resizer",
    "image converter webp png jpeg",
    "client-side image compressor",
    "browser image privacy",
  ],
  authors: [{ name: "ImageFit Team" }],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.slogan}`,
    description: BRAND.description,
    type: "website",
    locale: "en_US",
    siteName: BRAND.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#15233B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-cloud text-ink font-sans selection:bg-cobalt/20 selection:text-cobalt">
        <Header />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
