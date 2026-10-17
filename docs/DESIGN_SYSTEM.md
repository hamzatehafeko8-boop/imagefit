# ImageFit — Design System & Visual Specification

**Brand Identity:** Precision, Clarity, Restraint  
**Signature Motif:** Precision Crop Corners (`⌜ ⌝ ⌞ ⌟`), Measurement Ticks, and Tabular Metrics

---

## 1. Color Palette & Design Tokens

Design tokens are declared centrally in CSS custom properties and mapped directly into the Tailwind configuration.

| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--color-ink` | `#15233B` | Primary headings, authoritative wordmarks, dark accents |
| `--color-cobalt` | `#4463F5` | Primary action buttons, active toggles, focus indicators |
| `--color-lime` | `#C9F36A` | High-contrast brand accent for badges and subtle highlights |
| `--color-cloud` | `#F5F7FB` | Page body background and subtle card surfaces |
| `--color-white` | `#FFFFFF` | Cards, modals, tool dropzones, preview panels |
| `--color-slate` | `#657084` | Secondary text, captions, metadata labels |
| `--color-border` | `#E2E7F0` | Default card borders, separators, structural lines |
| `--color-border-strong` | `#CBD3E1` | Input outlines, active borders, drag-hover boundaries |
| `--color-success` | `#16815D` | Target Met state, successful file validation |
| `--color-warning` | `#B86D11` | Target Not Met warning, transparency loss alerts |
| `--color-error` | `#C43D4B` | Oversized file, unsupported format, decode failure |
| `--color-info` | `#316CB5` | Informational callouts and tool hints |

---

## 2. Typography

- **Heading Font:** `Manrope` (Weights: 600, 700, 800)
- **Body & Interface Font:** `Inter` (Weights: 400, 500, 600)
- **Numerals:** Tabular numbers (`font-variant-numeric: tabular-nums`) for all byte counts, dimensions, and percentages to eliminate layout jitter during recalculation.

### Scale Guidance
- **Hero Title:** 44px–56px, bold, tight line-height
- **Tool / Page Title:** 32px–40px, bold
- **Section Heading:** 24px–30px, semibold
- **Card Heading:** 18px–20px, semibold
- **Body Text:** 15px–16px, regular, comfortable reading line-height (1.6)
- **Helper / Meta:** 13px–14px, regular/medium
- **Metric Badges:** 12px–14px, semibold with uppercase tracking

---

## 3. Signature Motif & Brand Assets

The brand concept revolves around **image framing and precision measurement**:
- **Logo:** A stylized image frame enclosed by four crop-corner marks with an internal geometric fit indicator.
- **Corner Brackets:** Corner accents placed on upload dropzones and preview cards.
- **Measurement Ticks:** Subtle tick lines representing aspect ratio and scale precision.

---

## 4. Interaction & Motion Rules

- **Restraint:** Transition durations $\le 200\text{ms}$ with `ease-out`. No dizzying bounces or endless loops.
- **Accessibility:** Full support for `@media (prefers-reduced-motion: reduce)`.
- **Focus Rings:** Distinct 2px cobalt ring with 2px offset (`ring-2 ring-cobalt ring-offset-2`) for all interactive elements.
- **Touch-Friendly:** Minimum 44x44px touch targets on mobile viewports.
