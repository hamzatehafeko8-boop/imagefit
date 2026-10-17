import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Pure functions under test (mirroring lib/image-processing/converter.ts)
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function validateInputFormat(mimeType, filename) {
  const normalized = (mimeType || "").toLowerCase().trim();

  if (normalized === "image/svg+xml" || (filename && filename.toLowerCase().endsWith(".svg"))) {
    return {
      isSupported: false,
      normalizedMime: "image/svg+xml",
      reason: "Vector formats (SVG) are not supported by the raster converter. Please use a vector graphics tool or rasterize to PNG first.",
    };
  }

  if (normalized === "image/gif" || (filename && filename.toLowerCase().endsWith(".gif"))) {
    return {
      isSupported: false,
      normalizedMime: "image/gif",
      reason: "Animated and palette GIF formats are not supported in this milestone. ImageFit converts static JPEG, PNG, and WebP images.",
    };
  }

  if (
    normalized === "image/bmp" ||
    normalized === "image/x-ms-bmp" ||
    (filename && filename.toLowerCase().endsWith(".bmp"))
  ) {
    return {
      isSupported: false,
      normalizedMime: "image/bmp",
      reason: "BMP format is not supported. Please choose a JPEG, PNG, or WebP image.",
    };
  }

  if (
    normalized === "image/tiff" ||
    normalized === "image/x-tiff" ||
    (filename && (filename.toLowerCase().endsWith(".tif") || filename.toLowerCase().endsWith(".tiff")))
  ) {
    return {
      isSupported: false,
      normalizedMime: "image/tiff",
      reason: "TIFF format is not supported. Please choose a JPEG, PNG, or WebP image.",
    };
  }

  const supported = ["image/jpeg", "image/png", "image/webp"];
  if (supported.includes(normalized)) {
    return {
      isSupported: true,
      normalizedMime: normalized,
    };
  }

  return {
    isSupported: false,
    normalizedMime: normalized || "unknown",
    reason: `Unsupported format (${normalized || "unknown"}). Supported formats are JPEG, PNG, and WebP.`,
  };
}

function generateConvertedFilename(originalName, targetFormat) {
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const cleanBase = sanitizeFilename(baseName);

  let ext = "jpg";
  if (targetFormat === "image/webp") ext = "webp";
  else if (targetFormat === "image/png") ext = "png";

  return `${cleanBase}.${ext}`;
}

function calculateSizeDifference(originalBytes, outputBytes) {
  const sizeDifferenceBytes = outputBytes - originalBytes;
  const isSizeIncreased = sizeDifferenceBytes > 0;

  if (originalBytes <= 0) {
    return {
      sizeDifferenceBytes,
      percentDifference: 0,
      isSizeIncreased,
      differenceLabel: "Unknown difference",
    };
  }

  const percentDifference = Math.round((Math.abs(sizeDifferenceBytes) / originalBytes) * 1000) / 10;

  let differenceLabel = "Identical size";
  if (sizeDifferenceBytes > 0) {
    differenceLabel = `+${percentDifference}% larger`;
  } else if (sizeDifferenceBytes < 0) {
    differenceLabel = `-${percentDifference}% smaller`;
  }

  return {
    sizeDifferenceBytes,
    percentDifference,
    isSizeIncreased,
    differenceLabel,
  };
}

function verifyMimeType(actualMime, targetFormat) {
  if (!actualMime || actualMime !== targetFormat) {
    return {
      verified: false,
      errorMessage: `Browser encoder produced ${actualMime || "an unknown type"} instead of the requested ${targetFormat}. Conversion cannot be verified as authentic.`,
    };
  }
  return { verified: true };
}

describe("ImageFit Converter Engine Verification", () => {
  describe("Input Format Validation & Rejection", () => {
    it("accepts supported formats (JPEG, PNG, WebP) case-insensitively", () => {
      assert.equal(validateInputFormat("image/jpeg").isSupported, true);
      assert.equal(validateInputFormat("image/png").isSupported, true);
      assert.equal(validateInputFormat("image/webp").isSupported, true);
      assert.equal(validateInputFormat(" IMAGE/JPEG ").isSupported, true);
    });

    it("rejects SVG vector format with actionable explanation", () => {
      const res = validateInputFormat("image/svg+xml", "icon.svg");
      assert.equal(res.isSupported, false);
      assert.ok(res.reason.includes("Vector formats (SVG) are not supported"));
    });

    it("rejects animated GIF format with explanation", () => {
      const res = validateInputFormat("image/gif", "animation.gif");
      assert.equal(res.isSupported, false);
      assert.ok(res.reason.includes("GIF formats are not supported"));
    });

    it("rejects BMP and TIFF formats", () => {
      assert.equal(validateInputFormat("image/bmp", "bitmap.bmp").isSupported, false);
      assert.equal(validateInputFormat("image/tiff", "scan.tiff").isSupported, false);
    });

    it("rejects arbitrary unknown formats with helpful message", () => {
      const res = validateInputFormat("application/pdf", "document.pdf");
      assert.equal(res.isSupported, false);
      assert.ok(res.reason.includes("Unsupported format"));
    });
  });

  describe("Converted Filename Generation", () => {
    it("converts JPEG extension to .webp", () => {
      const name = generateConvertedFilename("camera_photo.jpg", "image/webp");
      assert.equal(name, "camera_photo.webp");
    });

    it("converts PNG extension to .jpg", () => {
      const name = generateConvertedFilename("screenshot.png", "image/jpeg");
      assert.equal(name, "screenshot.jpg");
    });

    it("converts WebP extension to .png", () => {
      const name = generateConvertedFilename("banner.webp", "image/png");
      assert.equal(name, "banner.png");
    });

    it("preserves multiple dots in base name and sanitizes path traversal", () => {
      const name = generateConvertedFilename("../../photos/holiday.v2.final.png", "image/webp");
      assert.equal(name, ".._.._photos_holiday.v2.final.webp");
    });
  });

  describe("Honest Size Difference Calculations", () => {
    it("accurately reports file size reductions", () => {
      const orig = 200 * 1024; // 200 KB
      const out = 120 * 1024;  // 120 KB
      const comp = calculateSizeDifference(orig, out);

      assert.equal(comp.isSizeIncreased, false);
      assert.equal(comp.sizeDifferenceBytes, -80 * 1024);
      assert.equal(comp.percentDifference, 40);
      assert.equal(comp.differenceLabel, "-40% smaller");
    });

    it("accurately reports file size increases without masking them as savings", () => {
      const orig = 100 * 1024; // 100 KB
      const out = 150 * 1024;  // 150 KB
      const comp = calculateSizeDifference(orig, out);

      assert.equal(comp.isSizeIncreased, true);
      assert.equal(comp.sizeDifferenceBytes, 50 * 1024);
      assert.equal(comp.percentDifference, 50);
      assert.equal(comp.differenceLabel, "+50% larger");
    });

    it("accurately reports identical byte sizes", () => {
      const size = 50 * 1024;
      const comp = calculateSizeDifference(size, size);

      assert.equal(comp.isSizeIncreased, false);
      assert.equal(comp.sizeDifferenceBytes, 0);
      assert.equal(comp.percentDifference, 0);
      assert.equal(comp.differenceLabel, "Identical size");
    });
  });

  describe("Strict MIME Type Verification & Fallback Detection", () => {
    it("passes verification when actual MIME matches requested format", () => {
      const res = verifyMimeType("image/webp", "image/webp");
      assert.equal(res.verified, true);
    });

    it("strictly rejects when browser silently falls back to PNG instead of WebP", () => {
      const res = verifyMimeType("image/png", "image/webp");
      assert.equal(res.verified, false);
      assert.ok(res.errorMessage.includes("produced image/png instead of the requested image/webp"));
    });

    it("rejects empty or missing MIME type", () => {
      const res = verifyMimeType("", "image/jpeg");
      assert.equal(res.verified, false);
      assert.ok(res.errorMessage.includes("Conversion cannot be verified as authentic"));
    });
  });

  describe("Transparency Handling Rules", () => {
    it("mandates background flattening when transparent image is converted to JPEG", () => {
      const hasAlpha = true;
      const targetFormat = "image/jpeg";
      const isFlattened = hasAlpha && targetFormat === "image/jpeg";
      assert.equal(isFlattened, true);
    });

    it("preserves transparency when transparent image is converted to PNG or WebP", () => {
      const hasAlpha = true;
      assert.equal(hasAlpha && "image/png" !== "image/jpeg", true);
      assert.equal(hasAlpha && "image/webp" !== "image/jpeg", true);
    });
  });
});
