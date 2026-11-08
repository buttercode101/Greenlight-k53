# Security Policy

## Reporting a vulnerability

If you discover a security issue in GreenLight K53, please report it
**privately** rather than opening a public issue:

- Email: **security@buttercode101.com**, or
- Open a GitHub private vulnerability report on this repository.

Include steps to reproduce, the impact you believe it has, and any
suggested fix. We acknowledge reports within 48 hours and aim to
resolve confirmed issues promptly. Please do not disclose the issue
publicly until a fix is available.

## Data handling

GreenLight K53 is a **static, offline-capable study app**. It has no
backend, no account system, and no analytics service.

- **Progress stays on this device.** Study results, mistakes, and
  bookmarks are stored in browser local storage on the learner's own
  device. Nothing is uploaded automatically.
- **Backups are explicit.** Exporting a progress backup creates a
  `.json` file you download and store yourself. That file contains
  your question-level practice history — share it only if you choose.
- **Restore replaces on-device history.** Restoring a backup
  overwrites saved results on that device; download your current
  backup first (the app says so on the restore screen).
- **No service worker secrets, no remote config.** The app's
  content ships in the deployed files; integrity is verified by the
  content register check in CI.

## Known limitations (not vulnerabilities)

- GreenLight K53 is an **independent study aid, not the official
  question bank**. Practice papers use an independent 64-question
  structure; learners should confirm current official test format and
  pass requirements with their driving licence testing centre.
- Clearing browser data deletes on-device progress; keep a backup if
  you switch devices.
- Content is selected practice material with source links; individual
  teaching claims await independent subject review, as stated in the
  app's coverage notes.

## Scope

In scope: the deployed web app, its static content, and the
verification workflows in this repository.

Out of scope: official NaTIS/DLTC services and manuals linked from
the app, and third-party hosts (Vercel, GitHub) except as they
deliver this repository's verified artifacts.
