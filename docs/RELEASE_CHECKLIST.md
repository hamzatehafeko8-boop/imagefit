# ImageFit — Pre-Launch Release Checklist & Deployment Guide

**Product Slogan:** *Every image. The right fit.*  
**Target Architecture:** Next.js 16.4.2 App Router (Static Prerendered HTML/JS/CSS + Client-Side Canvas Processing)

---

## 1. Project Owner Configuration Responsibilities

Before taking ImageFit public, the project owner must configure the following operational items:

| Configuration Item | Status | Recommended Value / Action | Description |
| :--- | :---: | :--- | :--- |
| **Production Domain** | Required | e.g., `https://imagefit.app` | Register custom domain and configure DNS records (A/CNAME) pointing to the hosting provider. |
| **`NEXT_PUBLIC_SITE_URL`** | Required | `https://<your-confirmed-domain>` | Set in hosting environment settings. Controls canonical URLs in metadata, `sitemap.xml`, and `robots.txt`. |
| **`NEXT_PUBLIC_CONTACT_EMAIL`** | Required | `support@<your-confirmed-domain>` | Set in hosting environment settings. Controls the destination email address populated in the client-side `mailto:` contact draft. |
| **Hosting Platform** | Required | Vercel / Cloudflare Pages / Firebase App Hosting / AWS Amplify | Connect repository to continuous deployment or run `npm run build` and deploy static output. |
| **SSL / HTTPS Certificate** | Required | Automatic via Host / Let's Encrypt | Secure HTTPS connection is mandatory for modern Canvas, WebP, and clipboard APIs. |
| **Security Log Sign-Off** | Required | Sign-off on `docs/SECURITY_AUDIT.md` | Formal project owner acknowledgment of the build-time dependency advisory GHSA-vfj7-8cjw-p6xm in `braces` (used in Tailwind CSS v3 tooling). |

---

## 2. Pre-Deployment Quality Sign-Off

The project codebase has passed the following automated gates:

- [x] **Unit Tests:** 53/53 tests pass across 20 suites (`npm run test`).
- [x] **Static Type Check:** 0 TypeScript compile errors (`npm run type-check`).
- [x] **ESLint:** 0 errors, 0 warnings (`npm run lint`).
- [x] **Production Compilation:** Next.js 16.4.2 compiles and prerenders all 16 static routes (`npm run build`).
- [x] **Dependency Audit:** Evaluated and documented in `docs/SECURITY_AUDIT.md`.
- [x] **Data Privacy Guarantee:** Verified 0 bytes of user image data leave browser memory.
- [x] **Responsive Layout:** Verified from 320px mobile viewports to 4K desktop screens.
- [x] **WCAG 2.1 AA:** Accessible color contrast, keyboard focus rings, semantic labels.

---

## 3. Deployment Steps

### Option A: Vercel / Cloudflare Pages / Netlify (Recommended)
1. Import repository into hosting provider.
2. Configure build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
3. Add Environment Variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-production-domain>`
   - `NEXT_PUBLIC_CONTACT_EMAIL` = `support@<your-production-domain>`
4. Deploy and verify SSL issuance.

### Option B: Self-Hosted Node.js / Docker
1. Build the application: `npm run build`
2. Start the production server: `npm start` (or `next start -p <port>`)
3. Place behind an HTTPS reverse proxy (Nginx, Caddy, or Cloudflare Tunnel) terminating TLS.

---

## 4. Post-Deployment Smoke Test Protocol

After publishing to the live domain, run the following smoke tests on the production URL:

1. **Endpoint Health:**
   - [ ] Navigate to `/` (Homepage loads with brand assets and navigation).
   - [ ] Navigate to `/tools/image-compressor` (Compressor initializes ready for upload).
   - [ ] Navigate to `/tools/image-resizer` (Resizer initializes with mode controls).
   - [ ] Navigate to `/tools/image-converter` (Converter initializes with format pills).
   - [ ] Navigate to `/sitemap.xml` (Verify URLs match `NEXT_PUBLIC_SITE_URL`).
   - [ ] Navigate to `/robots.txt` (Verify sitemap directive points to production domain).
2. **Live Tool Execution:**
   - [ ] Drop a JPEG into the compressor, set target to 100 KB, verify download matches target.
   - [ ] Drop an image into the resizer, select Cover Crop 1080×1080, download and verify dimensions.
   - [ ] Drop a transparent PNG into the converter, convert to JPEG with White background, verify background is pure white.
   - [ ] Drop a transparent PNG into the converter, convert to WebP, verify transparency is preserved.
3. **Contact Experience:**
   - [ ] Click "Prepare Email in Default Client" on `/contact` and confirm the configured recipient address appears in the system email draft.
4. **Network Inspector Check:**
   - [ ] Open Browser DevTools Network tab, upload an image, and confirm zero outbound image upload requests occur.
