# GreenLight validation — 5 October 2026

## Automated checks run locally

All passed:

- `node scripts/verify.mjs`: inline JavaScript syntax, routes, score keys, actual local icon/sign files and offline asset references.
- `node scripts/verify-assessment.mjs`: elapsed-time countdown, unfinished-section pass rejection, exit guard presence, storage failure and recovery signals.
- `node scripts/build-content-register.mjs --check`: generated register matches the current teaching content and review records.
- `node scripts/verify-review.mjs`: stale fingerprints, duplicate reviews, incomplete citations and unsupported independent-review claims are rejected.
- `node scripts/verify-content.mjs`: Codes 1/2/3 question pools, three paper rosters, question choices, diagram scenarios and register structure.
- `node scripts/verify-signs.mjs`: 39 in-use simplified illustrations have matching asset codes and recorded chart comparisons.
- `node scripts/verify-offline.mjs`: service-worker online refresh, offline navigation and cached sign asset behaviour in its test harness.

## Live browser checks

Tested the published assessment release at commit `44891309237da2ce6313f1bddc8bd35244ad4a39`:

- Started a timed Code 2 simulation.
- Tried to leave; cancelled the confirmation and retained the same question and running countdown.
- Completed all 64 questions through the user interface, deliberately selecting a mix of correct and incorrect answers.
- Choices became disabled after each answer.
- Result: 14/64, consisting of 3/28 rules, 7/28 signs and 4/8 controls; all three sections correctly marked not passed.
- Opened review: all 50 missed questions were present and ready for revision.

## Limits of this evidence

These checks do not certify factual completeness or independent human review. They do not establish official-test pass rates. The offline script is a service-worker harness, not an airplane-mode test on a physical phone. No full Android/iOS/tablet viewport matrix, assistive-technology audit, translation review or real-learner outcome study has been completed in this run. The remote GitHub workflow query returned no runs for the tested commit; local command results must not be described as a successful GitHub Actions run.

The new source disclosure, storage notice and review pipeline are included in the following release and require a live post-deployment spot check.

## Assessment recovery follow-up — 5 October 2026

Implementation commit: `2ce95e983ab97da1b07ded9b04fa71928e6b0f6a`.

- Both simulation and learning mock persist exact paper order, option order, submitted choices, position, vehicle code and the original deadline.
- Home offers resume or explicit discard. Starting another assessment asks before replacing an unfinished one.
- Submitted answers stay locked after recovery and are not counted twice. Expired attempts finish without accepting late answers or resetting time.
- Question text and choices are escaped; restored artwork is restricted to local sign asset paths.
- `node scripts/verify-recovery.mjs` exercises real assessment functions in a minimal DOM harness: both modes after an answer, pre-answer refresh, full learning-mock section break, original deadline, duplicate-score protection, invalid checkpoint rejection and late-answer rejection.
- All eight local verification commands passed. This is developer-harness evidence, not live-browser or physical-device evidence.
- Vercel rejected deployment of this commit at 2026-10-05 05:59 UTC with `Deployment rate limited — retry in 24 hours.` No deployment/alias promotion or live recovery verification is claimed.

Remaining release checks: after the provider permits deployment, verify recovery and bookmarked artwork visually in the deployed app; run Android/iOS/tablet layouts and assistive technology checks. Content completeness, 294 remaining item source checks, qualified independent review, translations and outcome studies remain open.

## Production reconciliation — 6 October 2026

Canonical source branch: `master`.

- The earlier review deployment at `d044f760...` was an ancestor of the actual source head, not the final release candidate.
- The six later commits through `8d89c44...` contain bookmarked-sign restoration and assessment-recovery work and must be included in the production artifact.
- Fresh source hardening at `d8852f6...` adds regression checks around official-test boundary language and learner-licence validity disclosure.
- Release certification must bind the deployed artifact to the current `master` SHA. An older passing deployment must not be described as current production evidence.
- Current official South African Government guidance still states learner licences are valid for 24 months and cannot be extended; Codes 1/2/3 remain the learner-licence categories described by government guidance.
- Content completeness, qualified independent review, translation review and real-learner outcome evidence remain explicitly open and must not be inferred from engineering verification.
