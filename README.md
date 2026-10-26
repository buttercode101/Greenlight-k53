# GreenLight K53

**Learn the South African road rules. Practise the decisions. Walk into your learner's licence test prepared.**

GreenLight K53 is a South African learner's licence study and practice application. It brings road signs, road rules, vehicle controls, practice questions, mock assessments and progress review into one learning journey.

## The learning journey

1. **Learn** road signs, rules of the road and vehicle controls.
2. **Practise** questions and review mistakes.
3. **Assess** your readiness with mock tests.
4. **Review** weak areas and revisit difficult decisions.
5. **Prepare** for test day with a focused revision plan.

## Who it is for

First-time South African learner's licence candidates, returning candidates who want structured revision, and people who prefer mobile-friendly practice over a long study manual.

## What to verify before release

The repository includes implementation and validation notes. Those documents are evidence of prior work, **not a substitute for current production acceptance**.

- Confirm question coverage and correctness against authoritative South African K53 material.
- Check that progress persists across refreshes and that review queues reflect mistakes.
- Run complete mock tests, including interruption and recovery scenarios.
- Verify offline installation and use on supported mobile browsers.
- Inspect navigation, readability, overflow and touch targets at phone, tablet and desktop widths.
- Compare the deployed commit and configuration with the repository before declaring a release ready.

## Technical and audit documentation

- [UI polish audit](UI_POLISH_AUDIT.md)
- [Validation record](VALIDATION.md)

## Status

**Release acceptance pending.** The presence of tests or audit records does not establish physical-phone or live-production certification. Consult the current validation record for what was actually exercised.

## Contributing

Keep fixes small and evidence-based. Reproduce defects, add regression coverage where practical, and document remaining verification limitations. Do not treat test failures or incomplete browser coverage as passing.
