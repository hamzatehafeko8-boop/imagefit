# ImageFit — Changelog

All notable changes to the ImageFit codebase are recorded here chronologically.

---

## [0.6.0] — 2026-10-17

### Milestone 6: Pre-Launch Release Preparation
- **Security Audit & Advisory Correction (`docs/SECURITY_AUDIT.md`):**
  - Investigated GitHub Advisory GHSA-vfj7-8cjw-p6xm for `braces`. Corrected previous reporting to accurately state that advisory affects all 3.x releases (including 3.0.3) with no upstream patch currently published.
  - Verified package dependency paths through `tailwindcss@3.4.19`, `chokidar@3.6.0`, and `micromatch@4.0.8`.
  - Audited production build artifacts (`.next/static/**` and `.next/server/**`) to confirm zero presence of `braces` in runtime bundles.
  - Evaluated build-time exposure: inputs to `braces` are restricted to developer-authored glob patterns in `tailwind.config.ts` and local filesystem paths, with zero end-user reachability.
  - Documented rationale against `npm audit fix --force` (which would force an uncoordinated major migration to Tailwind v4).
  - Established formal review condition and mitigation tracking.
- **Production Configuration & Environment Documentation:**
  - Created `.env.example` documenting `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL`.
  - Refined `app/privacy/page.tsx` to remove speculative statements regarding error monitoring and affirm zero telemetry scripts.
  - Created comprehensive `docs/RELEASE_CHECKLIST.md` guiding the project owner through domain registration, DNS, SSL, hosting setup, and environment variables.
- **Verification & Quality Gates:**
  - Retested all quality gates: 53/53 unit tests passing, 0 TypeScript compile errors, 0 ESLint warnings/errors, 16/16 routes prerendered statically in Next.js 16.4.2.

---

## [0.5.0] — 2026-10-17

### Milestone 5: Full Product Integration & Quality Assurance
- Integrated and cross-tested Compressor, Resizer, and Converter across mobile, tablet, and desktop viewports.
- Strengthened Object URL lifecycle management (`URL.revokeObjectURL`) and async race condition safety.
- Updated contact experience with `NEXT_PUBLIC_CONTACT_EMAIL` fallback and clear development mode advisories.
- Verified live production server across all public endpoints with HTTP 200 responses.

---

## [0.4.0] — 2026-10-17

### Milestone 4: Professional Image Converter
- Implemented pure client-side format conversion engine (`lib/image-processing/converter.ts`) supporting JPEG, WebP, and PNG.
- Added alpha-channel detection and automated background flattening for JPEG conversions.
- Added honest file size difference calculations and MIME type verification.
- Built interactive converter UI (`components/converter/ImageConverter.tsx`) and dedicated route (`app/tools/image-converter/page.tsx`).
- Added 18 unit tests in `lib/image-processing/converter.test.mjs`.

---

## [0.3.0] — 2026-10-17

### Milestone 3: Professional Image Resizer
- Implemented client-side image resizer (`lib/image-processing/resizer.ts`) supporting Custom, Contain, and Cover Crop modes.
- Added 9-point directional crop anchor grid, aspect ratio preservation, and upscale warnings.
- Built interactive resizer UI (`components/resizer/ImageResizer.tsx`) and dedicated route (`app/tools/image-resizer/page.tsx`).
- Added 25 unit tests in `lib/image-processing/resizer.test.mjs`.

---

## [0.2.0] — 2026-10-17

### Milestone 2: Core Exact-Target Image Compressor
- **Pure Processing Engine (`lib/image-processing/compressor.ts`):**
  - Implemented bounded binary search over candidate encoding qualities (`[0.05, 1.00]`) with an explicit budget cap of 8 iterations.
  - Implemented real Blob byte measurement after canvas encoding (`candidateBlob.size`), strictly verifying `actualOutputBlob.size <= targetBytes`.
  - Added transparency detection via canvas pixel alpha scanning (`detectAlphaChannel`).
  - Handled transparent PNG conversions to JPEG by filling with clean background (`#FFFFFF`) and surfacing a warning notice.
  - Handled PNG encoding transparently (explaining that standard canvas PNG is lossless and quality parameters do not apply).
  - Added safe download filename generation (`generateOutputFilename`) with sanitization.
  - Added temporary Object URL tracking and cleanup via `URL.revokeObjectURL()`.
- **Interactive Compressor UI (`components/compressor/ImageCompressor.tsx`):**
  - Built full interactive workspace supporting drag-and-drop or file picker.
  - Added target-size preset buttons (50 KB, 100 KB, 200 KB, 500 KB, 1 MB) and custom target numeric input with KB/MB selector.
  - Added output format selection (JPEG, WebP, PNG) and optional dimension scaling overrides (100%, 75%, 50%, 25%).
  - Added live candidate progress feedback during search (`Iteration X of 8`).
  - Added Before/After visual comparison with side-by-side, original-only, and compressed-only views.
  - Added tabular metrics grid (output size, reduction %, dimensions, quality used, iteration count).
  - Built strict status badges: Verified Green "Target Limit Met" vs Warning Amber "Target Limit Not Met" with actionable dimension reduction or WebP conversion suggestions.
- **Dedicated Tool Route (`app/tools/image-compressor/page.tsx`):**
  - Replaced milestone placeholder with the live `ImageCompressor` application and comprehensive FAQ accordion.
- **Automated Unit Tests (`lib/image-processing/compressor.test.mjs`):**
  - Added 10 automated unit tests covering filename sanitization, output name generation, byte formatting precision, bounded search quality convergence, and strict target-met rejection rules.
  - Configured `"test"` script in `package.json` (`node --test`).

---

## [0.1.1] — 2026-10-17

### Foundation Hardening & Security Checkpoint
- **Upgraded Next.js to Security-Patched Active Release:**
  - Upgraded Next.js from deprecated 14.x (`14.2.35`) to supported `16.4.2`, eliminating critical server-side RCE vulnerabilities (GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4).
  - Aligned React and React-DOM to `19.3.1` and TypeScript to `5.9.3`.
  - Upgraded PostCSS to `8.5.30`, eliminating arbitrary file read vulnerabilities (GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q).
  - Configured npm dependency overrides for `braces` (`^3.0.3`), `micromatch` (`^4.0.8`), and `postcss-selector-parser` (`^7.1.6`).
- **Migrated ESLint to Flat Config (`eslint.config.mjs`):**
  - Replaced deprecated `.eslintrc.json` with ESLint 9 Flat Config using native `eslint-config-next/core-web-vitals` exports.
  - Refactored `Header.tsx` to follow React 19 recommended state patterns during route transitions, eliminating cascading render warnings.
- **Truthfulness & Precision Copy Audit:**
  - Updated contact form (`app/contact/page.tsx`) to transparently explain client-side architecture without a backend database, opening a direct `mailto:` draft rather than presenting false confirmation of remote server delivery.
  - Refined absolute marketing claims across the UI: replaced "100% In-Browser Privacy" with precisely qualified "Local Browser Processing (No Uploads)".
  - Configured `SITE_URL` dynamically from `process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"` across `sitemap.ts`, `robots.ts`, and `layout.tsx`, ensuring no fake domains are advertised.
- **Checkpoint Backup:**
  - Created a complete source backup at `C:\Users\PC\Downloads\imagefit_backup_pre_hardening` to protect files in the absence of Git.

---

## [0.1.0] — 2026-10-17

### Milestone 0 & 1: Foundation, Documentation, Design System & Responsive Homepage
- Established project specifications and design tokens.
- Created original ImageFit SVG brand assets with signature crop-corner motif.
- Built responsive homepage and accessible layout shells.
