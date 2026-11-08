# Greenlight-k53: Release Verdict

**Branch:** `flagship-excellence` @ `0313d51` (Reconnect full learning engine to live shell, Phase 5-7)  
**Live URL:** `https://k53.skillcert.co.za/`  
**Report generated:** Sunday, November 08, 2026 (SAST, UTC+02:00)

## 1. Live Reconnection Status

| Component | Status | Evidence |
|-----------|--------|----------|
| **Engine reconnection** | ✅ Reconnected — `scripts/verify-all.mjs` passes 10/10 | Full verification suite passes: security headers, content integrity, offline navigation, assessment deadline, recovery roundtrip, content register freshness, review gate, product evidence, sign gate |
| **Full app reachable from live URL** | ⚠️ Partial — preview shell at `k53.skillcert.co.za` serves 6-question diagnostic; full engine (295 entries, decision scenarios, mock tests, review queue) is deployed in repo but **not wired** from the production entry point | Live `index.html` (37,792 B) ≠ recovery-branch `index.html` (317,318 B). Zero references to `product.css`/`practice.js`/`serviceWorker` in live file (fetch-verified). Orphaned assets (`assets/decision/*`, `product.css`, 53 SVGs) return HTTP 200 but are never loaded. |
| **Service worker registration** | ❌ Unwired — preview `<head>` has **no** `<link rel="manifest">` and **no** SW registration | `sw.js` and `manifest.webmanifest` return 200 at their URLs but register nowhere in the preview flow |
| **Google Fonts dependency** | ❌ External — `fonts.googleapis.com` in CSP; cannot load offline | UX-03: offline claim unusable live; self-hosted Inter preferred (see §3) |
| **CSP compliance** | ✅ Security-headers hash verified; inline script hash matches | `vercel.json` `script-src` pins `sha256-` hash; all inline scripts verified |
| **`?go=` deep links** | ❌ Dead — preview ignores query string (`URLSearchParams`/`` location.search`: 0 hits) | UX-02: 4 deep links from `study-guide.html` (`?go=mock`/`?go=session1`/`?go=session3`/`?go=flash`) land on overview silently |
| **Offline navigation** | ❌ Non-functional live — SW not registered, Google Fonts blocks offline | UX-03; verify-offline.mjs passes only on merged build, not on preview shell |

**Net verdict on reconnection:** The learning engine is **reconnected in the repository** (verify-all 10/10, recovery branch `72dab5f` fully wired). The production URL `k53.skillcert.co.za` still serves the orphaned preview shell. The single highest-value fix is integrating the recovery-branch engine with the live design, as outlined in DESIGN_SYSTEM.md §8 (reconnection plan).

## 2. Font & Offline Notes

| Issue | Current | Required | Priority |
|-------|---------|----------|----------|
| **Inter font** | Google Fonts (`fonts.googleapis.com` + `fonts.gstatic.com`) — external dependency; blocks offline | **Self-host Inter** (woff2, precache under `/assets/fonts/`); drop Google origins from CSP `font-src` | P0 — required for offline PWA claim |
| **`font-display`** | Not set on Google-font request | `font-display:swap` on self-hosted woff2 | P0 — avoids FOUC, supports offline-first render |
| **`manifest.background_color`** | `#f6f5f4` (light gray) | Align to `--type-paper: #fffdf8` / cream canvas token (`#fffdf8` from DESIGN_SYSTEM.md colour system) | P1 — visual consistency |
| **`manifest.theme_color`** | `#0e8f3e` (from live) | Adopt `--accent:#08743a` (light) / `#76d39a` (dark) from DESIGN_SYSTEM.md colour canonical | P1 — theme consistency |
| **Sign SVG precaching** | 53 decision art files precached in `sw.js` CACHE; 39 register entries reviewed | Confirm `CACHE` bump (`greenlight-k53-v39-theme-contrast` → `…-v40-phase4`) and module query versions (`?v=36`/`?v=32`) bump together — mixed-release assets are the known failure mode (`CLARITY_REDESIGN.md:15`) | P0 — prevents stale sign assets after engine reconnection |
| **Offline navigation fallback** | None live (SW unwired) | `fetch` → navigations: network-first, cache copy on 200 OK, fallback `caches.match(req) || ./index.html`; assets: cache-first, runtime-put on 200 `basic`, `Response.error()` offline | P0 — mandatory for offline PWA claim |

**Font action:** Self-host Inter WOFF2 files and update `vercel.json` CSP `font-src` to `https://localhost` (or remove Google origins) before deploy. If self-hosting is not immediately feasible, note the limitation: *"Offline mode uses system font fallback; online connection required for Inter rendering"* — but this weakens the offline-first differentiator.

## 3. Release Verdict

| Criterion | Verdict | Detail |
|-----------|---------|--------|
| **Verification (10/10)** | ✅ PASS | `node scripts/verify-all.mjs` — all checks pass: security headers, content integrity, offline navigation, assessment deadline, recovery roundtrip, content register freshness, review gate, product evidence, sign gate |
| **Engine reconnection** | ⚠️ RECONNECTED IN REPO, NOT LIVE | Full engine (295 entries, decision scenarios, mock tests, review queue) is in the repo and verified; production URL serves orphaned preview shell. Integration required to make it live. |
| **Paywall / free access** | ✅ CONFIRMED | No paywall, no account required, truly free. Competitive benchmark confirms Greenlight-k53 is unique in this dimension among K53 prep products. |
| **Mobile responsiveness** | ⚠️ PARTIAL | Static CSS analysis shows gaps: no 360px/380px breakpoints, hero scene pushes content below fold (UX-11), `.chip` touch targets 32px < 44px target (UX-10), H1 size 44.8px vs full-app 26px cap. Render confirmation requires device testing. |
| **Accessibility** | ⚠️ DEFICIENT live, ❌ MISSING | Focus invisible, no reduced-motion opt-out, no live regions, sub-44px touch targets, emoji-only sign cards. Every a11y feature in `product.css` does not ship live. Honest status: live surface is less accessible than the full app. |
| **Sign learning differentiator** | ⚠️ FORFEITED live | Emoji-only text cards live; 39 registered SVG signs with NaTIS mapping are deployed but unreachable. Core visual differentiator is invisible on production URL. |
| **Claim honesty** | ✅ OVERALL HONEST | Product copy explicitly disclaims: not a complete syllabus, no exam readiness guarantee, six-question preview scope, offline not available in preview, progress not saved after reload. No invented demand. |
| **Deploy readiness** | ⚠️ CONDITIONAL | Ready to deploy **after** engine reconnection (P0) and font/offline fix (P0). Current state: repo-verified but production URL serves incomplete preview. |

**Final recommendation:** The `flagship-excellence` branch (0313d51) represents the **reconnected engine** — all 10 verification commands pass, the full learning journey is wired in the repo, and the design-system tokens are reconciled. To promote to production, integrate the recovery-branch shell (`72dab5f`) with the live design per DESIGN_SYSTEM.md §8, self-host Inter, bump SW cache and module query versions together, and re-run `scripts/verify-all.mjs` + browser suites before deploy. Without these fixes, the live URL continues to serve an orphaned preview that forfeits the product's core differentiators (free, offline, decision scenarios, illustrated signs).