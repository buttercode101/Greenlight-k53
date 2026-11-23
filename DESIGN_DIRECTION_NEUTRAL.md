# GreenLight K53 — Neutral UI redesign proposal

Status: design proposal only. No production UI, learning logic, content, storage, service worker, or assessment code has been changed.

## Design intent

Build a calm, confident learning workspace with the craft of a premium editorial product and the predictability of excellent everyday software. The global-neutral palette is the foundation; GreenLight's green is a purposeful action/status colour, not a decorative wash.

The interface must make three things immediately obvious:
1. Where am I in my preparation?
2. What is the most useful next action?
3. What evidence supports my readiness?

The design should feel distinctive through typography, spacing, information hierarchy, illustration quality and interaction detail—not through gradients, glass effects, excessive cards or motion.

## Proposed visual system

### Colour tokens — light
- Canvas: `#F7F8F6`
- Primary surface: `#FFFFFF`
- Raised/quiet surface: `#F0F2EF`
- Primary text: `#18211C`
- Secondary text: `#626D65`
- Subtle border: `#E1E6E1`
- Primary action: `#176B4A`
- Primary action hover: `#10563B`
- Success: `#217A52`
- Caution: `#94651C`
- Error: `#B6473E`

### Colour tokens — dark
- Canvas: `#111713`
- Primary surface: `#18211B`
- Raised/quiet surface: `#202B23`
- Primary text: `#F1F5F1`
- Secondary text: `#A8B4AA`
- Subtle border: `#303D34`
- Primary action: `#65B58A`
- Primary action text: `#102117`

Use colour semantically. Never communicate correctness, errors or progress by colour alone.

### Typography
- Keep the locally hosted Inter variable font for high legibility and predictable offline rendering.
- Use a compact, expressive display scale for page titles and key metrics; body copy remains calm and readable.
- Avoid all-caps labels as a default. Reserve uppercase micro-labels for small metadata only.
- Use tabular numerals for progress, timers and scores.

### Shape, spacing and motion
- 4px base spacing rhythm; 8/12/16/24/32/48px composition steps.
- 8–12px control radii; 14–18px for grouped surfaces. Avoid pill-shaped everything.
- Use borders and whitespace before shadows. Shadows are reserved for overlays.
- Motion is short, purposeful and interruptible. Honour `prefers-reduced-motion`.
- Minimum 44px interactive targets, visible focus, keyboard access and strong contrast.

## Information architecture

Preserve the existing product concepts and routes. The proposed primary destinations remain:
- Home — recommended next action and honest readiness evidence.
- Learn — structured signs, rules and controls lessons.
- Practise — targeted drills, weak areas, review and Drive.
- Mock — learning mock and timed simulations.
- Test Day — preparation checklist and local plan.

Drive remains a feature inside Practise, not a competing top-level destination.

## Home screen hierarchy

1. Persistent compact brand/navigation header; theme control is always discoverable.
2. Contextual welcome and a concise statement of the learner's next useful step.
3. One dominant next-action area with a clear action label and secondary context.
4. A readiness/evidence section that separates:
   - daily activity (effort),
   - topic coverage (what has actually been assessed),
   - readiness (the existing evidence-based model).
5. Three concise topic rows for Signs, Rules and Controls with their real state.
6. Resume/review links below the primary task, not competing with it.
7. Install/offline and update messages stay contextual, dismissible and never interrupt an active exercise.

The HTML prototype uses illustrative sample values only. They are not connected to a learner's saved progress and must never be mistaken for live data.

## Interaction principles

- One obvious primary action per view.
- Preserve the current question, answer locks, deadlines and progress when navigating or switching themes.
- Confirm before abandoning an active exercise; cancellation must leave it intact.
- Feedback appears adjacent to the answered question and receives keyboard focus.
- Loading, empty, error, offline, success and update states need deliberate designs.
- Never show a readiness percentage as a pass probability or imply that completing a daily goal means exam readiness.

## Engine-preservation boundary

This proposal is presentation-only. Before implementation, map every existing route, DOM contract, event binding, storage key, engine API, service-worker asset and deep link. Keep the current vanilla/static architecture unless evidence demonstrates a compelling need to change it. No framework migration or new runtime dependency is proposed.

Do not change:
- question banks, answer keys, assessment rules or scoring;
- learner state, local-storage schema or recovery semantics;
- code-specific content, review scheduling or readiness calculations;
- service-worker/offline guarantees, CSP/security headers or PWA install flow;
- URL routes, query shortcuts or browser history behaviour.

## Acceptance gates before production

1. Review this direction and prototype on phone and desktop.
2. Inventory and baseline the current routes, engine contracts, content and production assets.
3. Implement the new shell incrementally on a dedicated branch.
4. Run existing verification gates unchanged before adding new tests.
5. Add journey tests for every route, active assessment protection, reload/recovery, offline, theme, keyboard and reduced motion.
6. Inspect populated screenshots at 320, 360, 390, 768, 1024, 1440 and 1920px in light and dark.
7. Verify the preview deployment and source/asset hashes; do not promote to production until all critical checks pass.

## Prototype

Open `design-preview.html` on the branch preview deployment. It is a static visual concept with a working light/dark toggle; sample progress is illustrative only.


## Competitive and learner-acceptance evidence — 23 November 2026

This is a desk-research snapshot of public app-store listings and visible reviews, not a representative user study. Ratings and reviews change; store pages can also be incomplete or region-dependent. Treat repeated themes as product signals to validate, not universal preferences.

### Competitor landscape

- **K53 RSA Learners License (appworldsa):** Google Play listing shows 1M+ downloads and about 4.2 stars from 8K+ reviews. Its listing promotes 1,000+ questions, vehicle classes, instant results, past-test review and book content. Recent visible reviews praise similarity to the actual test, but also report app crashes/launch failures—including a paid user unable to open the app on exam day. This is a strong reminder that reliability is part of the learning experience, not merely engineering hygiene.
- **K53 Learners Driving Test (MSAYA):** listing shows 500K+ downloads and about 4.4 stars from 3.6K+ reviews. Its advertised strengths are 900+ questions, 25+ free mock tests, bookmarks, wrong-answer repetition and statistics. Those are category expectations, not differentiation by themselves.
- **K53 South Africa Pro:** its feature set includes road-sign/rules/controls learning, several test types and progress history. Public reviews complain about ads interrupting after very few questions, missing or incorrect marks, and difficulty reviewing mistakes. The question similarity is still praised. Avoid interruptions during a learning or exam flow; results and answer explanations must be dependable.
- **K53 Learners License Test SA (iOS):** visible App Store rating is 4.7/5 from roughly 437 ratings. A positive review specifically values immediate correctness feedback and sound; negative reviews mention paywalls appearing immediately after choosing a feature, freezes after entering a name and inaccurate language claims. The lesson is transparent access, optional audio and honest feature labels.
- **K53 Sharp:** its recent listing (updated 18 Nov 2026) promotes 1,000+ questions, 300+ signs, mock tests, flashcards, daily review, weak-area analysis, an AI coach, readiness score and optional Pro. The free core is explicitly positioned as usable for learner preparation. It is a fast-moving competitor; avoid copying its feature checklist. Compete on clarity, correctness, reliability and a more composed end-to-end learning journey.
- **K53 Examiner:** positions itself around a free question bank, illustrated guide, timed mock tests, progress tracking and offline access after content is viewed. Its store copy emphasises no paywall and no account requirement, indicating that low-friction access is an explicit competitive promise.

Sources checked:
- Google Play, K53 RSA Learners License: https://play.google.com/store/apps/details?id=com.learnersandlicense
- Google Play, K53 Learners Driving Test: https://play.google.com/store/apps/details?id=com.msaya.southafrica.driving.test
- App Store, K53 Learners License Test SA reviews: https://apps.apple.com/za/app/k53-learners-license-test-sa/id6683290656?platform=iphone&see-all=reviews
- App Store, K53 South Africa Pro: https://apps.apple.com/za/app/k53-south-africa-pro/id1091700792
- Google Play, K53 Sharp: https://play.google.com/store/apps/details?id=co.craftedbits.k53sharp
- Google Play, K53 Examiner: https://play.google.com/store/apps/details?id=app.k53examiner.twa
- Comparative category overview (publisher also lists its own product, so use cautiously): https://www.steerclear.io/za/best-driving-test-apps

### What the visible feedback suggests learners value

1. **Confidence that practice is relevant.** Learners praise question similarity and comprehensive coverage. Protect content accuracy and coverage; never sacrifice the engine for visual novelty.
2. **Immediate, useful feedback.** Explain why an answer is right or wrong, show the correct answer and make mistakes easy to revisit. A raw score without a useful review is not enough.
3. **A genuine free path.** Do not make the app look free and then block core actions behind a paywall. Keep essential learning, practice and mock-test access clear and usable.
4. **No interruption at high-focus moments.** No ad-like interruptions, surprise modals or unnecessary onboarding while answering questions or taking a mock exam.
5. **Reliability at the moment that matters.** Fast startup, resilient progress recovery, honest offline behaviour and no lost exam results are differentiators.
6. **Simple, legible, low-effort navigation.** Learners often study in short sessions on phones. Make the next action obvious, labels literal, tap targets generous and progress understandable without a tutorial.
7. **Control over learning pace.** Immediate feedback is helpful in practice mode; exam simulation must preserve realistic rules and avoid revealing answers until submission.
8. **Audio as an option, not an assumption.** Some users explicitly enjoy sound. Keep it controllable, muted by default where appropriate, and never make audio necessary to understand an answer.
9. **Honest claims.** Do not claim official status, language support, guaranteed passes, or complete coverage unless verified. Keep the independent-study disclaimer visible but unobtrusive.

### Design decisions now applied to the implementation direction

- The visual refresh must not introduce a paywall, mandatory account, ad placements, noisy streak mechanics or forced onboarding.
- Practice and mock flows retain distinct feedback rules: teach immediately in practice; preserve exam integrity in mock mode.
- The dashboard should make a next step and evidence-based progress legible, but not imply a probability of passing.
- The interface should work well at narrow phone widths first, while using desktop space for calmer, wider learning layouts—not simply stretching phone cards.
- Every important action needs a visible outcome; every failure needs recovery guidance; progress must survive refresh/offline conditions.
- The product should feel calm and trustworthy. The neutral palette is a design choice, not a claim that users universally prefer neutral colours; actual usability and accessibility testing decide whether it succeeds.
