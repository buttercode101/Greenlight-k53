# Decision practice integration — 18 October 2026

Decision practice is part of the existing GreenLight K53 static application. The existing Practise screen contains both section drills and road-decision/observation exercises. Home links to that same screen; lesson and practical-preparation shortcuts open the appropriate exercise directly. It does not introduce an iframe, React runtime, second application shell, account, backend or paid service.

## Shared product behavior

- Uses the existing brand header, typography, theme, buttons, install flow and read-aloud engine.
- Records namespaced `decision:S01` attempt rows in `k53ww_v2`, with explicit topic and light-vehicle code. Existing lesson, bookmark, code-specific and mock progress is preserved.
- Misses join the existing review queue. Full corrections follow its 1/3/7-day schedule. Observation-only cards remain complete sequence tasks when opened from shared Review.
- One progress and Review system serves all exercises. The separate practice landing page and XP interface have been removed. Legacy activity fields remain compatible in stored data. Decision performance now contributes to the main practice-readiness index; it never changes the mock pass thresholds or claims an official passing probability.
- Home and Practise both expose the same unfinished attempt. Player Back returns to Practise; catalogue Back returns to Home. `#practice`, `?go=practice`, and the older decision shortcut open the same catalogue. Exercise and resume links survive reload.
- Checkpoints use `k53-decision-active-v2` in session storage, including exact roster, shuffled choices, partial sequence, feedback and timer budget. Storage failure leaves in-memory practice usable.
- Pause, hidden pages, read-aloud and navigation confirmation freeze decision timers. Native dialogs contain focus and block background answers. Recovered answers remain locked and scoring is idempotent.
- One root service worker precaches the scripts, stylesheet, content register and all 53 illustrations. Versioned module/style requests bypass stale cache-first files without clearing study data. A single update control waits until the learner finishes or leaves an exercise before activating and reloading. Existing checkpoints and unrelated caches survive the update.
- If an accessible same-origin `gld-drive-v1` store exists, an explicit import moves known mistakes into shared Review once. Old XP is retained separately as legacy activity, never assessment evidence. Progress on another origin is not silently accessible.

## Readiness and next action

The main Code 2 practice-readiness index now combines the existing study/mock signal (80%) and selected decision evidence (20%). Topic accuracy uses the five most recent answers per decision where available, requires distinct examples (6 signs, 8 rules, 4 controls, 4 observation decisions for initial evidence), and exposes practised/attempted/unresolved counts. Unresolved decisions subtract two points each up to 15 and prevent the highest readiness band. A correction clears that penalty through the same Review schedule. These are transparent product rules, not calibrated estimates of official pass probability.

Home prioritises unresolved road decisions, then weak decision topics, then other due review. Signs/Rules/Controls lessons, their check results, section-drill results and mock/simulation results provide one-tap decision practice. Readiness and next-step calculations are tested from actual canonical state.

## Content

The same source-linked bank now feeds the existing section drills, sign-atlas action searches and mock/simulation pools. Code 2 section drills contain **112 sign questions**, **131 rule questions** and **37 controls questions**; these are question counts, not distinct sign-illustration counts. The three traditional pools gain 72 MCQs, and the mixed pool also supports five observation MCQs. Sequence tasks retain their full player. Mock rosters rotate through the wider pool while retaining the existing 28/28/8 practice structure.

82 selected light-vehicle cards: 28 signs, 34 rules, 10 observation and 10 controls. Five routes reuse these cards. The 20-question short study check has internal section targets and does not replace the existing full mock/simulation. Code 1 and Code 3 learners retain their existing lessons and drills; this bank is limited to Code 2.

The source data and checked locators are in `assets/decision/content-register.json`, referenced by the main register. Item hashes are enforced by CI. Qualified independent instructor review and physical-device acceptance are not claimed. This feature does not certify full-syllabus coverage or predict an official test result.

The port derives from the repaired `grok-workspace.zip` module. Its bank, engine, validated checkpoint logic and original schematic art were adapted into dependency-free browser modules. No Grok runtime or independent root manifest/service worker is installed in the host.

## Verification

Additional regression checks prove decision-driven readiness, unique coverage, recent performance, correction recovery, code isolation, 72 shared MCQs, all wider pool counts, canonical scoring and paper rotation. A browser run exercises an actual wrong decision → Home readiness penalty/weak-action → correction → readiness recovery, completes the original 112-question Signs drill, and follows its targeted practice link.


All existing repository checks pass, together with `scripts/verify-decision.mjs` (run by the existing `scripts/verify.mjs` CI entry point). The recovery test now reads the real section metadata rather than substituting shorter labels. This exposed and fixed the existing simulation checkpoint bug: section counts compared `Rules`/`Signs`/`Controls` to longer display labels, which prevented real saved simulations from resuming.

Successful merged-browser evidence is under `artifacts/decision-verification/`:

- 28 full-flow checks: all 82 cards, all seven presets and five routes; both themes at 320/390/480/768/834/1024/1440/1920 px; all 53 images decoded; disconnected host reload, module import and full drill; full 64-question simulations with locked-answer recovery for Codes 1, 2 and 3; zero uncaught page errors.
- 14 product-unification checks: one catalogue from all shortcuts, lesson-to-exercise-to-Practise flows, direct links, Home resume, and a real v23 → v24 cached-PWA upgrade with an unfinished attempt, preserved study history, blocked in-exercise updating and offline resumption.
- 13 regression checks: single shell, honest storage warnings, exact first-question recovery, focus/modal isolation, paused navigation, partial sequence recovery, assisted feedback, duplicate protection, denied storage, full observation review, code scope, idempotent legacy import, timeout behavior and no uncaught errors. Some result rows cover multiple related assertions.

Reproduce the dependency-free checks from the repository root:

```sh
node scripts/verify.mjs
node scripts/verify-content.mjs
node scripts/verify-offline.mjs
node scripts/verify-assessment.mjs
node scripts/verify-recovery.mjs
node scripts/build-content-register.mjs --check
node scripts/verify-review.mjs
node scripts/verify-signs.mjs
```

The optional browser checks require Playwright and Chromium in the development environment. Run `node scripts/verify-decision-browser.cjs`, `node scripts/verify-decision-edge-browser.cjs`, `node scripts/verify-unified-browser.cjs` and `node scripts/verify-readiness-browser.cjs` sequentially. The unified-browser script extracts baseline commit `f470ece` to a temporary directory to emulate an existing installation; that Git object must be available, or `K53_BASELINE_ROOT` can provide an extracted baseline. `CHROMIUM_PATH` selects an existing browser; `K53_EVIDENCE_DIR` selects an output directory. They start a local server on port 8085 and generate local evidence/screenshots. No test screenshots are committed. Browser checks use the encoded answer keys to verify software behavior; they do not replace the separate content review.
