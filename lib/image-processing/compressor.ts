import { sanitizeFilename } from "../utils";

export interface ImageMeta {
  file: File;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  type: string;
  hasAlpha: boolean;
  previewUrl: string;
}

export type OutputFormat = "image/jpeg" | "image/webp" | "image/png";

export interface CompressionOptions {
  targetBytes: number;
  outputFormat: OutputFormat;
  scalePercent?: number; // 25 to 100, default 100
  backgroundColor?: string; // default "#FFFFFF" for transparency flattening in JPEG
  maxIterations?: number; // default 8
  onProgress?: (progress: CompressionProgress) => void;
}

export interface CompressionProgress {
  stage: "analyzing" | "encoding" | "verifying" | "done" | "error";
  iteration: number;
  maxIterations: number;
  currentQuality: number;
  currentBytes: number;
  targetBytes: number;
  message: string;
}

export interface CandidateResult {
  quality: number;
  blob: Blob;
  sizeBytes: number;
  mimeType: string;
  width: number;
  height: number;
}

export interface CompressionResult {
  status: "target_met" | "target_not_met" | "error";
  originalBytes: number;
  outputBytes: number;
  targetBytes: number;
  percentReduction: number;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  outputMimeType: string;
  qualityUsed: number;
  iterationsUsed: number;
  outputBlob: Blob | null;
  outputUrl: string | null;
  filename: string;
  warningMessage?: string;
  errorMessage?: string;
  advice?: string;
}

/**
 * Detects whether an image has transparency by inspecting pixel alpha channel
 */
export function detectAlphaChannel(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    // Sample step to keep inspection fast on large canvases
    const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 50000)));
    const imgData = ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < imgData.length; i += 4 * step) {
      if (imgData[i] < 255) {
        return true;
      }
    }
  } catch {
    // If getImageData is restricted (e.g. CORS), fallback to false
    return false;
  }
  return false;
}

/**
 * Encodes a canvas to a real Blob using HTMLCanvasElement.toBlob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Canvas encoding failed for format ${format} at quality ${quality}`));
        } else {
          resolve(blob);
        }
      },
      format,
      quality
    );
  });
}

/**
 * Generates an appropriate, safe download filename
 */
export function generateOutputFilename(
  originalName: string,
  targetBytes: number,
  outputFormat: OutputFormat
): string {
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const cleanBase = sanitizeFilename(baseName);

  let ext = "jpg";
  if (outputFormat === "image/webp") ext = "webp";
  else if (outputFormat === "image/png") ext = "png";

  const targetKb = Math.round(targetBytes / 1024);
  return `${cleanBase}-fit-${targetKb}kb.${ext}`;
}

/**
 * Core Bounded Quality Search Compressor Engine
 * Iteratively encodes candidate Blobs and verifies actual byte sizes
 */
export async function compressImageToTarget(
  imageMeta: ImageMeta,
  options: CompressionOptions
): Promise<CompressionResult> {
  const {
    targetBytes,
    outputFormat,
    scalePercent = 100,
    backgroundColor = "#FFFFFF",
    maxIterations = 8,
    onProgress,
  } = options;

  if (targetBytes <= 0) {
    return {
      status: "error",
      originalBytes: imageMeta.sizeBytes,
      outputBytes: 0,
      targetBytes,
      percentReduction: 0,
      originalWidth: imageMeta.width,
      originalHeight: imageMeta.height,
      outputWidth: 0,
      outputHeight: 0,
      outputMimeType: outputFormat,
      qualityUsed: 0,
      iterationsUsed: 0,
      outputBlob: null,
      outputUrl: null,
      filename: imageMeta.name,
      errorMessage: "Target size must be a positive number greater than zero.",
    };
  }

  // 1. Calculate Target Dimensions
  const scaleFactor = Math.max(0.1, Math.min(1.0, scalePercent / 100));
  const targetWidth = Math.max(1, Math.round(imageMeta.width * scaleFactor));
  const targetHeight = Math.max(1, Math.round(imageMeta.height * scaleFactor));

  onProgress?.({
    stage: "analyzing",
    iteration: 0,
    maxIterations,
    currentQuality: 1.0,
    currentBytes: imageMeta.sizeBytes,
    targetBytes,
    message: "Preparing image canvas and analyzing dimensions...",
  });

  // 2. Load Image into Canvas
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image into canvas for processing."));
    img.src = imageMeta.previewUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for image encoding.");
  }

  let warningMessage: string | undefined;

  // Handle transparency flattening if converting to JPEG
  if (outputFormat === "image/jpeg") {
    if (imageMeta.hasAlpha) {
      warningMessage =
        "Original image had transparency, which cannot be saved in JPEG. Alpha channel was flattened against a white background.";
    }
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw scaled image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 3. PNG Format Handling
  // Note: Canvas PNG encoding does not support lossy quality parameter
  if (outputFormat === "image/png") {
    onProgress?.({
      stage: "encoding",
      iteration: 1,
      maxIterations: 1,
      currentQuality: 1.0,
      currentBytes: imageMeta.sizeBytes,
      targetBytes,
      message: "Encoding lossless PNG...",
    });

    const blob = await canvasToBlob(canvas, "image/png", 1.0);
    const sizeBytes = blob.size;
    const isTargetMet = sizeBytes <= targetBytes;
    const outputUrl = URL.createObjectURL(blob);
    const filename = generateOutputFilename(imageMeta.name, targetBytes, "image/png");

    const percentReduction =
      imageMeta.sizeBytes > 0
        ? Math.round(((imageMeta.sizeBytes - sizeBytes) / imageMeta.sizeBytes) * 1000) / 10
        : 0;

    let advice: string | undefined;
    if (!isTargetMet) {
      advice =
        "PNG uses lossless compression and cannot be further compressed with quality controls. To reach your target, consider converting to WebP (which preserves transparency) or scaling dimensions down.";
    }

    onProgress?.({
      stage: "done",
      iteration: 1,
      maxIterations: 1,
      currentQuality: 1.0,
      currentBytes: sizeBytes,
      targetBytes,
      message: isTargetMet ? "Target limit verified!" : "Target limit not met.",
    });

    return {
      status: isTargetMet ? "target_met" : "target_not_met",
      originalBytes: imageMeta.sizeBytes,
      outputBytes: sizeBytes,
      targetBytes,
      percentReduction,
      originalWidth: imageMeta.width,
      originalHeight: imageMeta.height,
      outputWidth: targetWidth,
      outputHeight: targetHeight,
      outputMimeType: "image/png",
      qualityUsed: 1.0,
      iterationsUsed: 1,
      outputBlob: blob,
      outputUrl,
      filename,
      warningMessage,
      advice,
    };
  }

  // 4. Bounded Binary Search on Quality for JPEG & WebP
  let low = 0.05;
  let high = 1.0;
  let iteration = 0;
  let bestCandidate: CandidateResult | null = null;
  let smallestCandidate: CandidateResult | null = null;
  const testedQualities = new Set<number>();

  while (iteration < maxIterations && high >= low) {
    // Midpoint quality rounded to 2 decimal places using low + (high - low) / 2
    const midQuality = Math.round((low + (high - low) / 2) * 100) / 100;

    // Prevent repeated candidate values if bounds converged to same rounded 0.01 step
    if (testedQualities.has(midQuality)) {
      break;
    }
    testedQualities.add(midQuality);
    iteration++;

    onProgress?.({
      stage: "encoding",
      iteration,
      maxIterations,
      currentQuality: midQuality,
      currentBytes: bestCandidate ? bestCandidate.sizeBytes : 0,
      targetBytes,
      message: `Testing quality ${Math.round(midQuality * 100)}% (Attempt ${iteration} of ${maxIterations})...`,
    });

    const candidateBlob = await canvasToBlob(canvas, outputFormat, midQuality);
    const candidateSize = candidateBlob.size;

    // Verify MIME type returned by browser
    const actualMime: string = candidateBlob.type || outputFormat;
    if (actualMime !== outputFormat && outputFormat === "image/webp") {
      warningMessage = `Browser encoder outputted ${actualMime} instead of requested WebP.`;
    }

    const candidate: CandidateResult = {
      quality: midQuality,
      blob: candidateBlob,
      sizeBytes: candidateSize,
      mimeType: actualMime,
      width: targetWidth,
      height: targetHeight,
    };

    // Track the absolute smallest candidate seen in case none meet target
    if (!smallestCandidate || candidateSize < smallestCandidate.sizeBytes) {
      smallestCandidate = candidate;
    }

    if (candidateSize <= targetBytes) {
      // Eligible! Record candidate and explore higher quality to optimize visual fidelity
      if (!bestCandidate || candidate.quality > bestCandidate.quality) {
        bestCandidate = candidate;
      }
      low = Math.round((midQuality + 0.01) * 100) / 100;
    } else {
      // Too large! Search lower quality
      high = Math.round((midQuality - 0.01) * 100) / 100;
    }
  }

  // 5. Final Verification & Selection
  const finalCandidate = bestCandidate || smallestCandidate;

  if (!finalCandidate) {
    throw new Error("Compression failed: No candidate could be generated.");
  }

  const isTargetMet = bestCandidate !== null && bestCandidate.sizeBytes <= targetBytes;
  const outputUrl = URL.createObjectURL(finalCandidate.blob);
  const filename = generateOutputFilename(imageMeta.name, targetBytes, outputFormat);

  const percentReduction =
    imageMeta.sizeBytes > 0
      ? Math.round(((imageMeta.sizeBytes - finalCandidate.sizeBytes) / imageMeta.sizeBytes) * 1000) / 10
      : 0;

  let advice: string | undefined;
  if (!isTargetMet) {
    advice = `Even at the lowest tested quality (${Math.round(finalCandidate.quality * 100)}%), the file size (${Math.round(finalCandidate.sizeBytes / 1024)} KB) exceeds your ${Math.round(targetBytes / 1024)} KB limit. Try scaling dimensions down, or choosing WebP format.`;
  }

  onProgress?.({
    stage: "done",
    iteration,
    maxIterations,
    currentQuality: finalCandidate.quality,
    currentBytes: finalCandidate.sizeBytes,
    targetBytes,
    message: isTargetMet ? "Target limit verified!" : "Target limit not met.",
  });

  return {
    status: isTargetMet ? "target_met" : "target_not_met",
    originalBytes: imageMeta.sizeBytes,
    outputBytes: finalCandidate.sizeBytes,
    targetBytes,
    percentReduction,
    originalWidth: imageMeta.width,
    originalHeight: imageMeta.height,
    outputWidth: targetWidth,
    outputHeight: targetHeight,
    outputMimeType: finalCandidate.mimeType,
    qualityUsed: finalCandidate.quality,
    iterationsUsed: iteration,
    outputBlob: finalCandidate.blob,
    outputUrl,
    filename,
    warningMessage,
    advice,
  };
}
