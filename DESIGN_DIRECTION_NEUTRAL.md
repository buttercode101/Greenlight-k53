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
