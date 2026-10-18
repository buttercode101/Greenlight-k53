# GreenLight interface refinement — 18 October 2026

## Direction implemented

Cream remains the canvas, sage marks learning feedback, and a deeper solid green identifies the main action. One shared header carries **Home | Learn | Practise | Mock | Test Day** throughout the product. The active destination uses a green underline. Review stays accessible through the Home next action, the preparation links and Practise; Drive remains inside Practise.

**Home:** one next-action area and one evidence panel share a single grouped surface. Plain dividers replace the four equal-weight floating cards. Topic rows state whether Signs, Rules and Controls have been assessed. “Set your baseline” replaces “Just starting.” The readiness index still reflects the existing evidence model and is explicitly not a pass probability.

**Progress:** the header now shows a transparent ten-answer daily focus goal. Each newly recorded answer advances it immediately, including wrong answers: it measures effort. Disabled double submissions do not advance it. It persists across reload and starts a new local-date goal without removing learning history. Existing history is not retroactively counted as today's effort. This activity goal is intentionally distinct from readiness; simply doing ten questions does not imply test readiness.

**Road Signs:** all 39 signs and ten markings remain available. Six signs are visible per step, with two or three columns when space permits and a compact illustrated list on phones. Continue is the main progression action, and the last group offers Start check. Search, audio, memory aids and official references remain. The check can also be started from the lesson header.

**Question and feedback:** one type scale, restrained eight-to-twelve-pixel radii, solid primary actions and outlined secondary actions. A correct choice receives a check mark and green border; its explanation begins “Correct.” Feedback receives focus, and new questions receive heading focus. The short confirmation animation respects reduced-motion settings.

**Updates:** a waiting update appears in document flow below the header, with an explicit action and dismissal. It is hidden during an exercise. No update applies automatically or abandons an active question. The entire offline module graph uses v30 to prevent mixed-release assets.

## Evidence

The browser scripts physically click controls, complete sets, trigger native confirmations, reload exact saved papers and check persisted results. The release includes refreshed evidence under `artifacts/decision-verification/clarity-*.json`:

- 506 responsive states and 11 UI/security checks, including phone, tablet, desktop, landscape, both themes and 200% CSS zoom.
- 48 populated states and 13 navigation/recovery checks.
- 21 complete learner checks, including 112/131/37/20-question drills, lesson checks, a complete learning mock, result download and all vehicle codes.
- Seven redesign-specific checks: the permanent labels, six-sign steps, daily-goal increments and duplicate protection, next-date reset, Test Day/Mock active states, inline update hiding and reduced-motion feedback.
- 62 Drive, storage-edge, shared-readiness and offline-upgrade regressions, including three complete 64-question simulations.
- Core syntax, content, bank, assessment, recovery, security-header, offline and content-register checks.

The daily activity and readiness distinction is deliberate. It fixes a lesson-only progress indicator that ignored most practice while retaining honest readiness gates.

## Limits

Responsive and touch behaviour is tested in Chromium. Physical Android/iOS hardware, Safari and assistive-technology devices are not certified by these checks. Independent K53 subject review is still pending. This redesign does not turn selected practice material into the official question bank or a complete syllabus.

The release reconciles the overlapping navigation changes in `05410b4` and `99a529e`. Their Test Day route handling is retained; their inline visual overrides are superseded by the shared, verified design system.

## Published verification

Source release `a92983c` is deployed READY on https://greenlight-k53-review.vercel.app/. The public app passed all seven design checks, all thirteen added learner/recovery checks (with 48 populated layouts) and the complete 21-check learner suite. All fifteen runtime files matched their tested SHA-256 hashes. Offline checks completed sign paging, a lesson answer, a Drive answer and an exact revealed-card reload with the daily activity count preserved. GitHub [CI run 39109827486](https://github.com/buttercode101/Greenlight-k53/actions/runs/39109827486) succeeded. Public evidence is saved as `clarity-live-*.json` and `clarity-release.json`. The following evidence-only commit changes reports and evidence, not application source.
