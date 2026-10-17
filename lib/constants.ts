export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const BRAND = {
  name: "ImageFit",
  slogan: "Every image. The right fit.",
  description:
    "Compress images to a file-size limit, resize dimensions, and convert supported formats with clear results before you download. Client-side browser processing.",
  url: SITE_URL,
};

export const PROCESSING_LIMITS = {
  maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB safety ceiling
  maxFileSizeLabel: "50 MB",
  maxDimensionPx: 16384, // Canvas DoS protection boundary
  supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  supportedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
};

export const COMPRESSOR_PRESETS = [
  { label: "50 KB", valueBytes: 50 * 1024, description: "Common application/admission portal limit" },
  { label: "100 KB", valueBytes: 100 * 1024, description: "Online forms and standard avatars" },
  { label: "200 KB", valueBytes: 200 * 1024, description: "Fast mobile web hero and blog thumbnails" },
  { label: "500 KB", valueBytes: 500 * 1024, description: "High-resolution web portfolios" },
  { label: "1 MB", valueBytes: 1024 * 1024, description: "Document attachments and print previews" },
];

export const RESIZER_DIMENSION_PRESETS = [
  { label: "Full HD (1920×1080)", width: 1920, height: 1080, category: "Desktop / Video" },
  { label: "Social Card (1200×630)", width: 1200, height: 630, category: "Social Media" },
  { label: "Instagram Square (1080×1080)", width: 1080, height: 1080, category: "Social Media" },
  { label: "Web Standard (800×600)", width: 800, height: 600, category: "Web Graphics" },
  { label: "Profile / Avatar (400×400)", width: 400, height: 400, category: "Avatars" },
  { label: "Thumbnail (200×200)", width: 200, height: 200, category: "Thumbnails" },
];

export const RESIZER_SCALE_PRESETS = [
  { label: "25%", factor: 0.25 },
  { label: "50%", factor: 0.50 },
  { label: "75%", factor: 0.75 },
  { label: "100%", factor: 1.00 },
  { label: "150%", factor: 1.50 },
  { label: "200%", factor: 2.00 },
];

export const CONVERTER_FORMATS = [
  {
    mime: "image/jpeg" as const,
    label: "JPEG",
    extension: "jpg",
    description: "Best for photographs and rich imagery without transparency. High lossy compression.",
    supportsAlpha: false,
    supportsQuality: true,
  },
  {
    mime: "image/webp" as const,
    label: "WebP",
    extension: "webp",
    description: "Modern web standard with lossy quality control and full alpha transparency.",
    supportsAlpha: true,
    supportsQuality: true,
  },
  {
    mime: "image/png" as const,
    label: "PNG",
    extension: "png",
    description: "Lossless compression with transparency. Ideal for logos, icons, and sharp line art.",
    supportsAlpha: true,
    supportsQuality: false,
  },
];

export const JPEG_BACKGROUND_PRESETS = [
  { label: "Pure White", hex: "#FFFFFF" },
  { label: "Pitch Black", hex: "#000000" },
  { label: "Cloud Surface", hex: "#F5F7FB" },
  { label: "Deep Ink", hex: "#15233B" },
];
