# GreenLight K53

**Learn the rules. Practise your weak spots. Prepare with a plan.**

GreenLight K53 helps South African learner's licence candidates study road signs, rules and vehicle controls, practise questions, and review mistakes before test day. Learning, decision scenarios and mock assessments feed a shared progress and review journey.

[Open GreenLight](https://k53.skillcert.co.za) · [Run locally](#quick-start) · [Verification](REPOSITORY-VERIFICATION.md) · [Content review](CONTENT_AUDIT.md)

## Your learning journey

1. Choose the vehicle code you are preparing for.
2. Learn signs, rules and controls in focused sections.
3. Practise questions and use Drive scenarios to apply the same topics to decisions.
4. Review mistakes and revisit weak topics through the shared review queue.
5. Take a timed mock and use section results to plan your next session.

Drive is one practice format within the learning journey. It is not a replacement for studying the rules or an official driving assessment.

## What is included

| Area | What you can do |
| --- | --- |
| Learn | Study illustrated signs, road rules and code-specific vehicle controls |
| Practise | Answer questions and revisit mistakes |
| Drive | Work through decision scenarios connected to topic practice |
| Assess | Take rotating mock papers with section-level results |
| Recover | Resume an unfinished assessment with its original deadline and locked answers |
| Review | See shared progress, persistent mistakes and targeted follow-ups |
| Offline | Use cached study assets after initial loading and service-worker setup |

## Quick start

The application is static HTML, CSS and JavaScript. No npm packages, account or API keys are needed. Use Node.js 22 or 24 for checks, and Python 3 to serve it:

```bash
python3 -m http.server 3000
```

Open http://localhost:3000. Production installation needs HTTPS. Installation prompts depend on browser support and engagement; a prompt is not guaranteed on every visit. Study progress belongs to the current browser and origin.

Run the complete developer verification set:

```bash
node scripts/verify-all.mjs
```

The runner executes the same ten source/content/offline/recovery checks used by CI and exits unsuccessfully if any check fails. Browser acceptance remains separate; see `.github/workflows/verify.yml` and the existing browser scripts.

## Content and readiness

This is an independent study tool, not an official test provider or a guarantee of passing. Repository checks validate question structure, code scoping, scoring, persistence and content-review records. They do not establish complete coverage or qualified independent factual review. Simplified sign illustrations have recorded comparisons; this is not official artwork certification.

## Project guide

- [Fresh repository verification](REPOSITORY-VERIFICATION.md)
- [Content audit](CONTENT_AUDIT.md) and [source register](content-register.json)
- [Assessment and recovery evidence](VALIDATION.md) — dated historical checks
- [Decision practice](DECISION_PRACTICE.md) and [UI audit](UI_POLISH_AUDIT.md)
- [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md)

The canonical source branch is `master`. Current production equality, physical-device offline use and qualified independent content review remain release acceptance gates.
