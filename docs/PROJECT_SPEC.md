# ImageFit — Project Specification

**Product Name:** ImageFit  
**Slogan:** *Every image. The right fit.*  
**Supporting Promise:** The right file size, dimensions, and format—ready to use.  
**Release Stage:** Release 1 — Core Service (Foundation & Homepage)

---

## 1. Product Vision & Differentiator

ImageFit is a high-precision, privacy-first web utility for compressing, resizing, and converting images directly inside the user's browser. Unlike generic tools that rely on arbitrary quality sliders or misleading claims, ImageFit's primary differentiator is:

> **Target-size compression with real output-size verification, honest quality trade-offs, and 100% local in-browser processing.**

### Core Pillars:
- **Precision:** Actual file sizes measured from real output Blobs. Tabular numerals for numbers and dimensions.
- **Honesty:** A "Target Met" status is strictly awarded only when the resulting file size is $\le$ the user's specified limit.
- **Privacy by Design:** Zero image uploads to servers. All encoding, resizing, and conversion runs locally using HTML Canvas and Web APIs.
- **Professional Restraint:** Clean, focused UI emphasizing the primary workflow with a signature crop-corner motif, rather than distracting gradients or decorative clutter.

---

## 2. Target Personas & Use Cases

1. **Students & Online Applicants:** Need photos or documents strictly under limits such as 50 KB, 100 KB, or 200 KB for admission and job portals.
2. **Designers & Digital Creators:** Need consistent dimensions, format optimization, and predictable quality trade-offs for web and app assets.
3. **Website Owners & Small Businesses:** Need optimized images for fast page loads and SEO compliance without installing heavy desktop software.
4. **Everyday Users:** Need quick, private, and frictionless image processing without account registration or subscriptions.

---

## 3. Product Scope & Milestones

### Milestone 0: Foundation, Architecture & Documentation
- Clean Next.js App Router + TypeScript + Tailwind CSS project setup.
- Design token integration (`--color-ink`, `--color-cobalt`, `--color-lime`, etc.).
- Complete architectural and process documentation in `docs/`.

### Milestone 1: Brand Assets & Responsive Homepage
- Original brand identity: Crop-corner signature motif, SVG mark, and favicon.
- Global navigation, accessible header, and mobile menu.
- Hero section featuring *"Every image. The right fit."* and primary upload entry point.
- Quick-action tool cards for Compressor, Resizer, and Converter.
- How-it-works workflow explanation.
- Privacy & differentiator breakdown.
- Use case highlights and guide reservation cards.
- Comprehensive footer with navigational, legal, and feedback links.

### Milestone 2: Target-Size Compressor Engine (Upcoming)
- Bounded iterative quality search measuring real output Blobs.
- Presets (50 KB, 100 KB, 200 KB, 500 KB, 1 MB) and custom byte/KB inputs.
- Real-time comparison preview and safe download flow.

### Milestone 3: Image Resizer Tool (Upcoming)
- Custom pixel width/height inputs with aspect-ratio lock.
- Fit/Contain/Crop scaling modes.

### Milestone 4: Image Converter Tool (Upcoming)
- Tested format matrix (JPEG, PNG, WebP) with MIME verification and transparency warnings.

### Milestone 5: Guides, SEO & Release QA (Upcoming)
- High-utility guides, sitemap, robots.txt, Open Graph metadata, and full accessibility auditing.

---

## 4. Non-Goals for Initial Release
- No mandatory user sign-in or account registration.
- No cloud storage or remote server image persistence.
- No fake counters, fake reviews, or artificial countdown timers.
- No unrelated tools (e.g. QR code generators).
