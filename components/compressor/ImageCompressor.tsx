"use client";
/* eslint-disable @next/next/no-img-element -- Client-side in-memory Blob object URLs cannot be passed to Next.js server-side image optimization */

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCcw,
  Sliders,
  Maximize2,
  X,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";
import { COMPRESSOR_PRESETS, PROCESSING_LIMITS } from "@/lib/constants";
import { formatBytes, sanitizeFilename } from "@/lib/utils";
import {
  ImageMeta,
  OutputFormat,
  CompressionResult,
  CompressionProgress,
  compressImageToTarget,
  detectAlphaChannel,
} from "@/lib/image-processing/compressor";

export function ImageCompressor() {
  const [selectedImage, setSelectedImage] = useState<ImageMeta | null>(null);
  const [targetBytes, setTargetBytes] = useState<number>(100 * 1024); // 100 KB default
  const [customValue, setCustomValue] = useState<string>("100");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(100 * 1024);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
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
    setProgress(null);
    setErrorMessage(null);
    setIsProcessing(false);
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
          `File size exceeds limit of ${PROCESSING_LIMITS.maxFileSizeLabel} (Selected: ${formatBytes(file.size)}).`
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

        // Test for transparency on a small temporary canvas
        const testCanvas = document.createElement("canvas");
        testCanvas.width = Math.min(img.naturalWidth, 400);
        testCanvas.height = Math.min(img.naturalHeight, 400);
        const testCtx = testCanvas.getContext("2d");
        let hasAlpha = false;

        if (testCtx) {
          testCtx.drawImage(img, 0, 0, testCanvas.width, testCanvas.height);
          hasAlpha = detectAlphaChannel(testCtx, testCanvas.width, testCanvas.height);
        }

        // Default output format: if source has alpha, suggest WebP (retains alpha + lossy quality) or PNG
        const defaultFormat: OutputFormat =
          file.type === "image/png" && hasAlpha ? "image/webp" : (file.type as OutputFormat);

        setOutputFormat(defaultFormat);

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

  const handleCustomTargetChange = (val: string, unit: "KB" | "MB") => {
    setCustomValue(val);
    setSelectedPreset(null);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      const multiplier = unit === "MB" ? 1024 * 1024 : 1024;
      setTargetBytes(Math.round(parsed * multiplier));
      setErrorMessage(null);
    } else {
      setErrorMessage("Please enter a valid positive number for target size.");
    }
  };

  const handlePresetSelect = (bytes: number) => {
    setSelectedPreset(bytes);
    setTargetBytes(bytes);
    if (bytes >= 1024 * 1024) {
      setCustomValue((bytes / (1024 * 1024)).toString());
      setCustomUnit("MB");
    } else {
      setCustomValue((bytes / 1024).toString());
      setCustomUnit("KB");
    }
    setErrorMessage(null);
  };

  const handleRunCompression = async () => {
    if (!selectedImage) return;

    if (targetBytes <= 0) {
      setErrorMessage("Please specify a target size greater than zero.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const compResult = await compressImageToTarget(selectedImage, {
        targetBytes,
        outputFormat,
        scalePercent,
        maxIterations: 8,
        onProgress: (prog) => setProgress(prog),
      });

      setResult(compResult);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "Compression failed unexpectedly.";
      setErrorMessage(errText);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !result.outputBlob || !result.outputUrl) return;

    const a = document.createElement("a");
    a.href = result.outputUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
          role="button"
          tabIndex={0}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-14 text-center bg-white shadow-card hover:shadow-elevated transition-all group focus-within:ring-2 focus-within:ring-cobalt ${
            isDragOver
              ? "border-cobalt bg-cobalt/5 scale-[1.01]"
              : "border-border-strong hover:border-cobalt/60 hover:bg-cloud/50"
          }`}
          aria-label="Upload image to compress"
        >
          <CropCorners size={16} color={isDragOver ? "text-cobalt" : "text-border-strong group-hover:text-cobalt"} />

          <input
            ref={fileInputRef}
            type="file"
            accept={PROCESSING_LIMITS.supportedExtensions.join(",")}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
            }}
            className="sr-only"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-heading font-bold text-ink">
                Select or drop an image to compress
              </p>
              <p className="text-sm text-slate">
                Supports JPEG, PNG, and WebP up to {PROCESSING_LIMITS.maxFileSizeLabel}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cloud font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Strict byte measurement
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cloud font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> Local Browser Processing (No Uploads)
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Loaded Image Workspace & Compression Controls */
        <div className="space-y-6">
          {/* Top Info Bar */}
          <div className="relative rounded-2xl bg-white border border-border p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CropCorners size={12} color="text-cobalt/40" />
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-cloud border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img
                  src={selectedImage.previewUrl}
                  alt="Original thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-ink text-base truncate max-w-xs sm:max-w-md">
                  {selectedImage.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate tabular-nums mt-0.5">
                  <span className="font-semibold text-ink">{formatBytes(selectedImage.sizeBytes)}</span>
                  <span>•</span>
                  <span>
                    {selectedImage.width}×{selectedImage.height}px
                  </span>
                  <span>•</span>
                  <span className="uppercase font-medium text-slate">
                    {selectedImage.type.replace("image/", "")}
                  </span>
                  {selectedImage.hasAlpha && (
                    <span className="px-1.5 py-0.2 rounded bg-info-light text-info font-bold text-[10px]">
                      Alpha
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate hover:text-error hover:bg-error-light transition-colors self-end sm:self-center focus:outline-none focus-visible:ring-2 focus-visible:ring-error disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change Image</span>
            </button>
          </div>

          {/* Configuration Panel */}
          <div className="relative rounded-2xl bg-white border border-border p-6 shadow-card space-y-6">
            <CropCorners size={14} color="text-cobalt" />

            {/* Target Size Presets & Custom Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-ink font-heading flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cobalt" />
                  <span>Choose Target File Size Limit</span>
                </label>
                <span className="text-xs font-bold text-cobalt tabular-nums">
                  Target: {formatBytes(targetBytes)}
                </span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {COMPRESSOR_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.valueBytes;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handlePresetSelect(preset.valueBytes)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold tabular-nums transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? "border-cobalt bg-cobalt text-white shadow-sm"
                          : "border-border bg-cloud text-ink hover:border-cobalt/50 hover:bg-white"
                      }`}
                    >
                      <span className="text-sm">{preset.label}</span>
                      <span
                        className={`text-[10px] font-normal ${
                          isSelected ? "text-white/80" : "text-slate"
                        }`}
                      >
                        {preset.valueBytes >= 1024 * 1024
                          ? `${preset.valueBytes / (1024 * 1024)} MB`
                          : `${preset.valueBytes / 1024} KB`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Target Input */}
              <div className="pt-2 flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    disabled={isProcessing}
                    value={customValue}
                    onChange={(e) => handleCustomTargetChange(e.target.value, customUnit)}
                    placeholder="Enter custom size limit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-cloud text-ink text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-colors"
                    aria-label="Custom target size"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate">
                    Custom Target
                  </span>
                </div>

                <div className="flex rounded-xl border border-border overflow-hidden bg-cloud p-0.5">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setCustomUnit("KB");
                      handleCustomTargetChange(customValue, "KB");
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      customUnit === "KB" ? "bg-white text-cobalt shadow-sm" : "text-slate hover:text-ink"
                    }`}
                  >
                    KB
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setCustomUnit("MB");
                      handleCustomTargetChange(customValue, "MB");
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      customUnit === "MB" ? "bg-white text-cobalt shadow-sm" : "text-slate hover:text-ink"
                    }`}
                  >
                    MB
                  </button>
                </div>
              </div>
            </div>

            {/* Output Format & Dimension Scaling Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-border">
              {/* Format selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-ink font-heading block">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["image/jpeg", "image/webp", "image/png"] as OutputFormat[]).map((fmt) => {
                    const isSelected = outputFormat === fmt;
                    const label = fmt === "image/jpeg" ? "JPEG" : fmt === "image/webp" ? "WebP" : "PNG";
                    return (
                      <button
                        key={fmt}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setOutputFormat(fmt)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          isSelected
                            ? "border-cobalt bg-cobalt/10 text-cobalt font-extrabold"
                            : "border-border bg-cloud text-ink hover:border-slate/40"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {outputFormat === "image/jpeg" && selectedImage.hasAlpha && (
                  <p className="text-[11px] text-warning flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>JPEG has no alpha; transparency will flatten to white.</span>
                  </p>
                )}
                {outputFormat === "image/png" && (
                  <p className="text-[11px] text-slate mt-1">
                    Canvas PNG encoding is lossless and does not support lossy quality reduction.
                  </p>
                )}
              </div>

              {/* Dimension scaling optional override */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink font-heading flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate" />
                    <span>Dimension Scale</span>
                  </label>
                  <span className="text-xs font-bold text-slate tabular-nums">
                    {Math.round(selectedImage.width * (scalePercent / 100))}×
                    {Math.round(selectedImage.height * (scalePercent / 100))}px
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 75, 50, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setScalePercent(pct)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold tabular-nums transition-all text-center ${
                        scalePercent === pct
                          ? "border-cobalt bg-cobalt/10 text-cobalt font-extrabold"
                          : "border-border bg-cloud text-ink hover:border-slate/40"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate mt-1">
                  Downscaling pixels makes aggressive targets attainable with higher sharpness.
                </p>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRunCompression}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white font-heading font-bold text-base transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt disabled:opacity-50"
              >
                <FileCheck className="w-5 h-5 stroke-[2.2]" />
                <span>
                  {isProcessing
                    ? "Testing Candidate Encodings..."
                    : `Compress Image to ${formatBytes(targetBytes)}`}
                </span>
              </button>
            </div>

            {/* Live Progress State */}
            {isProcessing && progress && (
              <div className="p-4 rounded-xl border border-cobalt/30 bg-cobalt/5 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cobalt flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cobalt animate-ping" />
                    {progress.message}
                  </span>
                  <span className="tabular-nums font-semibold text-slate">
                    Iteration {progress.iteration} of {progress.maxIterations}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-cobalt transition-all duration-200"
                    style={{
                      width: `${Math.round((progress.iteration / progress.maxIterations) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl border border-error/30 bg-error-light text-error flex items-start gap-3 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-bold">Compression Alert</p>
                <p className="text-error/90 mt-0.5">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 rounded text-error/70 hover:text-error"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3. Output Verification & Result Experience */}
          {result && (
            <div className="relative rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-elevated space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <CropCorners size={16} color={result.status === "target_met" ? "text-success" : "text-warning"} />

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      result.status === "target_met"
                        ? "bg-success-light text-success"
                        : "bg-warning-light text-warning"
                    }`}
                  >
                    {result.status === "target_met" ? (
                      <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-lg text-ink">
                        {result.status === "target_met" ? "Target Limit Met" : "Target Limit Not Met"}
                      </h3>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          result.status === "target_met"
                            ? "bg-success text-white"
                            : "bg-warning text-white"
                        }`}
                      >
                        {result.status === "target_met" ? "Verified" : "Exceeded"}
                      </span>
                    </div>
                    <p className="text-xs text-slate mt-0.5">
                      {result.status === "target_met"
                        ? `Actual encoded Blob (${formatBytes(result.outputBytes)}) is under the requested ${formatBytes(result.targetBytes)} limit.`
                        : `Smallest achievable candidate (${formatBytes(result.outputBytes)}) exceeds your ${formatBytes(result.targetBytes)} target.`}
                    </p>
                  </div>
                </div>

                {/* Primary Download Button */}
                {result.outputBlob && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-sm font-heading font-bold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                  >
                    <Download className="w-4 h-4 stroke-[2.2]" />
                    <span>Download {formatBytes(result.outputBytes)}</span>
                  </button>
                )}
              </div>

              {/* Advice Box for Unmet Targets */}
              {result.status === "target_not_met" && result.advice && (
                <div className="p-4 rounded-xl border border-warning/30 bg-warning-light text-ink text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-warning font-heading">
                    <HelpCircle className="w-4 h-4" />
                    <span>Recommendation to Reach Target:</span>
                  </div>
                  <p className="text-slate leading-relaxed">{result.advice}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {scalePercent === 100 && (
                      <button
                        type="button"
                        onClick={() => {
                          setScalePercent(75);
                          handleRunCompression();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-bold text-ink hover:border-cobalt transition-colors"
                      >
                        Try scaling to 75%
                      </button>
                    )}
                    {outputFormat !== "image/webp" && (
                      <button
                        type="button"
                        onClick={() => {
                          setOutputFormat("image/webp");
                          handleRunCompression();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-bold text-ink hover:border-cobalt transition-colors"
                      >
                        Switch to WebP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cloud rounded-xl p-4 border border-border">
                <div>
                  <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">Output Size</p>
                  <p className="text-lg font-bold text-ink tabular-nums mt-0.5">
                    {formatBytes(result.outputBytes)}
                  </p>
                  <span className="text-[11px] text-slate tabular-nums">
                    Target: {formatBytes(result.targetBytes)}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">Reduction</p>
                  <p className="text-lg font-bold text-success tabular-nums mt-0.5">
                    {result.percentReduction}%
                  </p>
                  <span className="text-[11px] text-slate tabular-nums">
                    Saved {formatBytes(Math.max(0, result.originalBytes - result.outputBytes))}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">Dimensions</p>
                  <p className="text-lg font-bold text-ink tabular-nums mt-0.5">
                    {result.outputWidth}×{result.outputHeight}
                  </p>
                  <span className="text-[11px] text-slate">
                    Orig: {result.originalWidth}×{result.originalHeight}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">Quality Used</p>
                  <p className="text-lg font-bold text-ink tabular-nums mt-0.5">
                    {Math.round(result.qualityUsed * 100)}%
                  </p>
                  <span className="text-[11px] text-slate">
                    {result.iterationsUsed} test iterations
                  </span>
                </div>
              </div>

              {/* Before / After Preview Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink font-heading">
                    Visual Quality Inspection
                  </h4>
                  <div className="flex rounded-lg border border-border overflow-hidden bg-cloud p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTab("side-by-side")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeTab === "side-by-side" ? "bg-white text-cobalt shadow-xs" : "text-slate"
                      }`}
                    >
                      Side by Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("original")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeTab === "original" ? "bg-white text-cobalt shadow-xs" : "text-slate"
                      }`}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("processed")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeTab === "processed" ? "bg-white text-cobalt shadow-xs" : "text-slate"
                      }`}
                    >
                      Compressed
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-cloud p-3 sm:p-4 min-h-[220px] flex items-center justify-center">
                  {activeTab === "side-by-side" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className="space-y-1.5 text-center">
                        <span className="text-[11px] font-bold text-slate uppercase tracking-wider">
                          Original ({formatBytes(result.originalBytes)})
                        </span>
                        <div className="h-56 bg-white rounded-lg border border-border overflow-hidden flex items-center justify-center p-2">
                          <img
                            src={selectedImage.previewUrl}
                            alt="Original"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 text-center">
                        <span className="text-[11px] font-bold text-cobalt uppercase tracking-wider">
                          Compressed ({formatBytes(result.outputBytes)})
                        </span>
                        <div className="h-56 bg-white rounded-lg border border-border overflow-hidden flex items-center justify-center p-2">
                          {result.outputUrl && (
                            <img
                              src={result.outputUrl}
                              alt="Compressed result"
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "original" && (
                    <div className="text-center space-y-2 max-w-lg">
                      <span className="text-xs font-bold text-slate">
                        Original ({formatBytes(result.originalBytes)} • {result.originalWidth}×{result.originalHeight}px)
                      </span>
                      <div className="h-80 bg-white rounded-lg border border-border overflow-hidden flex items-center justify-center p-2">
                        <img
                          src={selectedImage.previewUrl}
                          alt="Original view"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "processed" && (
                    <div className="text-center space-y-2 max-w-lg">
                      <span className="text-xs font-bold text-cobalt">
                        Compressed Result ({formatBytes(result.outputBytes)} • {result.outputWidth}×{result.outputHeight}px)
                      </span>
                      <div className="h-80 bg-white rounded-lg border border-border overflow-hidden flex items-center justify-center p-2">
                        {result.outputUrl && (
                          <img
                            src={result.outputUrl}
                            alt="Compressed result view"
                            className="max-h-full max-w-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
