# ImageFit — Quality Assurance & Acceptance Checklist

Every release must verify this checklist across supported browsers (Chrome, Edge, Firefox, Safari).

---

## 1. Automated Checks

- [ ] `npm run lint`: Zero ESLint warnings or errors.
- [ ] `npm run type-check`: Zero TypeScript compile-time errors with strict checking.
- [ ] `npm run build`: Production bundle compiles cleanly without warnings or missing exports.

---

## 2. Core Functional Acceptance Scenarios

| Scenario ID | Test Condition | Expected Result | Verified In |
| :--- | :--- | :--- | :--- |
| **TC-01** | Valid JPEG via file picker | Decodes, displays dimensions, original size | Phase 2 |
| **TC-02** | Valid PNG with alpha transparency | Transparency preserved or honest flattening warning | Phase 2 |
| **TC-03** | Valid WebP input | Decodes properly | Phase 2 |
| **TC-04** | Drag-and-drop file upload | Dropzone highlights on dragover, accepts valid file | Phase 1 |
| **TC-05** | Unsupported file format (e.g., .exe, .pdf) | Rejection error badge with clear recovery instruction | Phase 1 |
| **TC-06** | Corrupted / truncated image file | Graceful error state; no application crash | Phase 2 |
| **TC-07** | Cancelled file picker dialog | Current state remains intact without reset | Phase 1 |
| **TC-08** | File exceeding maximum limit (50 MB) | Size limit error alert displayed | Phase 1 |
| **TC-09** | Extreme aspect ratios (panoramas / 1:10) | Responsive container containment; no overflow | Phase 1 |
| **TC-10** | Very small image (e.g. 16x16 px) | Handled cleanly without visual distortion | Phase 2 |
| **TC-11** | Oversized dimensions (> 16384 px) | Rejection / protective warning against Canvas DoS | Phase 2 |
| **TC-12** | Attainable compression target size | Bounded search succeeds; "Target Met" green badge | Phase 2 |
| **TC-13** | Unattainable target size | "Target Not Met" amber badge + resize recommendation | Phase 2 |
| **TC-14** | Unsupported output format in browser | Honest error; no mislabeled fallback | Phase 4 |
| **TC-15** | PNG to JPEG conversion | Clear alert that alpha channel is flattened to white | Phase 4 |
| **TC-16** | Download file verification | Output opens locally with matching MIME and extension | Phase 2 |
| **TC-17** | Reset and start-again | Clears memory, revokes object URLs, resets inputs | Phase 1/2 |
| **TC-18** | Rapid duplicate clicks | Throttled / debounced; no race condition | Phase 2 |
| **TC-19** | Mobile viewport layout (< 400px) | No horizontal scrolling; touch targets $\ge 44\text{px}$ | Phase 1 |
| **TC-20** | Keyboard-only navigation | Visible focus rings on all interactive elements | Phase 1 |
| **TC-21** | Prefers-reduced-motion | Motion disabled or simplified | Phase 1 |
| **TC-22** | Network payload inspection | Zero outbound image payload requests | Phase 1 |
| **TC-23** | Meta and Open Graph validation | Semantic titles, descriptions, canonical URLs | Phase 1/5 |
| **TC-24** | Production build preview | Fast first-contentful paint; no layout shift | Phase 1 |
