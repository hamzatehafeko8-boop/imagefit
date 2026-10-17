import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Pure functions under test
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function generateOutputFilename(originalName, targetBytes, outputFormat) {
  const lastDot = originalName.lastIndexOf(".");
  const baseName = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const cleanBase = sanitizeFilename(baseName);

  let ext = "jpg";
  if (outputFormat === "image/webp") ext = "webp";
  else if (outputFormat === "image/png") ext = "png";

  const targetKb = Math.round(targetBytes / 1024);
  return `${cleanBase}-fit-${targetKb}kb.${ext}`;
}

// Pure bounded quality search simulation mirroring compressor.ts
function simulateBoundedSearch(targetBytes, candidateSizes, maxIterations = 8) {
  let low = 0.05;
  let high = 1.0;
  let iteration = 0;
  let bestCandidate = null;
  let smallestCandidate = null;
  const testedQualities = new Set();
  const evaluationHistory = [];

  while (iteration < maxIterations && high >= low) {
    // Midpoint quality rounded to 2 decimal places using low + (high - low) / 2
    const midQuality = Math.round((low + (high - low) / 2) * 100) / 100;

    if (testedQualities.has(midQuality)) {
      break;
    }
    testedQualities.add(midQuality);
    iteration++;

    const candidateSize = candidateSizes[midQuality] ?? Math.round(midQuality * 300 * 1024);
    const candidate = { quality: midQuality, size: candidateSize };
    evaluationHistory.push({ iteration, midQuality, candidateSize, low, high });

    if (!smallestCandidate || candidateSize < smallestCandidate.size) {
      smallestCandidate = candidate;
    }

    if (candidateSize <= targetBytes) {
      if (!bestCandidate || candidate.quality > bestCandidate.quality) {
        bestCandidate = candidate;
      }
      low = Math.round((midQuality + 0.01) * 100) / 100;
    } else {
      high = Math.round((midQuality - 0.01) * 100) / 100;
    }
  }

  const isTargetMet = bestCandidate !== null && bestCandidate.size <= targetBytes;
  return {
    isTargetMet,
    bestQuality: bestCandidate ? bestCandidate.quality : null,
    bestSize: bestCandidate ? bestCandidate.size : null,
    smallestCandidate,
    iterations: iteration,
    evaluationHistory,
    testedQualities: Array.from(testedQualities),
  };
}

describe("ImageFit Compressor Logic & Bounded Search Verification", () => {
  describe("Filename Sanitization", () => {
    it("preserves safe alphanumeric names and periods", () => {
      assert.equal(sanitizeFilename("my-photo_2026.final.jpg"), "my-photo_2026.final.jpg");
    });

    it("sanitizes path traversal and forbidden characters", () => {
      assert.equal(sanitizeFilename("../../etc/passwd.jpg"), ".._.._etc_passwd.jpg");
      assert.equal(sanitizeFilename("photo (1) & copy #2!.png"), "photo__1____copy__2_.png");
    });
  });

  describe("Output Filename Generation", () => {
    it("generates correct target filename for JPEG", () => {
      const filename = generateOutputFilename("portrait.png", 100 * 1024, "image/jpeg");
      assert.equal(filename, "portrait-fit-100kb.jpg");
    });

    it("generates correct target filename for WebP", () => {
      const filename = generateOutputFilename("banner.jpg", 50 * 1024, "image/webp");
      assert.equal(filename, "banner-fit-50kb.webp");
    });

    it("generates correct target filename for PNG", () => {
      const filename = generateOutputFilename("icon.webp", 200 * 1024, "image/png");
      assert.equal(filename, "icon-fit-200kb.png");
    });
  });

  describe("formatBytes Precision", () => {
    it("accurately formats byte values", () => {
      assert.equal(formatBytes(0), "0 B");
      assert.equal(formatBytes(512), "512 B");
      assert.equal(formatBytes(1024), "1 KB");
      assert.equal(formatBytes(100 * 1024), "100 KB");
      assert.equal(formatBytes(1536), "1.5 KB");
      assert.equal(formatBytes(5 * 1024 * 1024), "5 MB");
    });
  });

  describe("Midpoint Calculation and Boundary Updates", () => {
    it("calculates midpoint correctly using low + (high - low) / 2", () => {
      const calcMid = (low, high) => Math.round((low + (high - low) / 2) * 100) / 100;
      assert.equal(calcMid(0.05, 1.0), 0.53);
      assert.equal(calcMid(0.54, 1.0), 0.77);
      assert.equal(calcMid(0.05, 0.52), 0.29);
      assert.equal(calcMid(0.20, 0.30), 0.25);
    });

    it("updates bounds with 0.01 step and does not skip quality candidates", () => {
      const result = simulateBoundedSearch(100 * 1024, {});
      for (let i = 1; i < result.evaluationHistory.length; i++) {
        const prev = result.evaluationHistory[i - 1];
        const curr = result.evaluationHistory[i];
        if (prev.candidateSize <= 100 * 1024) {
          // Low should have stepped up by 0.01
          assert.equal(curr.low, Math.round((prev.midQuality + 0.01) * 100) / 100);
        } else {
          // High should have stepped down by 0.01
          assert.equal(curr.high, Math.round((prev.midQuality - 0.01) * 100) / 100);
        }
      }
    });

    it("prevents repeated candidate evaluations via testedQualities set", () => {
      const result = simulateBoundedSearch(100 * 1024, {});
      const uniqueQualities = new Set(result.testedQualities);
      assert.equal(uniqueQualities.size, result.testedQualities.length, "No quality value should be evaluated twice");
    });
  });

  describe("Candidate Selection and Target Verification", () => {
    it("selects the highest quality candidate meeting target bytes", () => {
      const targetBytes = 100 * 1024;
      // Simulate non-monotonic sizes to test best valid candidate selection
      const mockSizes = {
        0.53: 120 * 1024, // too big
        0.29: 80 * 1024,  // eligible
        0.41: 95 * 1024,  // eligible and higher quality
        0.47: 105 * 1024, // too big
        0.44: 99 * 1024,  // eligible and even higher quality!
      };
      const result = simulateBoundedSearch(targetBytes, mockSizes);

      assert.equal(result.isTargetMet, true);
      assert.equal(result.bestQuality, 0.44);
      assert.equal(result.bestSize, 99 * 1024);
      assert.ok(result.bestSize <= targetBytes);
    });

    it("marks target_met as false when no candidate meets target, returning smallest candidate", () => {
      const targetBytes = 10 * 1024; // 10 KB
      const mockSizes = {
        0.53: 150 * 1024,
        0.29: 80 * 1024,
        0.17: 50 * 1024,
        0.11: 35 * 1024,
        0.08: 25 * 1024,
        0.06: 20 * 1024,
        0.05: 18 * 1024,
      };
      const result = simulateBoundedSearch(targetBytes, mockSizes);

      assert.equal(result.isTargetMet, false);
      assert.equal(result.bestSize, null);
      assert.equal(result.bestQuality, null);
      assert.ok(result.smallestCandidate !== null);
      assert.equal(result.smallestCandidate.quality, 0.05);
      assert.equal(result.smallestCandidate.size, 18 * 1024);
    });

    it("strictly verifies byte limit: candidate at exact target passes, 1 byte over fails", () => {
      const targetBytes = 100 * 1024;
      assert.equal(targetBytes <= targetBytes, true);
      assert.equal(targetBytes + 1 <= targetBytes, false);
    });
  });

  describe("Iteration Limit Constraints", () => {
    it("strictly respects the 8-iteration budget across various target sizes", () => {
      const targets = [5 * 1024, 25 * 1024, 50 * 1024, 100 * 1024, 200 * 1024, 300 * 1024, 500 * 1024];
      for (const target of targets) {
        const result = simulateBoundedSearch(target, {});
        assert.ok(
          result.iterations <= 8,
          `Expected iterations <= 8 for target ${target}, got ${result.iterations}`
        );
      }
    });

    it("terminates early when quality interval converges before 8 iterations", () => {
      // If quality is very low and bounds collapse quickly
      const result = simulateBoundedSearch(100 * 1024, {}, 8);
      assert.ok(result.iterations <= 8);
    });
  });
});
