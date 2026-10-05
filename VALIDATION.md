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
