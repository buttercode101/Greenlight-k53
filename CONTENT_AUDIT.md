# GreenLight K53 content release ledger

Checked 4 October 2026. This ledger separates a source-area mapping from an independent review of each statement. The latter has **not** happened. The machine-readable [content register](content-register.json) lists the question, sign, lesson-data, cockpit-tip and DLTC-checklist entries and its content fingerprint, official manual area, mapping date, review status, reviewer and review date. Reviewer and review date remain `null` until a real subject expert signs an entry. English is the only available teaching language; Afrikaans, isiZulu, isiXhosa, Sesotho and Setswana are distinct future work, not a combined or partial translation.

## Primary sources

- [National learner application and learner codes](https://www.gov.za/services/driving-licence/apply-learners-licence): Code 1 motorcycle, Code 2 up to 3 500 kg, Code 3 above 3 500 kg; application, validity, DLTC guidance.
- [NaTIS Rules of the Road manual](https://www.natis.gov.za/index.php/downloads/learner-driver-manual/rules-of-the-road).
- [NaTIS Road Traffic Signs manual](https://www.natis.gov.za/index.php/downloads/learner-driver-manual/road-traffic-signs).
- [NaTIS Vehicle Controls manual](https://www.natis.gov.za/index.php/downloads/learner-driver-manual/vehicle-controls).
- [NaTIS minimum DLTC requirements](https://www.natis.gov.za/index.php/downloads/general-documents?download=54%3Aminimum-requirements-for-registration-and-retention-of-grading-for-driving-licence-testing-centres): 28/28/8 with section minima 22/23/6.
- [Western Cape learner guidance](https://www.westerncape.gov.za/service/learners-licence): official manual links and local process; local fees must be reconfirmed.
- [Western Cape driving licence guidance](https://www.westerncape.gov.za/service/driving-licence-0): practical test is separate and tests ability for the vehicle class.

## Corrected in this release

- Removed a universal indicator-stalk direction claim. A learner must identify the controls fitted to the actual vehicle.
- Corrected light- and heavy-vehicle headlamp visibility wording to the official 150 m condition; added the motorcycle daytime headlamp requirement.
- Replaced unsourced fixed stopping-distance figures with a conditions-dependent explanation.
- Clarified the no-overtaking line's narrow official exceptions rather than teaching an absolute prohibition without context.
- Replaced two duplicate/unclear road-marking questions with the NaTIS stop line (RTM1) and yield line (RTM2).
- Restricted car-specific rule questions for motorcycle learners and Code B questions for other codes. Separate original control practice now exists for all three learner codes, with limited scope stated in the UI.
- Per-code mock status is isolated so changing codes cannot carry a previous code's controls pass into the new path.

## Coverage and release gate

The register now includes five cockpit tips and five DLTC checklist entries, in addition to the question and sign set. The app has 39 simplified sign illustrations, 10 marking descriptions, 44 base road-rule questions, 30 additional questions, 23 new rule scenarios, 35 sign scenarios, 15 code-specific control lessons, 15 shared control checks, 12 light-vehicle controls and 10 introductory controls for each motorcycle/heavy path. These numbers are selection sizes, **not** a claim of full official syllabus coverage. The topic checklist in the app directs users through rules, regulatory/warning/guidance/information signs, markings, signals, and controls. The full manuals remain necessary.

The sign atlas now filters by sign family and displays the register's code beside each of the same 39 illustrations. Six new diagram-backed sign decisions explain every choice and feed missed attempts into the existing review history. The road drawing is schematic and does not depict an exact junction layout. These six entries bring the register to 283. Their source mapping is to the signs manual as a whole; they still require item-level source passages and independent review.

The next release adds a six-concept focus view using the most recent five attempts per sign. Its “consistent recently” label requires at least three attempts, two distinct question wordings and at least 80% recent accuracy; it is deliberately not a full-syllabus readiness claim. Code 1, 2 and 3 have four original practical rehearsal steps each, mapped to the applicable NaTIS practical manual. These 12 steps bring the register to 295 entries. Their wording, sequence and vehicle-specific suitability still need a qualified practical instructor's item-level review. The practical guide is labelled as later driving-test preparation, separate from the learner's theory test. The test-day checklist saves self-reported confirmations locally; it does not verify bookings, fees, availability or documents with a centre, and changing date or province clears those confirmations.

Every entry in the register requires a source passage or figure identifier, a qualified or accountable reviewer, a review date, and a checked explanation/decoy set before the app can describe that entry as independently reviewed. Legal changes, local formats, fees, booking availability, and real test questions require fresh official verification. No translation should be enabled until the full question/answer/lesson path has a separate fluent review in that language.

The app does not book tests, reproduce the official question bank, or guarantee a pass. The 64-question mode cites the published NaTIS minimum standards; a centre may use a different process, so users are sent to their DLTC to confirm.

## Manual cross-check, 4 October 2026

- Replaced ambiguous yellow roadside line teaching with the named no-parking marking RM13 and its loading distinction from no-stopping RM12.
- Replaced an overly definite simultaneous four-way-stop answer with the manual’s earlier-arrival rule.
- Corrected temporary sign colour to yellow and expanded sign/marking scenarios on R1.2, RM10–RM14 and WM1–WM6, plus mini-circles and lane direction.
- Added original in-app control lessons for Codes 1, 2 and 3. This remains a selective guide, not a reproduction of the Department of Transport manuals.
