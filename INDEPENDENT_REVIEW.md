# Greenlight-k53: Independent Review

**Status:** Phase 5 deliverable — honest status of responsive/mobile behaviour, verified against design system.

## 1. Responsive & Mobile Status Honesty

| Breakpoint | Live Preview (`index.html`) | Full App (Recovery Branch) | Status |
|------------|----------------------------|----------------------------|--------|
| `≥980px` | Single column; topbar chips + nav pills (duplicate nav, UX-09) | Dashboard 2-col (`1.35fr/1fr`); `decision-grid` 4-col; `decision-routes` 3-col; `signgrid` 2-col ≥801px | Live preview is **less capable** — missing full grid layouts |
| `701–1000px` | Not independently verified (no 700px rule in live CSS) | `signgrid` 2-col | Full app has explicit 2-col sign grid |
| `≤979px` | Dashboard stacks; readiness panel border-top | Dashboard stacks; readiness panel border-top | Match |
| `≤800px` | Library 2-col | Library 2-col | Match |
| `≤700px` | **No 700px breakpoint** in live CSS; hero H1 `clamp(2.8rem,6vw,5.1rem)` → min 44.8px; at 320px ~17 chars/line, 4-line wrap | `lesson-grid`/`review-grid` 1-col; `signgrid` 1-col (64px art, 2-col card) | Live preview H1 is **~70% larger** than full-app cap (26px vs 44.8px min); UX-11 |
| `≤600px` | Wrap `12px 16px 48px`; nav 5-col grid 12–13px; `decision-grid` 1-col; `.chip` ≈32px tall (below 44px target, UX-10) | Wrap `12px 16px 48px`; nav 5-col grid 12–13px; `decision-grid` 1-col; min 44px `.btn`/`.opt` | Feature parity on wrap, but live `.chip` is **non-compliant** (UX-10) |
| `≤480px` | Not independently verified | `practice-length` column; `coverage-table` 12px | Not verified live |
| `≤380px` | Not independently verified | `reader-pages` compact; signcard 56px art | Not verified live |
| `≤360px` | **No 360px breakpoint** in live CSS; decorative hero scene `min-height:420px` pushes content below fold; H1 min 44.8px | `wrap` gutters 12px; brand 12px; activity-meter ≤72px; signcard 56px art | Live preview has **no 360px rule**; hero scene UX-11 (P2) pushes content below fold |
| Landscape `max-height:500px` | Not verified | Compact header (36px buttons, 40px nav), `scroll-padding-top:100px` | Not verified live |

**Honesty statement:** The live preview deliberately caps its mobile experience at a 6-question diagnostic shell. The full app's responsive behaviour (breakpoints down to 360px, signgrid 1-col, practice-length column, reader-pages compact) exists in the repo (recovery branch `72dab5f`, `product.css`) but is **not reachable** from the production URL. The preview's mobile H1 is ~44.8px minimum (clamp(2.8rem, 6vw, 5.1rem)), roughly 70% larger than the full-app's deliberate 26px cap. No 360px or 380px breakpoints exist in the live file. The decorative hero scene (`min-height:420px`) and oversized H1 contribute to content being pushed below the fold on small screens (UX-11, P2).

**Note:** All mobile/a11y claims are **static CSS analysis** — no rendered browser pass was available in this environment (agent-browser CLI not installed). Render confirmments require physical device or emulated browser testing (UX_AUDIT §7, "What was NOT verified").

## 2. Accessibility Honesty

| Feature | Live Preview | Full App (Product CSS) | Status |
|---------|-------------|----------------------|--------|
| `:focus-visible` | **0 occurrences** — keyboard focus invisible (browser default only) | 7 rules, 3px accent outline | Missing live (UX-07) |
| `prefers-reduced-motion` | **0** — unconditional `html { scroll-behavior: smooth }` + hover animations | 3 blocks incl. global kill-switch | Missing live (UX-08) |
| Live regions (`aria-live`) | **0** `aria-live`/`role=status`; explanation appears silently | `practice.js`: 3× `role="status"`, focus-heading helper | Missing live (UX-07) |
| Focus management on view change | In-memory state reset; no `tabindex`/``.focus() calls | `practice.js`: focus `h1`/backbar title, dialog focus restore | Missing live (UX-07) |
| Touch targets `.chip` | ≈32px tall (below 44px target, UX-10) | `min-height:44px` global, 48px for `.btn`/`.opt` | Non-compliant live (UX-10) |
| Sign learning | 0 `<img>`/`<svg>` — emoji only; no families/search/flashcards | 39 registered SVG signs + family legend, search, flashcards | Differentiator forfeited live (UX-06) |

**Honesty statement:** Every a11y feature present in `product.css` (the audited design system layer) does not ship to learners on the live preview. The preview sacrifices accessibility for simplicity — focus is invisible, reduced motion has no opt-out, live regions are absent, and touch targets are sub-44px. The product copy honestly disclaims *"offline study [is] not available"* in the preview, and the same candence should extend to accessibility: the live surface is *less* accessible than the full app it replaced (UX_AUDIT §5, net verdict).

**Note:** Same disclaimer as mobile — all a11y claims are static analysis. Render confirmments require physical device or emulated browser testing.

## 3. Content Review Status

- **Machine-checked only:** `content-register.json` has 82 entries fingerprinted; 39 signs reviewed with source metadata; 28/34/10/5/77 denominators verified in `verify-content.mjs`.
- **No qualified independent item-level review:** Per PRODUCT_IDENTITY.md §"Open Risks" and Competitive Benchmark §73, no surveyed K53 product has item-level reviewer sign-off. Greenlight-k53 has open gate here.
- **Content gaps:** Full syllabus mapping, translations, qualified sign/rule/control review not yet conducted.

## 4. Sign Learning — Live vs. Full App

| Aspect | Live Preview | Full App (Recovery) | Status |
|--------|-------------|-------------------|--------|
| Sign representation | Emoji-only text cards, 0 `<img>`/`<svg>` | 39 registered SVG signs + 10 markings; family legend (stop/must/warn/info); search; flashcards; 6-per-page pagination | Core differentiator forfeited live (UX-06) |
| Progress ring | Hardcoded 68% on every sign card (identical across 3 occurrences) | Per-card `K.state.mastery[n]` or "Check not taken" | Misleading live (UX-05) |
| Shape/colour mapping | Not trained | Stop/Restriction (red), Instruction (blue), Warning (amber), Information (green) | Not trained live |

**Honesty statement:** The live preview reduces sign learning to emoji text cards, forfeiting the key visual differentiator that Greenlight-k53 is known for (registered, source-mapped SVG illustrations). The hardcoded 68% progress ring teaches learners to distrust progress UI (UX-05). The full app's sign atlas is deployed but orphaned — unreachable live.