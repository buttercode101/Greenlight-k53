# Functional engine recovery — review only

This branch restores the earlier complete learning interface and is intentionally a draft. It does not combine that engine with the new premium design. Do not merge it as an implicit design rollback.

The earlier local audit branch was removed by workspace maintenance before publication. Its rendered HTML source was recovered exactly from the saved Playwright trace resource `GreenLight/layout/trace.zip` → `resources/329b2664c95f6f106e112e9c6a031c7ca16b71a7.html` (317,318 bytes). No guessed reconstruction of the HTML was used. The recovered script includes the checkpoint fix comparing opts[ans] before mutating migrated questions. Exact inline script CSP hashes were recalculated. Other repository assets remain as on current master.

Earlier audit evidence in the saved Four_App_Audit_Evidence_2026-10-27.zip records 22 learner checks, 13 navigation checks, 28 Drive checks, 250 layout states and seven automated accessibility scans. Those results describe the earlier audited source, not fresh certification of this new draft deployment. Source extraction and CSP hashes were checked now; the entire suite has not been rerun after reconstruction.

Review required: preserve the new design direction while integrating full question banks, Drive, progress, test scoring, install/offline flow and source-backed content. The live preview now accurately discloses missing features. Independent SA syllabus validation, physical-device capture/install and full release verification remain outstanding.
