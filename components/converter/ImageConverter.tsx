"use client";
/* eslint-disable @next/next/no-img-element -- In-memory Blob object URLs are client-generated and cannot be passed to Next.js server-side optimization */

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  Palette,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";
import {
  PROCESSING_LIMITS,
  CONVERTER_FORMATS,
  JPEG_BACKGROUND_PRESETS,
} from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import {
  ImageMeta,
  OutputFormat,
  detectAlphaChannel,
} from "@/lib/image-processing/compressor";
import {
  ConvertFormat,
  ConverterResult,
  validateInputFormat,
  convertImage,
} from "@/lib/image-processing/converter";

export function ImageConverter() {
  const [selectedImage, setSelectedImage] = useState<ImageMeta | null>(null);
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>("image/webp");
  const [quality, setQuality] = useState<number>(0.92);
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");
  const [customHex, setCustomHex] = useState<string>("#FFFFFF");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConverterResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"side-by-side" | "original" | "processed">("side-by-side");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeConversionIdRef = useRef<number>(0);

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
    activeConversionIdRef.current++;
    cleanupUrls();
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [cleanupUrls]);

  const handleFileSelection = useCallback(
    (file: File) => {
      activeConversionIdRef.current++;
      setErrorMessage(null);
      setResult(null);

      // 1. Format validation
      const validation = validateInputFormat(file.type, file.name);
      if (!validation.isSupported) {
        setErrorMessage(validation.reason || `Unsupported format (${file.type || "unknown"}).`);
        return;
      }

      // 2. File size ceiling check
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

        // Smart default destination format:
        // If PNG with alpha -> default to WebP (keeps alpha + small file)
        // If JPEG -> default to WebP
        // If WebP -> default to PNG or JPEG
        let defaultTarget: ConvertFormat = "image/webp";
        if (file.type === "image/webp") {
          defaultTarget = hasAlpha ? "image/png" : "image/jpeg";
        } else if (file.type === "image/png" && hasAlpha) {
          defaultTarget = "image/webp";
        } else if (file.type === "image/jpeg") {
          defaultTarget = "image/webp";
        }

        setTargetFormat(defaultTarget);

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

  // Background color selection
  const handleBgSelect = (hex: string) => {
    setBackgroundColor(hex);
    setCustomHex(hex);
  };

  const handleCustomHexChange = (val: string) => {
    setCustomHex(val);
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) {
      setBackgroundColor(val);
    }
  };

  // Execute Conversion
  const handleRunConversion = async () => {
    if (!selectedImage) return;

    const conversionId = ++activeConversionIdRef.current;
    setIsProcessing(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await convertImage(selectedImage, {
        targetFormat,
        quality,
        backgroundColor,
      });

      // Ignore stale async conversion if user replaced file or initiated new conversion
      if (conversionId !== activeConversionIdRef.current) {
        if (res.outputUrl) URL.revokeObjectURL(res.outputUrl);
        return;
      }

      if (res.status === "error") {
        setErrorMessage(res.errorMessage || "Conversion failed.");
      } else {
        setResult(res);
      }
    } catch (err: unknown) {
      if (conversionId === activeConversionIdRef.current) {
        const errText = err instanceof Error ? err.message : "Conversion failed unexpectedly.";
        setErrorMessage(errText);
      }
    } finally {
      if (conversionId === activeConversionIdRef.current) {
        setIsProcessing(false);
      }
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

  const selectedFormatConfig = CONVERTER_FORMATS.find((f) => f.mime === targetFormat);

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
          aria-label="Upload an image to convert"
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
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Verified Output MIME
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cloud text-xs font-semibold text-slate border border-border">
                <Palette className="w-3.5 h-3.5 text-cobalt" /> Alpha Transparency Options
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cloud text-xs font-semibold text-slate border border-border">
                <ShieldCheck className="w-3.5 h-3.5 text-cobalt" /> 100% In-Browser
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Converter Configuration Workspace */
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-12 h-12 rounded-xl bg-cloud border border-border flex items-center justify-center overflow-hidden shrink-0"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                }}
              >
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
                  {selectedImage.hasAlpha ? (
                    <span className="px-2 py-0.5 rounded-md bg-cobalt/10 text-cobalt text-[10px] font-semibold uppercase tracking-wider">
                      Alpha Transparent
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-cloud text-slate text-[10px] font-semibold uppercase tracking-wider border border-border">
                      Opaque
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate">
                  Current: {selectedImage.type.replace("image/", "").toUpperCase()} • {selectedImage.width}×{selectedImage.height}px • {formatBytes(selectedImage.sizeBytes)}
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
                  <RefreshCw className="w-4 h-4 text-cobalt" />
                  Select Destination Format & Options
                </h2>
                <p className="text-xs text-slate">
                  Choose your target format. Quality and background controls adapt based on the selected destination.
                </p>
              </div>
            </div>

            {/* Target Format Selector Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Target Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONVERTER_FORMATS.map((fmt) => {
                  const isSelected = targetFormat === fmt.mime;
                  const isSourceFormat = selectedImage.type === fmt.mime;
                  return (
                    <button
                      key={fmt.mime}
                      type="button"
                      onClick={() => setTargetFormat(fmt.mime)}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? "border-cobalt bg-cobalt/5 ring-2 ring-cobalt/30 shadow-sm"
                          : "border-border bg-white hover:bg-cloud/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-heading font-bold text-base text-ink">
                          {fmt.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isSourceFormat && (
                            <span className="text-[10px] font-semibold text-slate bg-cloud px-1.5 py-0.5 rounded border border-border">
                              Current
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-cobalt">
                            .{fmt.extension}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate leading-relaxed">
                        {fmt.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate">
                        <span>{fmt.supportsAlpha ? "✓ Alpha Transparency" : "✗ No Transparency"}</span>
                        <span>•</span>
                        <span>{fmt.supportsQuality ? "Lossy Quality" : "Lossless"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format-Specific Controls */}
            {selectedFormatConfig?.supportsQuality && (
              <div className="space-y-2 p-4 rounded-2xl bg-cloud/40 border border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cobalt" />
                      Visual Compression Quality
                    </label>
                    <p className="text-[11px] text-slate">
                      Higher quality produces sharper visuals with larger file size.
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold text-cobalt">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={Math.round(quality * 100)}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                  className="w-full accent-cobalt cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate font-mono">
                  <span>50% (Smaller size)</span>
                  <span>80% (Recommended)</span>
                  <span>100% (Maximum visual fidelity)</span>
                </div>
              </div>
            )}

            {/* Lossless PNG Notice */}
            {targetFormat === "image/png" && (
              <div className="p-4 rounded-2xl bg-cloud/40 border border-border flex items-start gap-2.5 text-xs text-slate">
                <Info className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                <p>
                  <strong>Lossless PNG:</strong> Browser Canvas encodes PNG losslessly at 100% pixel fidelity with full alpha transparency. File size depends purely on image visual complexity.
                </p>
              </div>
            )}

            {/* JPEG Transparency Flattening Controls */}
            {targetFormat === "image/jpeg" && selectedImage.hasAlpha && (
              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-start gap-2 text-xs text-amber-900 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>JPEG Flattening:</strong> Original image contains transparent pixels. Because JPEG does not support transparency, transparent areas will be filled with your selected background color.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-amber-200/60">
                  <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    Flattening Background Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {JPEG_BACKGROUND_PRESETS.map((preset) => {
                      const isSelected = backgroundColor.toUpperCase() === preset.hex.toUpperCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => handleBgSelect(preset.hex)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? "border-amber-800 bg-white text-ink shadow-sm ring-1 ring-amber-800"
                              : "border-border bg-white text-slate hover:text-ink"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-amber-800" />}
                        </button>
                      );
                    })}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => handleBgSelect(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-white"
                        title="Pick custom background color"
                      />
                      <input
                        type="text"
                        value={customHex}
                        onChange={(e) => handleCustomHexChange(e.target.value)}
                        maxLength={7}
                        className="w-20 px-2 py-1 rounded-lg border border-border font-mono text-xs text-ink bg-white uppercase text-center"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
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
                <span>Client-side in-browser Canvas. Zero data leaves your device.</span>
              </div>

              <button
                type="button"
                onClick={handleRunConversion}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-white font-heading font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Converting Format...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Convert to {selectedFormatConfig?.label}</span>
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
                    <span>Conversion Verified</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-ink">
                    Converted {result.requestedFormat.replace("image/", "").toUpperCase()} Output
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
                    Converted
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

              {/* Contextual Warning / Advice */}
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

              {/* Visual Previews with Checkerboard for Transparency */}
              <div className="relative rounded-2xl bg-cloud/50 border border-border p-4 overflow-hidden">
                {activeTab === "side-by-side" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate font-medium">
                        <span>Original ({result.originalFormat.replace("image/", "").toUpperCase()})</span>
                        <span>{formatBytes(result.originalBytes)}</span>
                      </div>
                      <div
                        className="aspect-[4/3] rounded-xl bg-white border border-border flex items-center justify-center p-2 overflow-hidden"
                        style={{
                          backgroundImage:
                            "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                          backgroundSize: "16px 16px",
                          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        }}
                      >
                        <img
                          src={selectedImage.previewUrl}
                          alt="Original"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Converted */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-cobalt font-semibold">
                        <span>Converted ({result.actualMimeType.replace("image/", "").toUpperCase()})</span>
                        <span>{formatBytes(result.outputBytes)}</span>
                      </div>
                      <div
                        className="aspect-[4/3] rounded-xl bg-white border border-border flex items-center justify-center p-2 overflow-hidden"
                        style={{
                          backgroundImage:
                            "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                          backgroundSize: "16px 16px",
                          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        }}
                      >
                        {result.outputUrl && (
                          <img
                            src={result.outputUrl}
                            alt="Converted preview"
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
                      Output: {result.actualMimeType.replace("image/", "").toUpperCase()} • {result.width}×{result.height}px ({formatBytes(result.outputBytes)})
                    </div>
                    <div
                      className="max-h-[480px] rounded-xl bg-white border border-border flex items-center justify-center p-4 overflow-hidden"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                      }}
                    >
                      <img
                        src={result.outputUrl}
                        alt="Converted output preview"
                        className="max-h-[400px] max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "original" && (
                  <div className="space-y-2 text-center">
                    <div className="text-xs text-slate">
                      Original: {result.originalFormat.replace("image/", "").toUpperCase()} • {result.width}×{result.height}px ({formatBytes(result.originalBytes)})
                    </div>
                    <div
                      className="max-h-[480px] rounded-xl bg-white border border-border flex items-center justify-center p-4 overflow-hidden"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                      }}
                    >
                      <img
                        src={selectedImage.previewUrl}
                        alt="Original preview"
                        className="max-h-[400px] max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Output MIME Type</div>
                  <div className="text-sm font-bold font-mono text-ink mt-0.5">
                    {result.actualMimeType}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Output File Size</div>
                  <div className="text-sm font-bold font-mono text-ink mt-0.5">
                    {formatBytes(result.outputBytes)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Measured Difference</div>
                  <div
                    className={`text-sm font-bold font-mono mt-0.5 ${
                      result.isSizeIncreased
                        ? "text-amber-700"
                        : result.sizeDifferenceBytes < 0
                        ? "text-success"
                        : "text-slate"
                    }`}
                  >
                    {result.isSizeIncreased ? `+${result.percentDifference}%` : result.sizeDifferenceBytes < 0 ? `-${result.percentDifference}%` : "0%"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cloud/50 border border-border">
                  <div className="text-[11px] text-slate font-medium">Transparency</div>
                  <div className="text-sm font-bold font-mono text-ink mt-0.5 capitalize">
                    {result.transparencyHandled}
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
                  Convert Another Image
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-white font-heading font-bold text-sm shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Converted Image ({result.actualMimeType.replace("image/", "").toUpperCase()})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
