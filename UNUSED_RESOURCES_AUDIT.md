# DealFlow AI — Unused Resources Audit
**Date:** 2026-06-14
**Scope:** Entire codebase

---

## 1. Unused JavaScript/TypeScript Components & Utilities
| File Path | Component/Utility | Notes |
|---|---|---|
| `components/immersive/OfflineIndicator.tsx` | `OfflineIndicator` | Not used in any layout or page |
| `components/experience/GestureLayer.tsx` | `GestureLayer` | Not referenced outside ExperienceChrome |
| `components/experience/PredictiveHighlight.tsx` | `PredictiveHighlight` | Not used |
| `components/experience/AROverlay.tsx` | `AROverlay` | Not used |
| `components/experience/OnboardingSpotlight.tsx` | `OnboardingSpotlight` | Not used |
| `lib/immersive3d/motion.ts` | `SPRING_SOFT` | Exported but only used in comments |
| `hooks/useScrollRetention.ts` | `useScrollRetention` | Used only in ExperienceChrome, but no-op |
| `lib/google-meet.ts` | All exports | No client or server code references it |

---

## 2. Unused CSS Classes/Styles
- `globals.css`: `data-banner-dismissed` selector (Banner not used)
- `components/immersive/...`: Classes for unused components listed above

---

## 3. Unused Static Media Assets
Check the `public/` directory:
| Asset Path | Notes |
|---|---|
| `public/icons/integrated-voice-camera-icon.svg` | Still used, keep |
| `public/sw.js` | Service Worker (only registered in production) |
| `public/images/` | All preview images used in metadata |

---

## 4. Unused Dependencies (package.json)
| Dependency | Version | Notes |
|---|---|---|
| `docx` | ^8.5.0 | Used only in scripts (optional) |
| `pdf-lib` | ^1.17.1 | Used only in scripts (optional) |
| `playwright` | ^1.49.1 | Test-only, keep if testing |

---

## 5. Orphaned API Endpoints
| Endpoint Path | Notes |
|---|---|
| `app/api/calls/create/route.ts` | No client-side references found |
| `app/api/calls/immediate/route.ts` | No client-side references found |
