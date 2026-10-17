import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Pure functions under test (mirroring lib/image-processing/resizer.ts)
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function validateDimensions(width, height, maxWidth = 16384, maxHeight = 16384) {
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

function calculateProportionalDimensions(origW, origH, params) {
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

function calculateContainDimensions(origW, origH, maxW, maxH) {
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

function calculateCoverCrop(origW, origH, targetW, targetH, position = "center") {
  if (origW <= 0 || origH <= 0 || targetW <= 0 || targetH <= 0) {
    throw new Error("Dimensions must be positive numbers.");
  }

  const ratio = Math.max(targetW / origW, targetH / origH);
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

function checkUpscaling(origW, origH, targetW, targetH) {
  const widthFactor = targetW / origW;
  const heightFactor = targetH / origH;
  const maxFactor = Math.max(widthFactor, heightFactor);
  const isUpscaled = maxFactor > 1.0;

  let message;
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

function generateResizedFilename(originalName, width, height, outputFormat) {
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const cleanBase = sanitizeFilename(baseName);

  let ext = "jpg";
  if (outputFormat === "image/webp") ext = "webp";
  else if (outputFormat === "image/png") ext = "png";

  return `${cleanBase}-${width}x${height}.${ext}`;
}

describe("ImageFit Resizer Engine Verification", () => {
  describe("Dimension Validation", () => {
    it("accepts valid positive integer dimensions within bounds", () => {
      const res = validateDimensions(1920, 1080);
      assert.equal(res.isValid, true);
    });

    it("rejects zero and negative dimensions", () => {
      assert.equal(validateDimensions(0, 100).isValid, false);
      assert.equal(validateDimensions(100, -50).isValid, false);
      assert.equal(validateDimensions(-10, -10).isValid, false);
    });

    it("rejects non-finite, NaN, and undefined dimensions", () => {
      assert.equal(validateDimensions(NaN, 500).isValid, false);
      assert.equal(validateDimensions(500, Infinity).isValid, false);
      assert.equal(validateDimensions(undefined, 500).isValid, false);
    });

    it("rejects dimensions exceeding maximum canvas safety limits", () => {
      assert.equal(validateDimensions(20000, 1000, 16384, 16384).isValid, false);
      assert.equal(validateDimensions(1000, 18000, 16384, 16384).isValid, false);
    });
  });

  describe("Proportional Dimension Calculations", () => {
    it("calculates proportional height when given new width (Landscape 16:9)", () => {
      const { width, height } = calculateProportionalDimensions(1920, 1080, { newWidth: 1280 });
      assert.equal(width, 1280);
      assert.equal(height, 720);
    });

    it("calculates proportional width when given new height (Portrait 4:5)", () => {
      const { width, height } = calculateProportionalDimensions(1080, 1350, { newHeight: 1000 });
      assert.equal(height, 1000);
      assert.equal(width, 800);
    });

    it("preserves 1:1 aspect ratio for square images", () => {
      const { width, height } = calculateProportionalDimensions(800, 800, { newWidth: 400 });
      assert.equal(width, 400);
      assert.equal(height, 400);
    });

    it("handles rounding cleanly for odd aspect ratios", () => {
      const { width, height } = calculateProportionalDimensions(1000, 333, { newWidth: 500 });
      assert.equal(width, 500);
      assert.equal(height, 167);
    });
  });

  describe("Fit Mode — Contain Calculations", () => {
    it("constrains by width when requested box is narrower than image ratio", () => {
      // 16:9 image (1920x1080) into a square box (1000x1000)
      const contain = calculateContainDimensions(1920, 1080, 1000, 1000);
      assert.equal(contain.width, 1000);
      assert.equal(contain.height, 563);
      assert.equal(contain.isConstrainedByWidth, true);
      assert.ok(contain.width <= 1000 && contain.height <= 1000);
    });

    it("constrains by height when requested box is taller than image ratio", () => {
      // 4:5 portrait (800x1000) into a wide box (1200x600)
      const contain = calculateContainDimensions(800, 1000, 1200, 600);
      assert.equal(contain.width, 480);
      assert.equal(contain.height, 600);
      assert.equal(contain.isConstrainedByWidth, false);
      assert.ok(contain.width <= 1200 && contain.height <= 600);
    });

    it("fits perfectly when aspect ratios match exactly", () => {
      const contain = calculateContainDimensions(1920, 1080, 960, 540);
      assert.equal(contain.width, 960);
      assert.equal(contain.height, 540);
    });
  });

  describe("Crop Mode — Cover Calculations", () => {
    it("crops left and right sides evenly in center crop mode for wide images", () => {
      // 16:9 source (1920x1080) into a square target (800x800)
      const crop = calculateCoverCrop(1920, 1080, 800, 800, "center");
      assert.equal(crop.targetWidth, 800);
      assert.equal(crop.targetHeight, 800);
      // Height matches full source height (1080), width is cropped to 1080
      assert.equal(crop.sourceHeight, 1080);
      assert.equal(crop.sourceWidth, 1080);
      // sx should be centered: (1920 - 1080) / 2 = 420
      assert.equal(crop.sourceX, 420);
      assert.equal(crop.sourceY, 0);
    });

    it("crops top and bottom sides evenly in center crop mode for tall images", () => {
      // 1:2 tall source (500x1000) into a square target (500x500)
      const crop = calculateCoverCrop(500, 1000, 500, 500, "center");
      assert.equal(crop.targetWidth, 500);
      assert.equal(crop.targetHeight, 500);
      assert.equal(crop.sourceWidth, 500);
      assert.equal(crop.sourceHeight, 500);
      assert.equal(crop.sourceX, 0);
      assert.equal(crop.sourceY, 250); // (1000 - 500) / 2 = 250
    });

    it("respects top alignment in cover crop", () => {
      const crop = calculateCoverCrop(500, 1000, 500, 500, "top");
      assert.equal(crop.sourceY, 0);
    });

    it("respects bottom alignment in cover crop", () => {
      const crop = calculateCoverCrop(500, 1000, 500, 500, "bottom");
      assert.equal(crop.sourceY, 500);
    });

    it("always produces exact target output dimensions", () => {
      const crop = calculateCoverCrop(1234, 5678, 640, 480, "center");
      assert.equal(crop.targetWidth, 640);
      assert.equal(crop.targetHeight, 480);
    });
  });

  describe("Upscaling Behavior Detection", () => {
    it("identifies downscaling correctly without upscaling flag", () => {
      const check = checkUpscaling(1920, 1080, 1280, 720);
      assert.equal(check.isUpscaled, false);
      assert.equal(check.upscaleFactor, 0.67);
      assert.equal(check.message, undefined);
    });

    it("detects upscaling when width or height exceeds original dimensions", () => {
      const check = checkUpscaling(800, 600, 1600, 1200);
      assert.equal(check.isUpscaled, true);
      assert.equal(check.upscaleFactor, 2.0);
      assert.ok(check.message.includes("Upscaling"));
    });

    it("detects partial upscaling if one dimension exceeds original", () => {
      const check = checkUpscaling(800, 600, 700, 900);
      assert.equal(check.isUpscaled, true);
      assert.equal(check.upscaleFactor, 1.5);
    });
  });

  describe("Resized Filename Generation", () => {
    it("generates correct filename with dimensions and extension for JPEG", () => {
      const name = generateResizedFilename("summer-vacation.png", 1200, 630, "image/jpeg");
      assert.equal(name, "summer-vacation-1200x630.jpg");
    });

    it("generates correct filename with dimensions for WebP", () => {
      const name = generateResizedFilename("logo-final.jpg", 400, 400, "image/webp");
      assert.equal(name, "logo-final-400x400.webp");
    });

    it("sanitizes unsafe path traversal characters in output filename", () => {
      const name = generateResizedFilename("../../../etc/shadow.png", 800, 600, "image/png");
      assert.equal(name, ".._.._.._etc_shadow-800x600.png");
    });
  });
});
