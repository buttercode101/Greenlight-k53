# GreenLight full application QA — 18 October 2026

## Current scope

The product remains one static, offline-capable application with one progress store, readiness model, mistake queue and install/update flow. This release polishes the existing Home / Learn / Practise / Review / Tests structure.

## Reproduced issues and fixes

| Finding | Result |
|---|---|
| Signs rendered all 39 cards and 10 markings in one long document | Searchable six-item pages, separate Signs/Markings selectors, responsive grids, optional memory aids, and a check available above the reader |
| Rules placed the check below the entire bank | Searchable eight-item pages, two-column comparisons on wider screens and a single reading column on phones |
| Growing review history produced an unbounded page | Eight-card pages, search, delegated removal on every page, and separate expandable saved/topic sections; retry still includes the full due queue |
| Test-date fields appeared after a duplicate learning route | Code and date/province first; learning-route and later practical preparation are available on request |
| Short lesson checks, drills and right-of-way sets could be discarded without warning | Explicit leave confirmation and browser-refresh warning; recorded answers remain in history |
| First-page speech buttons invoked the engine twice | Idempotent binding of speech controls, verified with an invocation counter |
| Wrong-answer feedback stayed hidden in topic drills and right-of-way practice | Both correct and incorrect choices reveal explanations |
| Right-of-way answers did not reach the canonical history/review queue | One recorded attempt per answer and shared mistake review for misses |
| Flashcards exposed both sides to assistive technology | Hidden answer side until flip, with keyboard support |
| Mock feedback offered a side exercise while the paper was still active | Keep answer rationale in place and offer targeted practice from the result instead |

Typography uses one Inter/system family, consistent question/button sizing, measured line height and restrained heading sizes. Comparable cards use grids; questions and instructional prose preserve their reading order.

## Measured scroll reduction

Measured in Chromium at a 390 × 844 CSS-pixel viewport, default content state:

| Screen | Before | After |
|---|---:|---:|
| Signs lesson | 15,316 px | 2,709 px |
| Rules lesson | 7,543 px | 2,227 px |
| Test plan | 2,522 px | 1,540 px |

All 39 signs, 10 markings and all code-specific rules remain accessible. Pagination does not award mastery; checks and scored practice still provide the evidence.

## Reproducible verification

- `scripts/verify-product-browser.cjs`: 23 views × 11 viewport pairs × both themes (506 screen states), plus navigation, keyboard, zoom, storage, CSP and print checks.
- `scripts/verify-learner-browser.cjs`: visible controls through every sign/marking page, rule search, all three lesson checks, all four complete topic drills (112/131/37/20 questions), a full learning mock, PNG result export, all-code controls, planner persistence, large review editing/search, flashcards, right-of-way, road situations, checklist and atlas/RHD views. It additionally asserts wrong-answer explanation visibility and canonical right-of-way attempts.
- Existing four browser suites: all 82 decision cards, seven presets, five routes, full simulations for all three codes, exact recovery, denied storage, shared readiness, correction and real older-worker upgrade/offline resumption (62 regression checks).
- Core `verify*.mjs`, content-register consistency and CSP hash checks remain required. No new runtime dependency is introduced.

Browser scripts use isolated test profiles and known answer data where exact software scoring needs verification. Optional Playwright/Chromium belong to the development environment. Set `CHROMIUM_PATH` and `K53_EVIDENCE_DIR`; the learner suite also accepts `K53_BASE_URL` to repeat the same journeys on the actual public deployment. The remote harness ignores the audit environment's intercepting proxy certificate; the application certificate/security policy is unchanged.

## Limits and blocked checks

TinyFish’s interactive browser agent was explicitly invoked but did not start: its wallet was negative (approximately −$0.72). Its free rendered-content service subsequently confirmed the public Home, Signs and Rules headings, navigation, and first-page counts (1–6 of 39 signs; 1–8 of 44 rules). This is a content spot check, not an interactive TinyFish audit pass. No physical Android/iOS hardware or audible-device speech acceptance was available; screen/device checks are real Chromium interaction at emulated viewport sizes. The speech counter verifies event binding, not audible pronunciation quality.

External reference requests were sampled separately. Government/RTMC references responded successfully; NaTIS returned 403 to automated requests, and its online portal returned a gateway error. These are recorded as blocked/unverified external availability, not proof that those sites fail for every learner. The application does not require those links for its core exercises. Instructor certification, full-syllabus completeness and real learner pass-rate improvement are not established by software QA.


## Published release checks

The same 21 complete learner journeys passed against the public production app, including the Share Result download. A separate public run verified 112 view/theme/viewport states, parent navigation, shared readiness changing from 0 to 5 after 12 decisions, and offline Home/Learn/Tests/Practise with preserved progress. Root HTML matched the tested source. These results are recorded in `artifacts/decision-verification/browser-learner-live.json`, `browser-live-ui.json` and `tinyfish-live-content.json`.

### 18 October 2026 — fresh hands-on rerun without TinyFish

See [RERUN_AUDIT.md](RERUN_AUDIT.md) for fresh browser journeys, populated responsive screens, reproduced defects and verification limits. This rerun fixes stale route refreshes, unguarded short-set deep links, lost question/feedback focus, inconsistent Review/situation exit protection, test-menu resume visibility and ambiguous repeated sign mistakes. The release updates the offline graph to v29. Previous TinyFish results above are historical and were not reused as evidence for this rerun.
