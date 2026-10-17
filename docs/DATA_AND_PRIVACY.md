# ImageFit — Data & Privacy Specification

**Core Principle:** Truthful, Client-Side Privacy by Design

---

## 1. Network Activity & File Lifecycle

1. **Local Processing:**
   When a user drags, drops, or selects an image file, the browser accesses it via `File` and `FileReader` / `createImageBitmap` APIs entirely within local memory (`RAM`).
2. **No Remote Uploads:**
   ImageFit issues zero `fetch` or `XMLHttpRequest` calls transmitting image binary data or filenames to any remote server or third-party service.
3. **No Unannounced Analytics:**
   No telemetry, image metadata, or personal identifiers are collected.
4. **Memory Management & Revocation:**
   Temporary Blob URLs generated for preview and download purposes are explicitly tracked and released using `URL.revokeObjectURL()` upon replacement, completion, or component unmount.

---

## 2. Policy Statements & Truth in Advertising

- **Never Claim "100% Private" Without Context:** ImageFit's privacy declaration accurately states: *"Your images are processed directly in your browser. Files are never uploaded to our servers or saved anywhere online."*
- **No Untrusted DOM Injection:** User-provided SVG files or metadata strings are never injected into the DOM as unescaped HTML. All renders use secure image tags, Canvas rendering, or text nodes.

---

## 3. Future Persistence Guidelines

If accounts or saved preference features are introduced in future releases:
- An explicit backend architecture plan must be submitted before provisioning database tables.
- Secrets and service keys must never be committed to repository code or bundled into client bundles.
- Ordered, reversible database migrations with Row Level Security (RLS) must be strictly enforced.
