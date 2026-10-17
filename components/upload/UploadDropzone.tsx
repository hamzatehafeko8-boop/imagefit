"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { UploadCloud, Image as ImageIcon, AlertCircle, ArrowRight, X, CheckCircle2, ShieldCheck } from "lucide-react";
import { PROCESSING_LIMITS } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import { CropCorners } from "@/components/brand/CropCorners";

interface SelectedImageMeta {
  file: File;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  type: string;
  previewUrl: string;
}

export function UploadDropzone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImageMeta | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanUpPreview = useCallback(() => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
  }, [selectedImage]);

  const handleReset = useCallback(() => {
    cleanUpPreview();
    setSelectedImage(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [cleanUpPreview]);

  const validateAndProcessFile = useCallback((file: File) => {
    setErrorMessage(null);

    // 1. Check MIME type
    if (!PROCESSING_LIMITS.supportedMimeTypes.includes(file.type)) {
      setErrorMessage(
        `Unsupported file format (${file.type || "unknown"}). ImageFit supports JPEG, PNG, and WebP images.`
      );
      return;
    }

    // 2. Check File Size Limit
    if (file.size > PROCESSING_LIMITS.maxFileSizeBytes) {
      setErrorMessage(
        `File exceeds maximum configured limit of ${PROCESSING_LIMITS.maxFileSizeLabel} (Selected: ${formatBytes(file.size)}).`
      );
      return;
    }

    // 3. Decode dimensions safely
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Validate dimensions
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage("Image contains invalid zero dimensions.");
        return;
      }
      if (
        img.naturalWidth > PROCESSING_LIMITS.maxDimensionPx ||
        img.naturalHeight > PROCESSING_LIMITS.maxDimensionPx
      ) {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage(
          `Image dimensions (${img.naturalWidth}×${img.naturalHeight}px) exceed protective safety limit of ${PROCESSING_LIMITS.maxDimensionPx}px.`
        );
        return;
      }

      cleanUpPreview();
      setSelectedImage({
        file,
        name: file.name,
        sizeBytes: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: file.type,
        previewUrl: objectUrl,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage("Unable to decode image file. The file may be corrupt or not a valid image.");
    };

    img.src = objectUrl;
  }, [cleanUpPreview]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndProcessFile(e.dataTransfer.files[0]);
      }
    },
    [validateAndProcessFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Upload Box / Selected State */}
      {!selectedImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 sm:p-12 text-center bg-white shadow-card hover:shadow-elevated group focus-within:ring-2 focus-within:ring-cobalt ${
            isDragOver
              ? "border-cobalt bg-cobalt/5 scale-[1.01]"
              : "border-border-strong hover:border-cobalt/60 hover:bg-cloud/50"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload an image to optimize"
        >
          {/* Crop Corners brand motif */}
          <CropCorners
            size={16}
            color={isDragOver ? "text-cobalt" : "text-border-strong group-hover:text-cobalt/60"}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept={PROCESSING_LIMITS.supportedExtensions.join(",")}
            onChange={handleFileChange}
            className="sr-only"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
              <UploadCloud className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <p className="text-lg sm:text-xl font-heading font-bold text-ink">
                Drop your image here, or{" "}
                <span className="text-cobalt underline decoration-cobalt/40 underline-offset-4 group-hover:decoration-cobalt">
                  browse file
                </span>
              </p>
              <p className="text-sm text-slate">
                Supports <span className="font-medium text-ink">JPEG, PNG, WebP</span> up to{" "}
                <span className="font-medium text-ink">{PROCESSING_LIMITS.maxFileSizeLabel}</span>
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cloud font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Exact byte verification
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cloud font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> Local Browser Processing (No Uploads)
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Selected Image Card with Honest Action Options */
        <div className="relative rounded-2xl border border-border bg-white shadow-elevated p-6 sm:p-8 space-y-6">
          <CropCorners size={16} color="text-cobalt" />

          {/* Header & Reset */}
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-ink text-base sm:text-lg truncate max-w-xs sm:max-w-md">
                  {selectedImage.name}
                </h3>
                <p className="text-xs text-slate">Ready for precision optimization</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate hover:text-error hover:bg-error-light rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
            >
              <X className="w-3.5 h-3.5" />
              <span>Change Image</span>
            </button>
          </div>

          {/* Image Metrics Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cloud rounded-xl p-4 border border-border/60">
            <div>
              <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">File Size</p>
              <p className="text-base font-bold text-ink tabular-nums mt-0.5">
                {formatBytes(selectedImage.sizeBytes)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">Dimensions</p>
              <p className="text-base font-bold text-ink tabular-nums mt-0.5">
                {selectedImage.width} × {selectedImage.height} <span className="text-xs font-normal text-slate">px</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">Format</p>
              <p className="text-base font-bold text-ink uppercase mt-0.5">
                {selectedImage.type.replace("image/", "")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate uppercase tracking-wider">Aspect Ratio</p>
              <p className="text-base font-bold text-ink tabular-nums mt-0.5">
                {(selectedImage.width / selectedImage.height).toFixed(2)}:1
              </p>
            </div>
          </div>

          {/* Action Pathways */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate uppercase tracking-wider font-heading">
              Choose Next Action:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/tools/image-compressor"
                className="group p-4 rounded-xl border-2 border-cobalt/20 bg-cobalt/5 hover:border-cobalt hover:bg-cobalt/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cobalt px-2 py-0.5 rounded bg-cobalt/15 inline-block mb-1.5">
                    Core Tool
                  </span>
                  <h4 className="font-heading font-bold text-ink text-sm group-hover:text-cobalt transition-colors">
                    Compress to Target
                  </h4>
                  <p className="text-xs text-slate mt-1">
                    Hit exact limit: 50KB, 100KB, 200KB with verified output.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-cobalt mt-3">
                  <span>Open Compressor</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/tools/image-resizer"
                className="group p-4 rounded-xl border border-border bg-white hover:border-cobalt/50 hover:bg-cloud/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate px-2 py-0.5 rounded bg-cloud inline-block mb-1.5">
                    Dimensions
                  </span>
                  <h4 className="font-heading font-bold text-ink text-sm group-hover:text-cobalt transition-colors">
                    Resize Dimensions
                  </h4>
                  <p className="text-xs text-slate mt-1">
                    Adjust pixel width/height with aspect-ratio lock.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate group-hover:text-cobalt mt-3">
                  <span>Open Resizer</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/tools/image-converter"
                className="group p-4 rounded-xl border border-border bg-white hover:border-cobalt/50 hover:bg-cloud/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate px-2 py-0.5 rounded bg-cloud inline-block mb-1.5">
                    Format
                  </span>
                  <h4 className="font-heading font-bold text-ink text-sm group-hover:text-cobalt transition-colors">
                    Convert Format
                  </h4>
                  <p className="text-xs text-slate mt-1">
                    Convert between tested JPEG, PNG, and WebP.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate group-hover:text-cobalt mt-3">
                  <span>Open Converter</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Rejection / Validation Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-4 p-4 rounded-xl border border-error/30 bg-error-light text-error flex items-start gap-3 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold">Validation Issue</p>
            <p className="mt-0.5 text-error/90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-error/70 hover:text-error p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
