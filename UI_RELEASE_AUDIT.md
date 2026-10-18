# GreenLight unified UI release — 18 October 2026

## Reproduced and corrected

- Drive was labelled “Road decisions & observation”, placed below the dashboard and all study sections, and omitted entirely from the practice catalogue for Codes 1 and 3. Home now has a named Drive navigation action and prominent entry card. The single Practise catalogue puts Drive before section drills. For Codes 1/3 it explains the light-vehicle scope, retains the selected code and offers the appropriate section drills.
- Small screens: memory table cells exceeded the available width; back buttons and lesson actions were undersized. Shared border-box sizing, shrinkable columns, wrapping tables and at least 44px button targets correct these issues.
- Toolbar emoji rendered as missing glyphs in the audited browser. Inline SVG controls now cover read-aloud, install and theme actions.
- Theme switching rerendered Home from some practice views. It now updates the existing view without losing the active question.
- Long flashcard back: 339px of content inside a 218px face at 320px viewport. Both faces now contribute their natural height, keeping explanation and next controls separate.
- Shortcut routing depended on finding a button on Home after a delay; some shortcuts had no matching button. Declared shortcuts now call their actual view directly. `#drive`, `?go=drive` and legacy decision shortcuts open the shared practice catalogue.
- A saved attempts map containing a null row produced an empty app and “Cannot read properties of null (reading 'q')”. Startup now validates rows and container shapes while retaining valid progress.

## Security and updates

`vercel.json` enforces a hash-based script Content Security Policy, disallows inline event handlers, framing, plugins and form submissions, and adds nosniff, referrer and permission headers. Fonts are restricted to the existing Google Fonts hosts. Static print functionality uses event listeners. Script hashes are checked in CI; after intentional inline script changes run `node scripts/security-headers.mjs` and commit the generated configuration.

The root worker cache is `greenlight-k53-v26-polish`. Changed module/style entry points are versioned to bypass older cache-first asset responses. The worker and document use revalidation headers. Updating an existing installation preserves study history, its exact unfinished checkpoint and unrelated caches; an exercise must be finished or left before the user applies an update.

## Verification boundary

The optional Playwright product gate applies the actual security policy locally and covers 21 views, 11 viewport pairs and both themes (462 combinations), plus named Drive discovery, code scope, active-question theme switching, keyboard actions, longest flashcard fit, saved plan fields, 200% desktop zoom, malformed storage, injection blocking and printing. Screen sizes include 320px phones, tablets at 768/834/1024px, mobile landscape, 1366px laptops and 1920px desktops.

The existing browser suites separately verify all 82 decision cards, seven presets, five routes, 53 illustrations, shared review/readiness, three full code-specific simulations, denied storage, timers, exact recovery and a real older-worker upgrade followed by offline resume. Browser checks use test profiles and known answers. They are software verification, not evidence of learner pass-rate improvement or instructor certification. No physical-device or vulnerability-free guarantee is made.

Reproduce from the repository root with the existing `scripts/verify*.mjs` checks and the optional browser gates documented in `DECISION_PRACTICE.md`. `node scripts/verify-product-browser.cjs` starts its policy-enforcing server on port 8088; set `CHROMIUM_PATH` and optionally `K53_EVIDENCE_DIR` when needed. Screenshots are development artifacts and are not bundled into the application.
