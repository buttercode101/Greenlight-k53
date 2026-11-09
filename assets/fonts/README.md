# Self-hosted fonts — GreenLight K53

These woff2 files are self-hosted copies of the Google Fonts stylesheets
previously loaded from `fonts.googleapis.com` / `fonts.gstatic.com`, so the
app works fully offline with no external font request.

## Files

| File | Family | Weight(s) | Subset | Bytes |
|---|---|---|---|---|
| `inter-var.woff2` | Inter | 400–700 (variable) | latin | 48,432 |
| `barlowcondensed-700.woff2` | Barlow Condensed | 700 | latin | 14,888 |
| `barlowcondensed-800.woff2` | Barlow Condensed | 800 | latin | 14,764 |
| `fonts.css` | — | — | — | @font-face rules, `font-display:swap` |

Weights match the app's usage: Inter 400/500/600/700 (body/UI) and
Barlow Condensed 700/800 (display headings).

## Source

Downloaded 2026-11-09 from the Google Fonts CSS API
(`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800&display=swap`,
latin woff2 URLs served from `fonts.gstatic.com`). Inter is served as a
single variable file covering 400–700, stored once as `inter-var.woff2`.

## Licence

Both families are licensed under the SIL Open Font License 1.1 (OFL) —
free to use, embed and redistribute, including commercially, with no
fee. OFL terms: https://openfontlicense.org

- Inter — designed by Rasmus Andersson, https://rsms.me/inter/
- Barlow Condensed — designed by Jeremy Tribby / The Northern Block,
  https://fonts.google.com/specimen/Barlow+Condensed

No modification was made to the font binaries beyond subset selection
(latin) as served by Google Fonts.
