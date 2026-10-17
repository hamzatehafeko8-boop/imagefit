import { sanitizeFilename } from "../utils";
import { PROCESSING_LIMITS } from "../constants";
import {
  ImageMeta,
  OutputFormat,
  canvasToBlob,
} from "./compressor";

export type ResizeFitMode = "contain" | "cover" | "stretch";
export type CropPosition = "center" | "top" | "bottom" | "left" | "right";

export interface ResizeOptions {
  targetWidth: number;
  targetHeight: number;
  fitMode: ResizeFitMode;
  maintainAspectRatio: boolean;
  outputFormat: OutputFormat;
  quality?: number; // 0.1 to 1.0, default 0.92 for lossy formats
  backgroundColor?: string; // default "#FFFFFF" for transparency flattening in JPEG
  cropPosition?: CropPosition; // default "center"
  allowUpscale?: boolean; // default false
}

export interface DimensionValidation {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  isUpscaled: boolean;
  upscaleFactor: number;
}

export interface ContainResult {
  width: number;
  height: number;
  ratio: number;
  isConstrainedByWidth: boolean;
}

export interface CoverCropResult {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  ratio: number;
}

export interface ResizeResult {
  status: "success" | "error";
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  originalBytes: number;
  outputBytes: number;
  outputMimeType: string;
  qualityUsed: number;
  outputBlob: Blob | null;
  outputUrl: string | null;
  filename: string;
  isUpscaled: boolean;
  fitModeUsed: ResizeFitMode;
  warningMessage?: string;
  errorMessage?: string;
  advice?: string;
}

/**
 * Validates dimensions against safety constraints and integer limits
 */
export function validateDimensions(
  width: number,
  height: number,
  maxWidth = PROCESSING_LIMITS.maxDimensionPx,
  maxHeight = PROCESSING_LIMITS.maxDimensionPx
): DimensionValidation {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return {
      isValid: false,
      errorMessage: "Dimensions must be finite numbers.",
      isUpscaled: false,
      upscaleFactor: 1,
    };
  }

  if (width <= 0 || height <= 0) {
    return {
      isValid: false,
      errorMessage: "Width and height must be positive numbers greater than zero.",
      isUpscaled: false,
      upscaleFactor: 1,
    };
  }

  if (width > maxWidth || height > maxHeight) {
    return {
      isValid: false,
      errorMessage: `Dimensions (${Math.round(width)}×${Math.round(height)}px) exceed the safety limit of ${maxWidth}px.`,
      isUpscaled: false,
      upscaleFactor: 1,
    };
  }

  return {
    isValid: true,
    isUpscaled: false,
    upscaleFactor: 1,
  };
}

/**
 * Calculates proportional dimensions based on original aspect ratio
 */
export function calculateProportionalDimensions(
  origW: number,
  origH: number,
  params: { newWidth?: number; newHeight?: number }
): { width: number; height: number } {
  if (origW <= 0 || origH <= 0) {
    throw new Error("Original dimensions must be positive integers.");
  }

  const aspectRatio = origW / origH;

  if (params.newWidth !== undefined && params.newWidth > 0) {
    const width = Math.round(params.newWidth);
    const height = Math.max(1, Math.round(width / aspectRatio));
    return { width, height };
  }

  if (params.newHeight !== undefined && params.newHeight > 0) {
    const height = Math.round(params.newHeight);
    const width = Math.max(1, Math.round(height * aspectRatio));
    return { width, height };
  }

  return { width: origW, height: origH };
}

/**
 * Fit (Contain) Mode:
 * Scales the image proportionally so that the entire image fits within [maxW, maxH].
 * Preserves the whole image without cropping or distorting.
 */
export function calculateContainDimensions(
  origW: number,
  origH: number,
  maxW: number,
  maxH: number
): ContainResult {
  if (origW <= 0 || origH <= 0 || maxW <= 0 || maxH <= 0) {
    throw new Error("Dimensions must be positive numbers.");
  }

  const widthRatio = maxW / origW;
  const heightRatio = maxH / origH;
  const ratio = Math.min(widthRatio, heightRatio);

  const width = Math.max(1, Math.round(origW * ratio));
  const height = Math.max(1, Math.round(origH * ratio));
  const isConstrainedByWidth = widthRatio <= heightRatio;

  return {
    width,
    height,
    ratio,
    isConstrainedByWidth,
  };
}

/**
 * Crop (Cover) Mode:
 * Fills the exact [targetW, targetH] canvas by scaling the image proportionally
 * and cropping any excess content based on alignment.
 */
export function calculateCoverCrop(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  position: CropPosition = "center"
): CoverCropResult {
  if (origW <= 0 || origH <= 0 || targetW <= 0 || targetH <= 0) {
    throw new Error("Dimensions must be positive numbers.");
  }

  // Scale ratio needed to fully cover target bounds
  const ratio = Math.max(targetW / origW, targetH / origH);

  // Visible window in source coordinates
  const sourceWidth = targetW / ratio;
  const sourceHeight = targetH / ratio;

  let sourceX = 0;
  let sourceY = 0;

  switch (position) {
    case "center":
      sourceX = (origW - sourceWidth) / 2;
      sourceY = (origH - sourceHeight) / 2;
      break;
    case "top":
      sourceX = (origW - sourceWidth) / 2;
      sourceY = 0;
      break;
    case "bottom":
      sourceX = (origW - sourceWidth) / 2;
      sourceY = origH - sourceHeight;
      break;
    case "left":
      sourceX = 0;
      sourceY = (origH - sourceHeight) / 2;
      break;
    case "right":
      sourceX = origW - sourceWidth;
      sourceY = (origH - sourceHeight) / 2;
      break;
  }

  // Clamp source bounds within original canvas
  sourceX = Math.max(0, Math.min(origW - sourceWidth, sourceX));
  sourceY = Math.max(0, Math.min(origH - sourceHeight, sourceY));

  return {
    sourceX: Math.round(sourceX),
    sourceY: Math.round(sourceY),
    sourceWidth: Math.round(sourceWidth),
    sourceHeight: Math.round(sourceHeight),
    targetWidth: Math.round(targetW),
    targetHeight: Math.round(targetH),
    ratio,
  };
}

/**
 * Checks whether the requested resize operation scales beyond source resolution
 */
export function checkUpscaling(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number
): { isUpscaled: boolean; upscaleFactor: number; message?: string } {
  const widthFactor = targetW / origW;
  const heightFactor = targetH / origH;
  const maxFactor = Math.max(widthFactor, heightFactor);
  const isUpscaled = maxFactor > 1.0;

  let message: string | undefined;
  if (isUpscaled) {
    const percent = Math.round((maxFactor - 1.0) * 100);
    message = `Upscaling by ${percent}% (${Math.round(maxFactor * 10) / 10}×) beyond original resolution. May result in softer or pixelated output.`;
  }

  return {
    isUpscaled,
    upscaleFactor: Math.round(maxFactor * 100) / 100,
    message,
  };
}

/**
 * Generates an appropriate, safe download filename for resized output
 */
export function generateResizedFilename(
  originalName: string,
  width: number,
  height: number,
  outputFormat: OutputFormat
): string {
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const cleanBase = sanitizeFilename(baseName);

  let ext = "jpg";
  if (outputFormat === "image/webp") ext = "webp";
  else if (outputFormat === "image/png") ext = "png";

  return `${cleanBase}-${width}x${height}.${ext}`;
}

/**
 * Core Image Resizer Engine
 * Executes real browser canvas resizing, transparency handling, smoothing, and encoding
 */
export async function resizeImage(
  imageMeta: ImageMeta,
  options: ResizeOptions
): Promise<ResizeResult> {
  const {
    targetWidth,
    targetHeight,
    fitMode,
    maintainAspectRatio,
    outputFormat,
    quality = 0.92,
    backgroundColor = "#FFFFFF",
    cropPosition = "center",
  } = options;

  // 1. Dimension validation
  const validation = validateDimensions(targetWidth, targetHeight);
  if (!validation.isValid) {
    return {
      status: "error",
      originalWidth: imageMeta.width,
      originalHeight: imageMeta.height,
      outputWidth: 0,
      outputHeight: 0,
      originalBytes: imageMeta.sizeBytes,
      outputBytes: 0,
      outputMimeType: outputFormat,
      qualityUsed: quality,
      outputBlob: null,
      outputUrl: null,
      filename: imageMeta.name,
      isUpscaled: false,
      fitModeUsed: fitMode,
      errorMessage: validation.errorMessage,
    };
  }

  // 2. Compute final dimensions & drawing coordinates based on fitMode
  let finalWidth = targetWidth;
  let finalHeight = targetHeight;
  let coverCrop: CoverCropResult | null = null;
  let warningMessage: string | undefined;

  if (fitMode === "contain") {
    // Contain mode: calculate bounding box fit
    const contain = calculateContainDimensions(
      imageMeta.width,
      imageMeta.height,
      targetWidth,
      targetHeight
    );
    finalWidth = contain.width;
    finalHeight = contain.height;
    if (finalWidth !== targetWidth || finalHeight !== targetHeight) {
      warningMessage = `Preserved original aspect ratio: output fitted to ${finalWidth}×${finalHeight}px within ${targetWidth}×${targetHeight}px bounds.`;
    }
  } else if (fitMode === "cover") {
    // Cover mode: crop excess to exact target dimensions
    coverCrop = calculateCoverCrop(
      imageMeta.width,
      imageMeta.height,
      targetWidth,
      targetHeight,
      cropPosition
    );
    finalWidth = coverCrop.targetWidth;
    finalHeight = coverCrop.targetHeight;
  } else {
    // Stretch mode: independent width and height
    if (!maintainAspectRatio) {
      const origRatio = imageMeta.width / imageMeta.height;
      const newRatio = targetWidth / targetHeight;
      if (Math.abs(origRatio - newRatio) > 0.01) {
        warningMessage = "Image stretched without aspect ratio lock. Output visual proportions are modified.";
      }
    }
  }

  // Check upscaling
  const upscaleCheck = checkUpscaling(imageMeta.width, imageMeta.height, finalWidth, finalHeight);
  if (upscaleCheck.isUpscaled) {
    warningMessage = warningMessage
      ? `${warningMessage} Note: ${upscaleCheck.message}`
      : upscaleCheck.message;
  }

  // 3. Load image into HTML Image element
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load source image into canvas for resizing."));
    img.src = imageMeta.previewUrl;
  });

  // 4. Create and configure 2D Canvas
  const canvas = document.createElement("canvas");
  canvas.width = finalWidth;
  canvas.height = finalHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for image resizing.");
  }

  // Configure high-quality bicubic smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 5. Transparency Flattening for JPEG
  if (outputFormat === "image/jpeg") {
    if (imageMeta.hasAlpha) {
      const transparencyNote = "JPEG does not support transparency; background flattened with pure white.";
      warningMessage = warningMessage ? `${warningMessage} ${transparencyNote}` : transparencyNote;
    }
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, finalWidth, finalHeight);
  }

  // 6. Draw image based on fitMode
  if (fitMode === "cover" && coverCrop) {
    ctx.drawImage(
      img,
      coverCrop.sourceX,
      coverCrop.sourceY,
      coverCrop.sourceWidth,
      coverCrop.sourceHeight,
      0,
      0,
      finalWidth,
      finalHeight
    );
  } else {
    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
  }

  // 7. Encode canvas to Blob
  const actualQuality = outputFormat === "image/png" ? 1.0 : quality;
  const outputBlob = await canvasToBlob(canvas, outputFormat, actualQuality);

  // Verify actual returned MIME type
  const actualMime: string = outputBlob.type || outputFormat;
  if (actualMime !== outputFormat && outputFormat === "image/webp") {
    const webpNote = `Browser encoder outputted ${actualMime} instead of requested WebP.`;
    warningMessage = warningMessage ? `${warningMessage} ${webpNote}` : webpNote;
  }

  const outputUrl = URL.createObjectURL(outputBlob);
  const filename = generateResizedFilename(imageMeta.name, finalWidth, finalHeight, outputFormat);

  let advice: string | undefined;
  if (outputFormat === "image/png" && outputBlob.size > 1024 * 1024) {
    advice = "Large PNG generated. To reduce file size while preserving dimensions, consider WebP format or using the Image Compressor.";
  }

  return {
    status: "success",
    originalWidth: imageMeta.width,
    originalHeight: imageMeta.height,
    outputWidth: finalWidth,
    outputHeight: finalHeight,
    originalBytes: imageMeta.sizeBytes,
    outputBytes: outputBlob.size,
    outputMimeType: actualMime,
    qualityUsed: actualQuality,
    outputBlob,
    outputUrl,
    filename,
    isUpscaled: upscaleCheck.isUpscaled,
    fitModeUsed: fitMode,
    warningMessage,
    advice,
  };
}
