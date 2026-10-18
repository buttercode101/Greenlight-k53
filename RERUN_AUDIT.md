# Hands-on audit rerun — 18 October 2026

Requested scope: repeat the product audit without TinyFish, exercise the interface, fix reproduced defects, and verify the release on the public app. No TinyFish service was called in this rerun.

GreenLight is one static, browser-based product. The verified story is Home → Learn → checks → shared mistakes → Review → targeted practice/Drive → readiness → learning mock or timed simulation. Progress is saved in the browser, not in a server account. Home, Learn, Practise, Review and Tests remain the primary hierarchy; Drive remains a feature within Practise.

## Reproduced findings and fixes

| Finding | Reproduction | Fix and verification |
| --- | --- | --- |
| Refresh returned to the wrong feature | Practise → Learn → refresh reopened Practise because `#practice` remained in the address | Navigation records the selected view. Lesson and hub refresh tests pass; accepted Drive links clear conflicting query routes. |
| Deep links discarded active quizzes | During a lesson quiz, change to `#practice/signs`; the card replaced the unfinished set without a prompt | One exit guard covers navigation, contextual Drive buttons and hash routes. Cancelling retains the question, saved attempts and original URL. |
| Inconsistent protection for short sets | Review and road-situation sets could be left without the warning used by lessons | Both participate in the shared short-set guard. Decision Review uses the player's saved-position dialog rather than a second prompt. |
| Keyboard focus was lost after answering/Next | Actual browser `document.activeElement` became BODY after replacing the question | New questions receive heading focus; submitted answers receive explanation focus. Tested in lessons, drills, Review, mocks and simulations. |
| Resume entry disappeared on a test-menu refresh | Preserving the current menu URL exposed the absence of a resume control on that menu | Both assessment menus show the saved-attempt control. Exact questions, locked answers and deadlines remain unchanged. Recovery appears below navigation. |
| Repeated sign mistakes were indistinguishable | Populated Review showed multiple “What does this sign mean?” rows without the signs | Repeated-mistake entries render safe local illustrations, including older attempt keys. |

The offline release uses `greenlight-k53-v29-navigation` and a consistently versioned module graph. Inline-script CSP hashes were regenerated. No framework replacement, product split, account migration or dependency installation was introduced.

## Local verification

| Evidence | Scope |
| --- | --- |
| `rerun-product-ui.json` | 506 rendered states: 23 views × 11 viewport pairs × light/dark; 11 interaction/security checks, including 200% CSS zoom, saved-markup injection, enforced CSP and printable-guide controls. |
| `rerun-learner-journeys.json` | 21 checks: all lesson checks, complete 112/131/37/20-question drills, 64-question learning mock, result PNG download, all vehicle-code controls, populated Review, flashcards, right-of-way, situations, planner and checklist persistence. |
| `rerun-navigation.json` | 13 additional journey checks and 48 populated layouts. Real attempts generate the data: completed lesson → due mistakes → all corrected → tomorrow's queue → reload; accepted/cancelled links, modal recovery, 12 Drive decisions and complete Code 1 pass / Code 3 failure mocks with locked-answer recovery. |
| `rerun-drive-flows.json` | 28 checks, including all preset routes, all 53 illustrations, offline practice and three complete 64-question simulations. |
| `rerun-drive-edge.json` | 13 checks for timing, exact checkpoints, observation sequences, denied storage, shared Review and migration. |
| `rerun-readiness.json` | 7 checks for real missed/corrected decisions changing readiness, all 112 sign questions and targeted mock follow-ups. |
| `rerun-unification.json` | 14 checks for aliases, learner links, safe service-worker updates, exact old checkpoints and offline recovery. |

Evidence lives in `artifacts/decision-verification/`. Core syntax, content, readiness, shared-bank, assessment, recovery, offline, source-register and security-header checks also pass. Browser scripts use actual Chromium clicks, native confirmations, dialogs, keyboard actions, reloads and downloads. Some existing regression cases deliberately seed edge-case storage. The new populated-layout journey does not fabricate learner progress. Correct-answer keys are read to produce deterministic pass/failure/recovery cases; this tests application behavior, not independent subject-matter accuracy.

## Production verification

Production source commit: `14f18d76d6b1fa10ea49a0f59e6b97d3b0271cc6`, deployed READY on the main public alias. GitHub workflow run [39097808323](https://github.com/buttercode101/Greenlight-k53/actions/runs/39097808323) completed successfully.

The public site passed all 21 learner checks and all 13 added navigation/recovery checks, including 48 populated layouts. A separate live pass verified 112 responsive states, shared readiness increasing from 0 to 5 after 12 decision answers, offline hubs, and no page or CSP errors. Fifteen public runtime files matched the tested local SHA-256 hashes; CSP, nosniff and frame-denial headers were present. See `rerun-live-release.json`, `rerun-live-learner.json`, `rerun-live-navigation.json`, `rerun-live-assets.json` and `rerun-release-status.json`. The subsequent evidence commit changes only reports and evidence; application bytes remain those tested in the source commit.

## Limits and remaining product work

This is browser interaction testing with Chromium and responsive/touch emulation, not testing on physical Android/iOS devices, Safari, TalkBack or VoiceOver. Printing is verified through its browser action and policy; a physical printer, spoken audio quality and an app-store install are not tested. No audit can establish universal absence of bugs or vulnerabilities.

Independent K53 subject review remains pending. The app is selected practice material, not the official question bank or full syllabus. Play Store publication, a controlled learner-outcome study, and claims of improved real-test pass rates are not completed by a UI release. NaTIS links that previously refused automated access remain explicitly unverified for automated access. No success claim is made for those areas.
