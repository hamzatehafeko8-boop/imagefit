# ImageFit — Architecture & Technical Plan

**Canonical Repository:** Local production root (`C:\Users\PC\Downloads\imagefit`)  
**Core Framework:** Next.js 16.4.2 (App Router, Turbopack) + React 19.3.1 + TypeScript 5.9 + Tailwind CSS  
**Processing Engine:** Client-Side Browser Canvas 2D & Web APIs  

---

## 1. Architectural Decisions

1. **Next.js App Router for Public Tool & Content Federation:**
   Next.js App Router allows server-rendered static and SEO-optimized pages for public landing pages, guides, metadata, and sitemaps, while hosting rich, stateful, 100% client-side components for the interactive image tools (`"use client"`).
2. **Pure In-Browser Client-Side Processing:**
   All image decoding, bounded quality search, canvas operations, and format encodings happen directly within the user's browser memory. No image payloads are transmitted across the network, ensuring complete privacy, zero hosting egress costs, and offline/instant execution.
3. **No Database in Initial Release:**
   The product requires no user accounts, sessions, or backend database in Release 1. All tool configurations, presets, and guides are managed in version-controlled application code.

---

## 2. Directory Layout

```text
imagefit/
├── app/
│   ├── layout.tsx                     # Global layout, fonts, meta
│   ├── page.tsx                       # Homepage (Milestone 1)
│   ├── tools/
│   │   ├── image-compressor/page.tsx  # Compressor tool page (Milestone 2)
│   │   ├── image-resizer/page.tsx     # Resizer tool page (Milestone 3)
│   │   └── image-converter/page.tsx   # Converter tool page (Milestone 4)
│   ├── guides/
│   │   ├── page.tsx                   # Guide index (Milestone 5)
│   │   ├── reduce-image-size/page.tsx
│   │   └── image-dimensions-and-aspect-ratio/page.tsx
│   ├── about/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── contact/page.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── brand/                         # Original SVG Logo and Brand Mark
│   ├── layout/                        # Header, Footer, MobileNav
│   ├── upload/                        # UploadDropzone & FileStatus
│   └── ui/                            # Buttons, Badges, Cards
├── lib/
│   ├── constants/                     # Presets, limits, supported MIME types
│   ├── utils/                         # File formatting, size calculations
│   └── image-processing/              # Compressor, resizer, converter engines
├── docs/                              # Project architecture, specs, QA
└── public/
    └── icons/                         # Favicons and web app manifests
```

---

## 3. Data Flow & State Machine

Every interactive tool follows an explicit typed state machine:
```text
[ idle ] ──(file selected)──> [ validating ] ──(pass)──> [ ready ]
                                    │
                                 (error)
                                    ▼
                                [ error ]

[ ready ] ──(start process)──> [ processing ] ──(Blob measured)──> [ result ]
                                                                       │
                                              ┌────────────────────────┴────────────────────────┐
                                              ▼                                                 ▼
                                     [ target_met: true ]                              [ target_met: false ]
```

---

## 4. Coding & Clean Evolution Guidelines

- Use explicit TypeScript interfaces; avoid `any`.
- Never mutate state in place or leak Object URLs (always invoke `URL.revokeObjectURL` on cleanup).
- Separate presentation components from core image-processing mathematical logic to enable easy unit testing.
- Maintain documentation integrity: every material change must be reflected in `docs/CHANGELOG.md`.
