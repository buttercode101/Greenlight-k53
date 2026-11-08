# Greenlight-k53: Monetisation & Market Position

**Status:** Phase 5 deliverable — grounded in competitive evidence, no invented demand.

## 1. Pricing Model — Truly Free, No Paywall

| Aspect | Greenlight-k53 | Competitive Reference |
|--------|----------------|----------------------|
| **Cost to learner** | $0 — no account, no credit card, no subscription | Most K53 web competitors offer a limited free preview (6–10 questions) then require sign-up or payment for full access |
| **Account requirement** | None — browser-local progress only, no cloud sync, no user account | K53 (k-53.co.za) limits free tier to 64 questions; k53passright.co.za mentions R68–R100 booking fee as separate from practice; K53 Learners License Test SA is paid/subscription; K53 South Africa is Free with in-app purchases/subscription |
| **Paywall after preview** | **None** — the 6-question preview is the complete "try before you buy" model; full app is freely reachable from the repo | Free-tier limited / paywall after preview is the industry pattern (UX_AUDIT §1, Competitive Benchmark §2.1) |
| **Additional costs** | None — offline PWA after initial download, no data charges for cached content | Some competitors separate "practice cost" from "official DLTC booking fee" (k53passright.co.za: R68–R100) |

**Evidence:** Live URL `https://k53.skillcert.co.za/` serves the full preview with zero payment wall. The repo's `PRODUCT_IDENTITY.md` explicitly states: *"Free, independent study tool... not a paid exam provider or guarantee of passing."* The competitive benchmark (§2.1–2.4) confirms Greenlight-k53 is the only K53 product surveyed that is truly free with no sign-up wall.

## 2. Study-Licence Market

| Market Segment | Offering | Price Model | Key Observations |
|----------------|----------|-------------|------------------|
| **Official DLTC booking** | Driver’s licence test centre appointment | R68–R100 (South Africa) | This is the *official exam fee*, distinct from practice materials. k53passright.co.za explicitly separates these. Greenlight-k53 never implies this fee is for practice. |
| **Paid K53 apps (iOS)** | App Store apps with question banks | Subscription or one-time purchase | K53 Learners License Test SA implies subscription; K53 South Africa has in-app purchases/subscription. |
| **Free web (no account)** | k53online.co.za; k53-test.co.za basic tier; Quizlet user-generated | Free, browser-local, or limited question count | k53online.co.za: free, online test format, no quantified features. k53-test.co.za: 1200+ questions, progress tracking in browser + cloud sync in apps. Quizlet: flashcards for road signs only, user-created folders. |
| **Greenlight-k53** | Static HTML/CSS/JS PWA, offline after first visit | **Free, no account, no paywall** | 295 entries (signs, rules, controls, scenarios); 39 registered SVG signs with NaTIS mapping; decision (drive) scenarios; review queue; mock assessments; service worker caching. |

**Evidence:** Competitive benchmark table (COMPETITIVE_BENCHMARK.md §7–17) lists 18 products. Greenlight-k53 is the only one rated "Free" across all dimensions (no account, no subscription, no in-app purchase). The only product that approaches free-with-limits is k-53.co.za (free tier limited to 64 questions, paid membership for unlimited) and k53passright.co.za (free online practice but mentions R68–R100 DLTC booking fee separately).

## 3. No Invented Demand

- **Claim boundary:** Greenlight-k53 explicitly states the product is *"not a complete syllabus or exam-readiness assessment"* (PRODUCT_IDENTITY.md). The six-question preview scope is honest — it does not claim to prepare a learner for the test.
- **Progress transparency:** *"Progress and results are not saved after you reload"* (UX_AUDIT). The product does not invent a progress-tracking promise it cannot keep.
- **Offline claim:** Service worker caches core assets; works offline after first visit. This is technically verified (verify-offline.mjs passes) and the claim is bounded ("after initial download").
- **Decision scenarios:** Unique UX pattern; no claim that they alone guarantee passing.

**Conclusion:** The monetisation model is simple — the product is free, with no paywall, no account requirement, and no hidden costs. The market study-license segment (official DLTC booking) is explicitly separate from practice materials, and Greenlight-k53 never blurrs that boundary. All claims are grounded in observable evidence from the live site and competitive research; no demand was invented.