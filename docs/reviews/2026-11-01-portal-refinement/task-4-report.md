# Task 4 — realistic fictional records and useful PDFs

Base: `15f669ebd92b55a76d4972acd263551ba372dc4f`. Implemented without database reset, record adoption, backend changes, new startup dependencies, subagents or external publishing. Root research documents remain untouched/uncommitted.

## Delivered

- Deterministic `scripts/seed/realistic.py`: 12 natural titles/numbers per agenda, varied exact decimal amounts and 2026 dates; 8 published/4 concepts per agenda. Issued invoices describe customers/income or cost reimbursement, distinct from supplier costs. No supplier ICOs, personal data, signatures or fabricated seals. First two contracts retain four links each: library refurbishment and park tree planting. Late open procurement calls explicitly concern a new 2027 phase, distinct from earlier contracted work. Published contracts match all citizen examples `knižnice`, `stromov`, `osvetlenia`.
- `generate_pdfs.py`, 72 committed one-page PDFs with embedded Liberation Sans/Slovak diacritics and actual catalog party/date/amount data, plus a small fictional footer. Generator is development-only; ordinary seed uses standard-library reads. ReportLab invariant generation is deterministic. Generator supports arbitrary invoice payload/number for the future showcase.
- Explicit read-only `--refresh-realistic` and opt-in `--apply`: only supplied manifest IDs; exact complete legacy editable-field/relation proof and known original filename/hash; pre-mutation source/file-metadata backup; resumable per-record progress; upload replacement before retiring only the exact old fixture file; SHA-256 deduplication; strict post-backup/version checks; unrelated files and uncertain/missing/user-edited records preserved. Ordinary reruns do not rewrite existing IDs, source edits or deletions. Manifest records content version and full source baseline.
- Both marketing screenshots refreshed from actual fully loaded product pages; provenance updated. Capture now waits for 72/24/48 totals and loaded contract/PDF/relations. Natural static caption “Snímka ukážkového prostredia”; global demo/fiction disclosures remain. Marketing frontend rebuilt alone with `--no-deps`.

## TDD and checks

RED:
- New runtime catalog tests failed with missing `realistic` module, then missing committed PDFs before generation.
- New migration tests failed with missing `refresh` module before implementation.
- Added exact VAT check initially exposed test Decimal's default half-even vs specified monetary half-up rounding; corrected test to require explicit `ROUND_HALF_UP`, matching the catalog.

GREEN:
- `python3 -m unittest discover -s tests/runtime -p 'test_*seed*.py'`: 6 passed (catalog invariants and existing projection semantics).
- `python3 -m unittest discover -s tests/integration -p 'test_seed*.py'`: 10 passed at that revision: existing acceptance/preservation, migration mocks and live owned temporary fixtures. Added one further narrow-exception negative test afterward; final `PYTHONPATH=tests/integration python3 -m unittest test_seed_refresh.RefreshTests`: 7 passed (all offline migration cases). Combined current suite has 11 tests; unchanged live checks were not needlessly repeated after the additional offline-only case.
- Migration tests cover identity/graph retention, extras, edited fields/relations, missing/unknown original PDF, interruption after upload and lost update response, subsequent source edits, original attachment replaced while paused, exact restored legacy-version exception, and rejection of modified attachments even for the exception. Live fixture test creates six namespaced IDs, preserves a source edit/deletion/extra file, waits query projection, proves repeat migration and ordinary seed leave sources/files unchanged, and cleans up only its own IDs.
- `pnpm typecheck`, `pnpm lint`: passed. `pnpm test:frontend`: 23 passed with elevated IPC access (initial restricted invocation failed EPERM before tests; no test failure).
- Browser: `pnpm exec playwright test tests/e2e/portal.spec.ts tests/e2e/review-regressions.spec.ts tests/e2e/marketing.spec.ts`: 20 passed. `pnpm exec playwright test tests/e2e/browsing-ux.spec.ts tests/e2e/publication.spec.ts`: 12 passed. Real readable searches/numbers, all six agenda semantics, responsive/context checks and disposable create/link/PDF/publish/search/edit/unpublish remain intact.
- All 72 PDFs reopened with pypdf: one page, extractable Slovak text and fictional footer, no replacement glyph. Rendered and visually inspected invoice, procurement and VZN with Poppler. No clipping/overlap/glyph issues. Both final product PNGs inspected; first temporary office capture revealed partial loading and was replaced after hardening capture readiness.
- `git diff --check`: passed. No unchanged Java suites rerun.

## Live migration and ownership evidence

Initial preview, complete payload/ref/owned-PDF proof, then controlled application through source APIs only. Backup:

`.run/seed-manifest-before-realistic-20261101T191911552390Z.json`

Progress:

`.run/seed-manifest-realistic-progress.json`

The source timestamp in the old manifest was not treated as sufficient proof: complete legacy payload reconstructed by `legacy_payload`, exact original relation graph from manifest-owned IDs, and original PDF bytes/filename/SHA-256 all checked. First two contract graphs each resolve five nodes after migration. All 72 IDs match the pre-migration backup, each record has its single exact committed replacement PDF, source/query versions caught up via Kafka, and no extra live records remain after disposable-fixture cleanup. No number-based adoption or reset.

One original invoice, `fak_1f75c3a0-1859-4ecc-b7a4-a1d7e8f0a6c3` (index 11), had source version 3 with exact restored legacy payload/ref/PDF. Initially skipped by conservative version proof. Controller explicitly authorized this one exact restored fixture based on full content ownership proof and requested backup of its current version/time; narrow allowlist exception does not relax resumption/new-content version protection, or allow differing fields/files. It migrated to version 4, `FV/2026/0052`. At the end of migration **72 complete, 0 preserved, 0 missing**; complete 72-source/PDF/graph/query/no-op verification passed before any later edit.

A later external edit at `2026-11-01T19:25:07.313944716Z` changed this same invoice to version 5: DPH `38.13` → `38.14`, total `203.93` → `203.94`, optional customer `ico: null` added. Executed tests use UUID temporary IDs and have no writes to this owned ID; no ownership evidence for the later change. Controller ruled to preserve it as a user's edit. **Final state: 71 baseline-exact complete, 1 later edit preserved, 0 missing; all 72 identities and PDFs retained.** Ordinary seed and explicit refresh leave version 5 and its files unchanged. Existing PDF remains the matching pre-edit fixture (`165.80 + 38.13 = 203.93`); it is deliberately not silently replaced after a user edit. The final screenshot was captured before that edit and still truthfully shows 72/24/48 with the same visible title; no image adjustment needed.

Evidence logs: `/tmp/task4-preview.json`, `/tmp/task4-apply-final.json`, `/tmp/task4-verification.log`, `/tmp/task4-final-verification.log`. Full verification script: `/tmp/task4-verify.py` (read source/query/files, compare all IDs and bytes, explicitly preserve version 5, verify ordinary and explicit reruns). One initial unpaced exhaustive check hit gateway 429; repeated with pacing/retries and completed. No application rate-limit change.

## Reproduction and Task 5 handoff

```sh
python3 scripts/seed/seed.py --refresh-realistic
python3 scripts/seed/seed.py --refresh-realistic --apply
python3 scripts/seed/seed.py
python3 -m unittest discover -s tests/runtime -p 'test_*seed*.py'
python3 -m unittest discover -s tests/integration -p 'test_seed*.py'
pnpm typecheck
pnpm lint
pnpm test:frontend
pnpm exec playwright test tests/e2e/portal.spec.ts tests/e2e/review-regressions.spec.ts tests/e2e/marketing.spec.ts
pnpm exec playwright test tests/e2e/browsing-ux.spec.ts tests/e2e/publication.spec.ts
node tests/e2e/support/capture-marketing-previews.mjs
docker compose -p openobec -f compose.yaml -f compose.apps.yaml up -d --build --no-deps marketing
```

PDF generation used bundled Python `/Users/simonochotnicky/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`, ReportLab, pypdf, embedded Liberation Sans from bundled pdfjs-dist; Poppler `/Users/simonochotnicky/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm`. PDF skill marker ran successfully exactly once before first authoring, expected count 72. PDF provenance/generation instructions in `scripts/seed/documents/README.md`.

Task 5 must create a NEW invoice with an unused number, not publish an existing fixture or upload a PDF with another number. Suggested scenario: `FV/2026/0053` after rechecking unused, “Prenájom sály na komunitné podujatie”, customer “Spolok Rodinná lúka”, date `2026-11-02`, due `2026-12-02`, net `245.50`, VAT `56.47`, total `301.97`, EUR. Check `245.50 × 23 % = 56.465 → 56.47`. Generate PDF from the exact new API payload with:

```sh
/Users/simonochotnicky/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/seed/generate_pdfs.py --agenda faktury --payload /tmp/showcase-invoice.json --output /tmp/showcase-invoice.pdf
```

Or import `generate_document('faktury', payload, output_path)`. All existing seed catalog counts/IDs remain unchanged until Task 5 intentionally creates its own new showcase record.

## Self-review and limitations

Reviewed source diff, data coherence, ownership and interrupted phases; all mutations are explicit API operations against known owned IDs. No startup PDF dependency, external claims, backend contract, publication/query behavior, monetary precision or deadline conversion changed. APIs do not expose compare-and-swap: checks before and after each stage detect intervening edits and stop, but cannot make concurrent human edits atomic; README requires no concurrent editing during maintenance. Backup retains source and file metadata; old fixture PDF bytes are reproducible with `pdf_bytes(old_number)` and verified by their hashes. The later user edit is intentionally retained even though its previous PDF now differs, as ordinary product edits may do.

Final verification completed successfully after preserving version 5: `/tmp/task4-final-verification.log` verifies all72 IDs/PDF bytes,71 baseline-exact+1preserved, both5-node ready graphs, three published search examples, unchanged ordinary seed and unchanged explicit refresh. All21 Docker services healthy after marketing-only rebuild. Commit: `e20f6d0` (`feat(seed): refresh owned demo records with realistic fictional documents`). Report is intentionally under ignored `.superpowers/`; commit contains only the88 Task4 files. Unrelated root research files remain untracked.
