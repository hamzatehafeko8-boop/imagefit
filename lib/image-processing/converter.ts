import { sanitizeFilename } from "../utils";
import { PROCESSING_LIMITS } from "../constants";
import {
  ImageMeta,
  OutputFormat,
  canvasToBlob,
} from "./compressor";

export type ConvertFormat = OutputFormat;

export interface ConverterOptions {
  targetFormat: ConvertFormat;
  quality?: number; // 0.1 to 1.0, default 0.92 for lossy formats (JPEG/WebP)
  backgroundColor?: string; // default "#FFFFFF" for transparency flattening in JPEG
}

export interface FormatValidation {
  isSupported: boolean;
  normalizedMime: string;
  reason?: string;
}

export interface SizeComparison {
  sizeDifferenceBytes: number;
  percentDifference: number;
  isSizeIncreased: boolean;
  differenceLabel: string;
}

export interface ConverterResult {
  status: "success" | "error";
  requestedFormat: ConvertFormat;
  actualMimeType: string;
  originalFormat: string;
  originalBytes: number;
  outputBytes: number;
  sizeDifferenceBytes: number;
  percentDifference: number;
  isSizeIncreased: boolean;
  width: number;
  height: number;
  outputBlob: Blob | null;
  outputUrl: string | null;
  filename: string;
  transparencyHandled: "preserved" | "flattened" | "none";
  warningMessage?: string;
  errorMessage?: string;
  advice?: string;
}

/**
 * Validates input image format and returns explicit reasons if unsupported
 */
export function validateInputFormat(mimeType: string, filename?: string): FormatValidation {
  const normalized = (mimeType || "").toLowerCase().trim();

  // Explicit rejection checks for advanced/unsupported formats
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

  if (PROCESSING_LIMITS.supportedMimeTypes.includes(normalized)) {
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

/**
 * Generates an appropriate, safe download filename for converted output
 */
export function generateConvertedFilename(
  originalName: string,
  targetFormat: ConvertFormat
): string {
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const cleanBase = sanitizeFilename(baseName);

  let ext = "jpg";
  if (targetFormat === "image/webp") ext = "webp";
  else if (targetFormat === "image/png") ext = "png";

  return `${cleanBase}.${ext}`;
}

/**
 * Calculates honest size differences between source and converted output
 */
export function calculateSizeDifference(
  originalBytes: number,
  outputBytes: number
): SizeComparison {
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

/**
 * Core Image Converter Engine
 * Performs real in-browser canvas format conversion, transparency flattening/preservation,
 * and strict MIME type verification on the resulting Blob.
 */
export async function convertImage(
  imageMeta: ImageMeta,
  options: ConverterOptions
): Promise<ConverterResult> {
  const {
    targetFormat,
    quality = 0.92,
    backgroundColor = "#FFFFFF",
  } = options;

  // 1. Verify input format is supported
  const validation = validateInputFormat(imageMeta.type, imageMeta.name);
  if (!validation.isSupported) {
    return {
      status: "error",
      requestedFormat: targetFormat,
      actualMimeType: imageMeta.type,
      originalFormat: imageMeta.type,
      originalBytes: imageMeta.sizeBytes,
      outputBytes: 0,
      sizeDifferenceBytes: 0,
      percentDifference: 0,
      isSizeIncreased: false,
      width: imageMeta.width,
      height: imageMeta.height,
      outputBlob: null,
      outputUrl: null,
      filename: imageMeta.name,
      transparencyHandled: "none",
      errorMessage: validation.reason,
    };
  }

  // 2. Load source image into HTML Image element
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image into canvas for format conversion."));
    img.src = imageMeta.previewUrl;
  });

  // 3. Create canvas matching original pixel dimensions
  const canvas = document.createElement("canvas");
  canvas.width = imageMeta.width;
  canvas.height = imageMeta.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for format conversion.");
  }

  // Configure high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  let warningMessage: string | undefined;
  let transparencyHandled: "preserved" | "flattened" | "none" = "none";

  // 4. Handle transparency based on destination format
  if (targetFormat === "image/jpeg") {
    if (imageMeta.hasAlpha) {
      transparencyHandled = "flattened";
      warningMessage = `Original image contained transparency. JPEG format does not support transparency; transparent areas were flattened with background color (${backgroundColor}).`;
    }
    // Flatten against chosen background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, imageMeta.width, imageMeta.height);
  } else {
    // PNG or WebP
    if (imageMeta.hasAlpha) {
      transparencyHandled = "preserved";
    }
  }

  // 5. Draw image onto canvas
  ctx.drawImage(img, 0, 0, imageMeta.width, imageMeta.height);

  // 6. Encode canvas to Blob
  // For PNG, canvas standard ignores quality and encodes lossless
  const actualQuality = targetFormat === "image/png" ? 1.0 : quality;
  const outputBlob = await canvasToBlob(canvas, targetFormat, actualQuality);

  // 7. Strict MIME Type Verification
  const actualMime: string = outputBlob.type || "";
  if (!actualMime || actualMime !== targetFormat) {
    return {
      status: "error",
      requestedFormat: targetFormat,
      actualMimeType: actualMime || "unknown",
      originalFormat: imageMeta.type,
      originalBytes: imageMeta.sizeBytes,
      outputBytes: outputBlob.size,
      sizeDifferenceBytes: 0,
      percentDifference: 0,
      isSizeIncreased: false,
      width: imageMeta.width,
      height: imageMeta.height,
      outputBlob: null,
      outputUrl: null,
      filename: imageMeta.name,
      transparencyHandled: "none",
      errorMessage: `Browser encoder produced ${actualMime || "an unknown type"} instead of the requested ${targetFormat}. Conversion cannot be verified as authentic.`,
    };
  }

  // 8. Calculate size metrics
  const comparison = calculateSizeDifference(imageMeta.sizeBytes, outputBlob.size);
  const outputUrl = URL.createObjectURL(outputBlob);
  const filename = generateConvertedFilename(imageMeta.name, targetFormat);

  let advice: string | undefined;
  if (comparison.isSizeIncreased && targetFormat === "image/png" && imageMeta.type === "image/jpeg") {
    advice = "Converting from lossy JPEG to lossless PNG typically increases file size because PNG preserves full uncompressed pixel fidelity without re-compression benefits.";
  } else if (comparison.isSizeIncreased && targetFormat === "image/jpeg" && comparison.percentDifference > 20) {
    advice = "High quality JPEG encoding resulted in a larger file size. Try lowering the quality slider (e.g. 80-85%) or use ImageFit Compressor to meet an exact file size limit.";
  }

  return {
    status: "success",
    requestedFormat: targetFormat,
    actualMimeType: actualMime,
    originalFormat: imageMeta.type,
    originalBytes: imageMeta.sizeBytes,
    outputBytes: outputBlob.size,
    sizeDifferenceBytes: comparison.sizeDifferenceBytes,
    percentDifference: comparison.percentDifference,
    isSizeIncreased: comparison.isSizeIncreased,
    width: imageMeta.width,
    height: imageMeta.height,
    outputBlob,
    outputUrl,
    filename,
    transparencyHandled,
    warningMessage,
    advice,
  };
}
