# Sign verification — study illustration release check

The 39 in-use SVGs were visually compared at study scale with the National Department of Transport sign chart, with sign codes and review notes recorded in `register.json`. This comparison validates recognisable shape, colour, pictogram, orientation and code for simplified learning illustrations. It does not make these SVGs official sign artwork or certify exact dimensions.

The original placeholder audit is superseded by redrawn SVGs and `register.json`. Three discarded assets remain outside the app's sign bank; do not reintroduce them without review. The comparison corrected the steep descent code from W323 to W322 and the parking board category to reservation.

Authoritative reference: [SARTSMA, South African Road Traffic Signs Manuals](https://www.sartsma.co.za/saroadsignsmanuals). Volume 1 describes regulatory, warning, guidance, information, traffic signal and marking meanings; Volume 4 provides scalable drawings. Match each file to the specific manual sign code and figure. Record the code, source page, date, reviewer and visual comparison before clearing it.

`node scripts/verify-signs.mjs` checks register coverage, review evidence, code labels and placeholder patterns. Keep the chart and Volume 1 meaning comparison current when changing an illustration, question or answer. Test the 28-question signs section and offline images after changes.

The drawings are explicitly simplified. Do not present them as exact traffic-sign fabrication artwork.
