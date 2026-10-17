"use client";
/* eslint-disable @next/next/no-img-element -- In-memory Blob object URLs are client-generated and cannot be passed to Next.js server-side optimization */

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Maximize2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCcw,
  Sliders,
  X,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Lock,
  Unlock,
  Crop,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";
import {
  PROCESSING_LIMITS,
  RESIZER_DIMENSION_PRESETS,
  RESIZER_SCALE_PRESETS,
} from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import {
  ImageMeta,
  OutputFormat,
  detectAlphaChannel,
} from "@/lib/image-processing/compressor";
import {
  ResizeFitMode,
  CropPosition,
  ResizeResult,
  calculateProportionalDimensions,
  calculateContainDimensions,
  calculateCoverCrop,
  checkUpscaling,
  resizeImage,
} from "@/lib/image-processing/resizer";

export function ImageResizer() {
  const [selectedImage, setSelectedImage] = useState<ImageMeta | null>(null);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<ResizeFitMode>("contain");
  const [cropPosition, setCropPosition] = useState<CropPosition>("center");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState<number>(0.92);
  const [selectedScalePreset, setSelectedScalePreset] = useState<number | null>(null);
  const [selectedDimensionPreset, setSelectedDimensionPreset] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"side-by-side" | "original" | "processed">("side-by-side");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs when unmounting or changing files
  const cleanupUrls = useCallback(() => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    if (result?.outputUrl) {
      URL.revokeObjectURL(result.outputUrl);
    }
  }, [selectedImage, result]);

  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, [cleanupUrls]);

  const handleReset = useCallback(() => {
    cleanupUrls();
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setSelectedScalePreset(null);
    setSelectedDimensionPreset(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [cleanupUrls]);

  const handleFileSelection = useCallback(
    (file: File) => {
      setErrorMessage(null);
      setResult(null);

      // 1. Check format
      if (!PROCESSING_LIMITS.supportedMimeTypes.includes(file.type)) {
        setErrorMessage(
          `Unsupported file format (${file.type || "unknown"}). Supported formats are JPEG, PNG, and WebP.`
        );
        return;
      }

      // 2. Check size ceiling
      if (file.size > PROCESSING_LIMITS.maxFileSizeBytes) {
        setErrorMessage(
          `File size exceeds safety limit of ${PROCESSING_LIMITS.maxFileSizeLabel} (Selected: ${formatBytes(file.size)}).`
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          URL.revokeObjectURL(previewUrl);
          setErrorMessage("Image contains invalid zero dimensions.");
          return;
        }

        if (
          img.naturalWidth > PROCESSING_LIMITS.maxDimensionPx ||
          img.naturalHeight > PROCESSING_LIMITS.maxDimensionPx
        ) {
          URL.revokeObjectURL(previewUrl);
          setErrorMessage(
            `Dimensions (${img.naturalWidth}×${img.naturalHeight}px) exceed safety limit of ${PROCESSING_LIMITS.maxDimensionPx}px.`
          );
          return;
        }

        // Test for transparency
        const testCanvas = document.createElement("canvas");
        testCanvas.width = Math.min(img.naturalWidth, 400);
        testCanvas.height = Math.min(img.naturalHeight, 400);
        const testCtx = testCanvas.getContext("2d");
        let hasAlpha = false;

        if (testCtx) {
          testCtx.drawImage(img, 0, 0, testCanvas.width, testCanvas.height);
          hasAlpha = detectAlphaChannel(testCtx, testCanvas.width, testCanvas.height);
        }

        // Default format: if PNG with alpha, suggest WebP (retains alpha + lossy quality) or PNG
        const defaultFormat: OutputFormat =
          file.type === "image/png" && hasAlpha ? "image/webp" : (file.type as OutputFormat);

        setOutputFormat(defaultFormat);
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
        setMaintainAspectRatio(true);
        setFitMode("contain");
        setSelectedScalePreset(1.0);
        setSelectedDimensionPreset(null);

        setSelectedImage({
          file,
          name: file.name,
          sizeBytes: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          type: file.type,
          hasAlpha,
          previewUrl,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(previewUrl);
        setErrorMessage("Failed to decode image. The file may be corrupt or not a valid image.");
      };

      img.src = previewUrl;
    },
    []
  );

  // Width input handler
  const handleWidthChange = (valStr: string) => {
    setSelectedScalePreset(null);
    setSelectedDimensionPreset(null);
    const parsed = parseInt(valStr, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setTargetWidth(0);
      return;
    }

    setTargetWidth(parsed);

    if (maintainAspectRatio && selectedImage) {
      const prop = calculateProportionalDimensions(selectedImage.width, selectedImage.height, {
        newWidth: parsed,
      });
      setTargetHeight(prop.height);
    }
  };

  // Height input handler
  const handleHeightChange = (valStr: string) => {
    setSelectedScalePreset(null);
    setSelectedDimensionPreset(null);
    const parsed = parseInt(valStr, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setTargetHeight(0);
      return;
    }

    setTargetHeight(parsed);

    if (maintainAspectRatio && selectedImage) {
      const prop = calculateProportionalDimensions(selectedImage.width, selectedImage.height, {
        newHeight: parsed,
      });
      setTargetWidth(prop.width);
    }
  };

  // Toggle Aspect Ratio Lock
  const toggleRatioLock = () => {
    const nextLocked = !maintainAspectRatio;
    setMaintainAspectRatio(nextLocked);
    setSelectedScalePreset(null);

    // If re-locking, re-sync height to current width
    if (nextLocked && selectedImage && targetWidth > 0) {
      const prop = calculateProportionalDimensions(selectedImage.width, selectedImage.height, {
        newWidth: targetWidth,
      });
      setTargetHeight(prop.height);
    }
  };

  // Percentage scale preset handler
  const handleScalePresetSelect = (factor: number) => {
    if (!selectedImage) return;
    setSelectedScalePreset(factor);
    setSelectedDimensionPreset(null);
    setMaintainAspectRatio(true);

    const w = Math.max(1, Math.round(selectedImage.width * factor));
    const h = Math.max(1, Math.round(selectedImage.height * factor));
    setTargetWidth(w);
    setTargetHeight(h);
  };

  // Dimension preset handler
  const handleDimensionPresetSelect = (preset: { label: string; width: number; height: number }) => {
    if (!selectedImage) return;
    setSelectedDimensionPreset(preset.label);
    setSelectedScalePreset(null);

    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
  };

  // Execute Resize
  const handleRunResize = async () => {
    if (!selectedImage) return;

    if (targetWidth <= 0 || targetHeight <= 0) {
      setErrorMessage("Width and height must be positive numbers greater than zero.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await resizeImage(selectedImage, {
        targetWidth,
        targetHeight,
        fitMode,
        maintainAspectRatio,
        outputFormat,
        quality,
        cropPosition,
      });

      if (res.status === "error") {
        setErrorMessage(res.errorMessage || "Resizing failed.");
      } else {
        setResult(res);
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "Resizing failed unexpectedly.";
      setErrorMessage(errText);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Output
  const handleDownload = () => {
    if (!result || !result.outputBlob || !result.outputUrl) return;

    const a = document.createElement("a");
    a.href = result.outputUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Calculated preview metrics
  const upscaleInfo = selectedImage && targetWidth > 0 && targetHeight > 0
    ? checkUpscaling(selectedImage.width, selectedImage.height, targetWidth, targetHeight)
    : { isUpscaled: false, upscaleFactor: 1 };

  const containPreview = selectedImage && targetWidth > 0 && targetHeight > 0
    ? calculateContainDimensions(selectedImage.width, selectedImage.height, targetWidth, targetHeight)
    : null;

  const coverCropPreview = selectedImage && targetWidth > 0 && targetHeight > 0
    ? calculateCoverCrop(selectedImage.width, selectedImage.height, targetWidth, targetHeight, cropPosition)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* 1. File Upload / Selection Stage */}
      {!selectedImage ? (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload an image to resize"
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-cobalt/20 ${
            isDragOver
              ? "border-cobalt bg-cobalt/5 scale-[0.99] shadow-inner"
              : "border-border hover:border-cobalt/60 hover:bg-white/60 bg-white shadow-card"
          }`}
        >
          <CropCorners size={20} color="text-cobalt" />

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center shadow-sm">
              <UploadCloud className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <p className="text-lg font-heading font-bold text-ink">
                Choose an image or drag & drop here
              </p>
              <p className="text-sm text-slate">
                Supports JPEG, PNG, and WebP up to {PROCESSING_LIMITS.maxFileSizeLabel}.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cloud text-xs font-semibold text-slate border border-border">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Aspect Ratio Lock
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cloud text-xs font-semibold text-slate border border-border">
                <Crop className="w-3.5 h-3.5 text-cobalt" /> Fit or Crop
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cloud text-xs font-semibold text-slate border border-border">
                <ShieldCheck className="w-3.5 h-3.5 text-cobalt" /> 100% In-Browser
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Resizer Configuration Workspace */
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-cloud border border-border flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={selectedImage.previewUrl}
                  alt={selectedImage.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-ink text-sm sm:text-base truncate max-w-[200px] sm:max-w-xs">
                    {selectedImage.name}
                  </h3>
                  {selectedImage.hasAlpha && (
                    <span className="px-2 py-0.5 rounded-md bg-cobalt/10 text-cobalt text-[10px] font-semibold uppercase tracking-wider">
                      Alpha
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate">
                  Original: {selectedImage.width}×{selectedImage.height}px • {formatBytes(selectedImage.sizeBytes)} • {selectedImage.type.replace("image/", "").toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-slate hover:text-ink hover:bg-cloud transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change Image</span>
              </button>
            </div>
          </div>

          {/* Configuration Form Card */}
          <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6 relative">
            <CropCorners size={18} color="text-cobalt" />

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-heading font-bold text-ink flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cobalt" />
                  Dimension & Format Settings
                </h2>
                <p className="text-xs text-slate">
                  Enter target dimensions or pick a preset. Aspect ratio lock preserves original proportions.
                </p>
              </div>
            </div>

            {/* Scale Presets Row */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Quick Scale
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {RESIZER_SCALE_PRESETS.map((preset) => {
                  const isSelected = selectedScalePreset === preset.factor;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleScalePresetSelect(preset.factor)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? "border-cobalt bg-cobalt text-white shadow-sm"
                          : "border-border bg-cloud/50 hover:bg-cloud text-ink"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Pixel Dimensions with Ratio Lock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Target Dimensions (Pixels)
                </label>
                <button
                  type="button"
                  onClick={toggleRatioLock}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    maintainAspectRatio
                      ? "bg-cobalt/10 text-cobalt hover:bg-cobalt/20"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                  title={
                    maintainAspectRatio
                      ? "Aspect ratio is locked: width and height scale together."
                      : "Aspect ratio is unlocked: width and height can change independently."
                  }
                >
                  {maintainAspectRatio ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Ratio Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Ratio Unlocked</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate">
                    <span>Width</span>
                    <span>px</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={PROCESSING_LIMITS.maxDimensionPx}
                    value={targetWidth || ""}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt/40 focus:border-cobalt bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate">
                    <span>Height</span>
                    <span>px</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={PROCESSING_LIMITS.maxDimensionPx}
                    value={targetHeight || ""}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt/40 focus:border-cobalt bg-white"
                  />
                </div>
              </div>

              {/* Warning when Ratio is Unlocked */}
              {!maintainAspectRatio && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Ratio Unlocked:</strong> Modifying width and height independently can stretch or distort image proportions. Choose <em>Crop (Cover)</em> below to fill exact dimensions without distortion.
                  </p>
                </div>
              )}

              {/* Warning when Upscaling */}
              {upscaleInfo.isUpscaled && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <Info className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                  <p>
                    <strong>Upscaling Notice:</strong> Requested size exceeds original resolution ({selectedImage.width}×{selectedImage.height}px). Output will be scaled by {upscaleInfo.upscaleFactor}×, which may introduce softness.
                  </p>
                </div>
              )}
            </div>

            {/* Standard Dimension Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Common Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RESIZER_DIMENSION_PRESETS.map((p) => {
                  const isSelected = selectedDimensionPreset === p.label;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleDimensionPresetSelect(p)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-cobalt bg-cobalt/10 shadow-sm"
                          : "border-border bg-cloud/30 hover:bg-cloud"
                      }`}
                    >
                      <div className="text-xs font-semibold text-ink">{p.label}</div>
                      <div className="text-[11px] text-slate">{p.category}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fit / Crop Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Fit & Crop Behavior
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFitMode("contain")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    fitMode === "contain"
                      ? "border-cobalt bg-cobalt/5 ring-2 ring-cobalt/30"
                      : "border-border bg-white hover:bg-cloud/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-ink mb-1">
                    <Maximize2 className="w-4 h-4 text-cobalt" />
                    <span>Fit (Contain)</span>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Preserves the entire original image without cropping. Output fits within the requested bounds.
                  </p>
                  {containPreview && (
                    <div className="mt-2 text-[11px] font-mono font-medium text-cobalt">
                      Result: {containPreview.width}×{containPreview.height}px
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFitMode("cover")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    fitMode === "cover"
                      ? "border-cobalt bg-cobalt/5 ring-2 ring-cobalt/30"
                      : "border-border bg-white hover:bg-cloud/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-ink mb-1">
                    <Crop className="w-4 h-4 text-cobalt" />
                    <span>Crop (Cover)</span>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Fills the exact requested dimensions. Scales proportionally and crops excess edges.
                  </p>
                  {coverCropPreview && (
                    <div className="mt-2 text-[11px] font-mono font-medium text-cobalt">
                      Exact: {coverCropPreview.targetWidth}×{coverCropPreview.targetHeight}px
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFitMode("stretch")}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    fitMode === "stretch"
                      ? "border-cobalt bg-cobalt/5 ring-2 ring-cobalt/30"
                      : "border-border bg-white hover:bg-cloud/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-ink mb-1">
                    <Layers className="w-4 h-4 text-cobalt" />
                    <span>Stretch</span>
                  </div>
                  <p className="text-xs text-slate leading-relaxed">
                    Forces dimensions directly to the requested values. May distort image proportions.
                  </p>
                  <div className="mt-2 text-[11px] font-mono font-medium text-slate">
                    Exact: {targetWidth}×{targetHeight}px
                  </div>
                </button>
              </div>
            </div>

            {/* Crop Alignment Options (Shown only in cover mode) */}
            {fitMode === "cover" && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-cloud/50 border border-border">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Crop Position Alignment
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["center", "top", "bottom", "left", "right"] as CropPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setCropPosition(pos)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        cropPosition === pos
                          ? "border-cobalt bg-cobalt text-white shadow-sm"
                          : "border-border bg-white text-slate hover:text-ink hover:bg-cloud"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate">
                  Controls which portion of the image is kept when cropping excess dimensions.
                </p>
              </div>
            )}

            {/* Output Format & Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["image/jpeg", "image/webp", "image/png"] as OutputFormat[]).map((fmt) => {
                    const label = fmt === "image/jpeg" ? "JPEG" : fmt === "image/webp" ? "WebP" : "PNG";
                    const isSelected = outputFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setOutputFormat(fmt)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? "border-cobalt bg-cobalt text-white shadow-sm"
                            : "border-border bg-cloud/50 hover:bg-cloud text-ink"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider">
                    Visual Quality
                  </label>
                  <span className="text-xs font-mono font-semibold text-cobalt">
                    {outputFormat === "image/png" ? "Lossless (100%)" : `${Math.round(quality * 100)}%`}
                  </span>
                </div>
                {outputFormat === "image/png" ? (
                  <div className="text-xs text-slate p-2 rounded-xl bg-cloud border border-border">
                    PNG uses lossless compression. High fidelity output.
                  </div>
                ) : (
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={Math.round(quality * 100)}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                    className="w-full accent-cobalt cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Transparency Note */}
            {selectedImage.hasAlpha && outputFormat === "image/jpeg" && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Transparency Notice:</strong> Original image contains transparent areas. JPEG does not support transparency, so the background will be flattened to white. To preserve transparency, select <strong>WebP</strong> or <strong>PNG</strong>.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
              <div className="text-xs text-slate flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Processed 100% locally in your browser canvas</span>
              </div>

              <button
                type="button"
                onClick={handleRunResize}
                disabled={isProcessing || targetWidth <= 0 || targetHeight <= 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-white font-heading font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resizing Image...</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Resize Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Result Inspection & Download Workspace */}
          {result && (
            <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6 relative animate-fadeIn">
              <CropCorners size={18} color="text-success" />

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resize Complete</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink">
                    Generated Output Preview
                  </h3>
                </div>

                {/* View Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-cloud border border-border text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("side-by-side")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === "side-by-side"
                        ? "bg-white text-ink shadow-sm"
                        : "text-slate hover:text-ink"
                    }`}
                  >
                    Side by Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("processed")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === "processed"
                        ? "bg-white text-ink shadow-sm"
                        : "text-slate hover:text-ink"
                    }`}
                  >
                    Processed
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("original")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === "original"
                        ? "bg-white text-ink shadow-sm"
                        : "text-slate hover:text-ink"
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Warnings / Advice */}
              {result.warningMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <Info className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                  <p>{result.warningMessage}</p>
                </div>
              )}

              {result.advice && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cloud border border-border text-slate text-xs">
                  <HelpCircle className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                  <p>{result.advice}</p>
                </div>
              )}

              {/* Visual Preview Container */}
              <div className="relative rounded-2xl bg-cloud/50 border border-border p-4 overflow-hidden">
                {activeTab === "side-by-side" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate font-medium">
                        <span>Original</span>
                        <span>{result.originalWidth}×{result.originalHeight}px • {formatBytes(result.originalBytes)}</span>
                      </div>
                      <div className="aspect-[4/3] rounded-xl bg-white border border-border flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={selectedImage.previewUrl}
                          alt="Original preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Resized Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-cobalt font-semibold">
                        <span>Resized Output</span>
                        <span>{result.outputWidth}×{result.outputHeight}px • {formatBytes(result.outputBytes)}</span>
                      </div>
                      <div className="aspect-[4/3] rounded-xl bg-white border border-border flex items-center justify-center p-2 overflow-hidden">
                        {result.outputUrl && (
                          <img
                            src={result.outputUrl}
                            alt="Resized output preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "processed" && result.outputUrl && (
                  <div className="space-y-2 text-center">
                    <div className="text-xs text-slate">
                      Output: {result.outputWidth}×{result.outputHeight}px ({formatBytes(result.outputBytes)})
                    </div>
                    <div className="max-h-[480px] rounded-xl bg-white border border-border flex items-center justify-center p-4 overflow-hidden">
                      <img
                        src={result.outputUrl}
                        alt="Resized output preview"
                        className="max-h-[400px] max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "original" && (
                  <div className="space-y-2 text-center">
                    <div className="text-xs text-slate">
                      Original: {result.originalWidth}×{result.originalHeight}px ({formatBytes(result.originalBytes)})
                    </div>
                    <div className="max-h-[480px] rounded-xl bg-white border border-border flex items-center justify-center p-4 overflow-hidden">
                      <img
                        src={selectedImage.previewUrl}
                        alt="Original preview"
                        className="max-h-[400px] max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Output Stats Summary Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Output Dimensions</div>
                  <div className="text-sm font-bold font-mono text-ink mt-0.5">
                    {result.outputWidth}×{result.outputHeight}px
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Output File Size</div>
                  <div className="text-sm font-bold font-mono text-ink mt-0.5">
                    {formatBytes(result.outputBytes)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Output Format</div>
                  <div className="text-sm font-bold font-mono text-ink mt-0.5 uppercase">
                    {result.outputMimeType.replace("image/", "")}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Fit Mode Used</div>
                  <div className="text-sm font-bold font-mono text-ink mt-0.5 capitalize">
                    {result.fitModeUsed}
                  </div>
                </div>
              </div>

              {/* Download Bar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-slate hover:text-ink hover:bg-cloud transition-colors"
                >
                  Resize Another Image
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-white font-heading font-bold text-sm shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resized Image</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
