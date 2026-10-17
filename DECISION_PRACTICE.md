# Decision practice integration — 18 October 2026

Decision practice is part of the existing GreenLight K53 static application. Open it from Home → Decision practice or Practise → Decision practice. It does not introduce an iframe, React runtime, second application shell, account, backend or paid service.

## Shared product behavior

- Uses the existing brand header, typography, theme, buttons, install flow and read-aloud engine.
- Records namespaced `decision:S01` attempt rows in `k53ww_v2`, with explicit topic and light-vehicle code. Existing lesson, bookmark, code-specific and mock progress is preserved.
- Misses join the existing review queue. Full corrections follow its 1/3/7-day schedule. Observation-only cards remain complete sequence tasks when opened from shared Review.
- Practice XP is activity only, stored under `state.decision`. It never changes lesson mastery, mock passes or assessment thresholds.
- Checkpoints use `k53-decision-active-v2` in session storage, including exact roster, shuffled choices, partial sequence, feedback and timer budget. Storage failure leaves in-memory practice usable.
- Pause, hidden pages, read-aloud and navigation confirmation freeze decision timers. Native dialogs contain focus and block background answers. Recovered answers remain locked and scoring is idempotent.
- The one existing service worker precaches the new scripts, stylesheet, content register and all 53 illustrations. Update activation follows the normal browser lifecycle rather than forcing an update during practice.
- If an accessible same-origin `gld-drive-v1` store exists, an explicit import moves known mistakes into shared Review once. Old XP is retained separately as legacy activity, never assessment evidence. Progress on another origin is not silently accessible.

## Content

82 selected light-vehicle cards: 28 signs, 34 rules, 10 observation and 10 controls. Five routes reuse these cards. The 20-question short study check has internal section targets and does not replace the existing full mock/simulation. Code 1 and Code 3 learners retain their existing lessons and drills; this bank is limited to Code 2.

The source data and checked locators are in `assets/decision/content-register.json`, referenced by the main register. Item hashes are enforced by CI. Qualified independent instructor review and physical-device acceptance are not claimed. This feature does not certify full-syllabus coverage or predict an official test result.

The port derives from the repaired `grok-workspace.zip` module. Its bank, engine, validated checkpoint logic and original schematic art were adapted into dependency-free browser modules. No Grok runtime or independent root manifest/service worker is installed in the host.

## Verification

All existing repository checks pass, together with `scripts/verify-decision.mjs` (run by the existing `scripts/verify.mjs` CI entry point). The recovery test now reads the real section metadata rather than substituting shorter labels. This exposed and fixed the existing simulation checkpoint bug: section counts compared `Rules`/`Signs`/`Controls` to longer display labels, which prevented real saved simulations from resuming.

Successful merged-browser evidence is under `artifacts/decision-verification/`:

- 28 full-flow checks: all 82 cards, all seven presets and five routes; both themes at 320/390/480/768/834/1024/1440/1920 px; all 53 images decoded; disconnected host reload, module import and full drill; full 64-question simulations with locked-answer recovery for Codes 1, 2 and 3; zero uncaught page errors.
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

The optional browser checks require Playwright and Chromium in the development environment. Run `node scripts/verify-decision-browser.cjs` and `node scripts/verify-decision-edge-browser.cjs` sequentially. `CHROMIUM_PATH` selects an existing browser; `K53_EVIDENCE_DIR` selects an output directory. They start a local server on port 8085 and generate local evidence/screenshots. No test screenshots are committed. Browser checks use the encoded answer keys to verify software behavior; they do not replace the separate content review.
