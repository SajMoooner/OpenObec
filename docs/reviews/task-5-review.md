### Spec Compliance

- ❌ Issues found: the six agenda forms and full DTO field inventory are implemented, but the procurement edit flow silently changes an untouched valid deadline. See Important I1 at `packages/api-client/src/dates.ts:14` and `packages/ui/src/features/editor.tsx:53`.
- ✅ Three independent Next apps, per-app manual/Docker instructions and standalone images: `apps/citizen/package.json:6`, `apps/citizen/Dockerfile:1`, `apps/marketing/package.json:6`, `apps/marketing/Dockerfile:1`, `apps/office/package.json:6`, `apps/office/Dockerfile:1`, `scripts/dev/start-next.mjs:13`.
- ✅ Same-origin, no-store, fixed-zilina adapter; public read-only route allowlist, forced publication filtering, VZN/attachment authoritative parent checks: `packages/api-client/src/index.ts:80`, `packages/api-client/src/server.ts:10`, `packages/api-client/src/server.ts:44`, `packages/api-client/src/server.ts:55`, `packages/api-client/src/server.ts:63`, `packages/api-client/src/server.ts:83`.
- ✅ Six-agenda search with retained successful results, list pagination, detail related-cursor accumulation, office CRUD/publication/upload/retry flows and simulated IS are present: `packages/ui/src/features/citizen.tsx:26`, `packages/ui/src/features/list.tsx:35`, `packages/api-client/src/index.ts:121`, `packages/ui/src/features/detail.tsx:142`, `packages/ui/src/features/editor.tsx:67`, `packages/ui/src/features/attachments.tsx:40`, `packages/ui/src/features/settings.tsx:21`.
- ✅ Genuine Radix/shadcn primitives and local Geist imports, with IDSK3 confined to the semantic color theme: `packages/ui/src/components/button.tsx:1`, `packages/ui/components.json:1`, `packages/ui/src/styles/globals.css:3`, `packages/ui/src/styles/globals.css:44`.
- ✅ Approved marketing provenance, navy/skyline implementation, honest synthetic examples, contact limitation and proposed pricing: `.impeccable/mocks/marketing-navy.png.json:2`, `apps/marketing/app/home/hero.tsx:61`, `apps/marketing/app/home/hero.tsx:163`, `apps/marketing/app/kontakt/page.tsx:16`, `apps/marketing/app/vyhody/page.tsx:80`. Independent visual SHIP evidence is recorded at `.impeccable/review/finish-review.md:45`; it is visual evidence, not this code-quality verdict.
- ⚠️ Cannot verify from diff: backend transaction/persistence guarantees, all 70 REST implementations, unchanged launch orchestration, remote CI, and restart durability remain their owning tasks' gates. No runtime requests or test/build reruns were performed. Existing final logs show 13 client, 22 browser, 12 contract, 2 runtime and 4 smoke passes/all 70 fixtures; Java reports BUILD SUCCESS and the supplied three-app build log has no warnings. Java fault-injection WARN/ERROR output exists in `/private/tmp/openobec-final-java.log:711` and later; this is outside Task 5 and must not be described as universally pristine output.
- ⚠️ Cannot verify from diff: exact timing of craft-floor reads or historical initial RED runs; reports record these. Full coverage of Slovak glyphs by the imported latin-only Geist binaries was not independently confirmed (the available Python lacks fontTools); verify Latin Extended coverage separately if all glyphs must use Geist. No font change is prescribed on this incomplete evidence.

### Strengths

- Explicit public publication enforcement is server-owned and fails closed when the parent cannot be verified, rather than relying on visible UI controls: `packages/api-client/src/server.ts:63`.
- Related pagination follows every cursor, deduplicates nodes/edges and unions edge owners, with repeated-cursor protection and a behavioral test: `packages/api-client/src/index.ts:134`, `packages/api-client/test/client.test.ts:31`.
- Form/file failures retain dirty state and the created ID; successful files leave the retry queue. The real browser workflow checks same-ID retry and downloaded PDF byte hashes: `packages/ui/src/features/editor.tsx:83`, `packages/ui/src/features/editor.tsx:91`, `tests/e2e/publication.spec.ts:81`, `tests/e2e/publication.spec.ts:124`.
- Browser regression tests assert populated real destinations, readable responsive table geometry and actual detail navigation: `tests/e2e/review-regressions.spec.ts:18`, `tests/e2e/review-regressions.spec.ts:66`.

### Issues

#### Critical (Must Fix)

- None found in the reviewed Task 5 code.

#### Important (Should Fix)

- **I1 — Preserve an untouched procurement deadline exactly.** `packages/api-client/src/dates.ts:14` cuts every loaded instant to `YYYY-MM-DDTHH:mm`. `packages/ui/src/features/editor.tsx:53` initializes the procurement deadline using that truncated value, then `packages/ui/src/features/editor.tsx:73` serializes the entire form on every save. A valid existing `lehota_predkladania = "2026-07-01T08:30:45Z"` becomes input `"2026-07-01T10:30"`; changing only the subject and saving writes `"2026-07-01T08:30:00.000Z"`, silently moving the deadline 45 seconds earlier. Reconstructing an untouched wall clock during the autumn DST overlap can likewise select a different instant. Keep the original ISO instant for an unchanged deadline (or omit unchanged fields from the partial update), and retain seconds if the field is explicitly edited. Add a regression that edits another field with a seconds-bearing deadline and an overlap instant, verifies the submitted instant is unchanged, and still verifies intentional deadline edits use Bratislava time.

#### Minor (Nice to Have)

- **M1 — Normalize malformed JSON error envelopes.** `packages/api-client/src/index.ts:105` casts the parsed body and dereferences `.error` without first checking that it is a non-null object. An HTTP 503 with JSON body `null` throws a raw TypeError instead of the existing Slovak `ApiError` fallback; malformed `details` can similarly escape the declared shape. Validate the envelope before reading fields and add focused null/invalid-details cases beside `packages/api-client/test/client.test.ts:6`.
- **M2 — Correct the cookie-boundary claim in the implementation report.** `apps/office/app/api/[...path]/route.ts:6` proxies without checking a cookie; only the page layout checks it at `apps/office/app/(workspace)/uradnik/layout.tsx:6`. The implementation report's statement that the office API requires the demo cookie is inaccurate. The approved demo explicitly has no authentication/security boundary, so this is a documentation correction, not a request to add production authentication.

### Assessment

**Task quality:** Needs fixes.

**Reasoning:** The implementation covers the requested portal scope with clear shared features, genuine controls, real API flows and meaningful browser evidence. Silent deadline modification on an unrelated edit is a material data-preservation defect and blocks approval until corrected.

**Review boundary:** Reviewed the supplied `3d9e338..b1ec1c1` package in bounded passes, covering authored production/test/runtime files; sampled generated OpenAPI schemas for all six write DTOs and graph/selector contracts. Generated measurement HTML/JSON, lockfile transitive entries and raster evidence were not exhaustively audited. No changed source was separately reread. Focused reads outside the diff resolved named risks only: office cookie enforcement (office source search), query list pending semantics (`services/query-api/src/main/java/sk/openobec/query/QueryService.java:158`), and latin font import coverage (installed font CSS). Only this requested review artifact was written; no source, runtime, data or Git state was changed.


## Scoped re-review — fix round 1, b1ec1c1..882d947

### Finding Verdicts

- **I1 — Preserve an untouched procurement deadline exactly — ADDRESSED.** `packages/api-client/src/dates.ts:22` returns the original server string when its displayed local value is unchanged; seconds, six-digit fractions and either autumn overlap occurrence therefore survive unrelated edits without reconstructing the instant. The editor supplies its original record at `packages/ui/src/features/editor.tsx:73`, and DTO conversion passes the original datetime at `packages/api-client/src/agendas.ts:192`. Deliberate edits retain seconds/milliseconds (`packages/api-client/src/dates.ts:16`, `packages/api-client/src/dates.ts:39`, `packages/ui/src/features/editor.tsx:217`) and still pass through Bratislava conversion and spring-gap rejection. Covering tests assert original exact-string preservation and changed-value conversion at `packages/api-client/test/dates.test.ts:18`, `packages/api-client/test/dates.test.ts:26`, `packages/api-client/test/client.test.ts:108`; the three real-browser cases additionally read the authoritative API before/after an unrelated edit, a rejected gap edit and an intentional edit at `tests/e2e/deadline.spec.ts:12`.
- **M1 — Normalize malformed JSON error envelopes — ADDRESSED.** Non-null object guards now precede envelope/error access at `packages/api-client/src/index.ts:105`; details are filtered to records with string field/code/message, and scalar code/message/request_id use typed fallbacks. Null JSON, malformed details and malformed scalars have explicit assertions at `packages/api-client/test/client.test.ts:134`, `packages/api-client/test/client.test.ts:145`, `packages/api-client/test/client.test.ts:182`. Valid structured errors retain their prior path.
- **M2 — Correct the cookie-boundary claim — ADDRESSED.** The latest implementation report's Requirements and delivery section now says the office page layout checks the entry cookie and the office API has no authentication boundary, matching the source previously reviewed. No unnecessary authentication was introduced.
- **Font CannotVerify boundary — RESOLVED by supplied rendered evidence.** `.run/font-proof.json:1` records a single custom Geist font per requested weight (400/500/600/700), with no fallback font in the supplied Slovak-diacritic probe. The controller identifies this as actual Chrome CDP platform-font output for the full Slovak probe. The package CSS lacks a restricting unicode-range; the latin filename alone was not evidence of missing glyphs. No font fix is required on this evidence.

### New Breakage in the Fix Diff

- None found. The original-record parameter defaults to an empty object for existing callers; only datetime conversion uses it. Native input precision is explicitly milliseconds while untouched higher precision remains the exact original server string. Error-envelope normalization remains confined to failed responses and preserves HTTP status and valid fields.

### Out-of-Scope Observations

- None. Earlier backend/runtime/durability/remote-CI boundaries remain owned by their accepted task reviews and final whole-branch gate; this scoped pass does not reopen unchanged code or certify remote execution.

### Existing Verification Evidence Inspected

- Read the seven-file fix package and appended implementation report. Existing `/private/tmp/openobec-deadline-client-green.log` shows 20 passed / 0 failed; `/private/tmp/openobec-deadline-browser-green.log` shows all three exact-deadline cases passed in 3.6 seconds. Existing baseline RED evidence is recorded as 13 passed / 7 failures, with the unchanged baseline snapshot paths visible in `/private/tmp/openobec-deadline-client-red-final.log`. Covering test source verifies actual effects rather than merely the implementation structure.
- The report names successful typecheck, lint, all-three host builds, all-three Docker builds and healthy starts. Controller-supplied final integration evidence after the same edits reports 25 browser cases, 20 client cases and 4 smoke cases/all 70 fixtures green, refreshed 32 captures and accepted responsive/visual finish. These were not rerun in this review.
- No runtime requests, test/build runs, source edits, Git changes or subagents. Only this requested append to the review artifact was written.

### Verdict

**Fix round:** All findings addressed, no new Critical/Important breakage.

**Spec compliance:** ✅ Compliant for Task 5's reviewed scope, with the previously stated cross-task verification boundaries.

**Task quality:** Approved. The material data-preservation defect and malformed-error handling are repaired with targeted client and real-browser coverage; the report now accurately describes the demo-entry boundary. This is the authoritative Task 5 verdict after fix round 1; the earlier Needs fixes assessment is historical.
