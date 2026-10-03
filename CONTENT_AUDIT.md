# GreenLight K53 content release ledger

Checked 3 October 2026. This ledger separates a source-area mapping from an independent review of each statement. The latter has **not** happened. The machine-readable [content register](content-register.json) lists every current teaching entry and its content fingerprint, official manual area, mapping date, review status, reviewer and review date. Reviewer and review date remain `null` until a real subject expert signs an entry. English is the only available teaching language; Afrikaans, isiZulu, isiXhosa, Sesotho and Setswana are distinct future work, not a combined or partial translation.

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

The app has 39 simplified sign illustrations, 10 marking descriptions, 44 base road-rule questions, 30 additional questions, 12 light-vehicle controls and 10 introductory controls for each motorcycle/heavy path. These numbers are selection sizes, **not** a claim of full official syllabus coverage. The topic checklist in the app directs users through rules, regulatory/warning/guidance/information signs, markings, signals, and controls. The full manuals remain necessary.

Every entry in the register requires a source passage or figure identifier, a qualified or accountable reviewer, a review date, and a checked explanation/decoy set before the app can describe that entry as independently reviewed. Legal changes, local formats, fees, booking availability, and real test questions require fresh official verification. No translation should be enabled until the full question/answer/lesson path has a separate fluent review in that language.

The app does not book tests, reproduce the official question bank, or guarantee a pass. The 64-question mode cites the published NaTIS minimum standards; a centre may use a different process, so users are sent to their DLTC to confirm.
