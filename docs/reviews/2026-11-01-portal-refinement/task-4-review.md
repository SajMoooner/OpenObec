### Spec Compliance

- ✅ Spec compliant. The catalog supplies 12 readable fictional records per agenda, eight published/four concepts, exact Decimal-derived money, distinct income/customer semantics, connected first-two work scenarios and chronological lifecycle dates (`scripts/seed/realistic.py:9–87`). Ordinary payload API signatures remain compatible and committed PDF reads add no runtime PDF dependency (`scripts/seed/seed.py:78–79`, `scripts/seed/seed.py:155–164`).
- ✅ Explicit preview/apply migration is restricted to manifest identities, reconstructs complete legacy payload/relations and original PDF hash, snapshots before mutations, and preserves uncertain records (`scripts/seed/refresh.py:25–75`, `scripts/seed/refresh.py:84–107`). The one exact-restored-ID exception remains behind full field/PDF proof and strict resumed-update checks (`scripts/seed/refresh.py:17–20`, `scripts/seed/refresh.py:35–48`, `scripts/seed/refresh.py:108–123`).
- ✅ Replacement upload precedes retirement, retry deduplicates by hash, only the backed-up legacy attachment is deleted, and subsequent source changes stop writes (`scripts/seed/refresh.py:131–187`). Tests exercise real preservation, lost-response retry, interrupted upload, modified attachment, source edits, deletion and extra-file retention (`tests/integration/test_seed_refresh.py:53–190`).
- ✅ PDF generator renders catalog numbers, parties, dates and exact amount strings with embedded diacritic-capable fonts and an explicit fictional footer; 72 PDF additions and provenance are included (`scripts/seed/generate_pdfs.py:25–63`, `scripts/seed/documents/README.md:1–19`). Screenshot provenance/readiness checks and affected browser assertions reflect actual readable data without removing publication/route assertions (`tests/e2e/support/capture-marketing-previews.mjs:31–43`, `tests/e2e/review-regressions.spec.ts:92–108`).
- ⚠️ Binary appearance and live mutation outcomes are not independently derivable from textual diff. The supplied report records all-72 parse checks, representative render inspection, screenshot inspection, and live verification; the inspected `/tmp/task4-final-verification.log:1–9` confirms 72 retained identities/PDFs, resolved first-two graphs and preservation of the later version-5 edit. No specific remaining doubt warrants an additional binary check or rerun.

### Strengths

- Full editable-content ownership comparison avoids treating stale seed timestamps or matching numbers as proof (`scripts/seed/refresh.py:30–39`). The narrow legacy exception does not bypass attachment proof or broaden later-update acceptance (`scripts/seed/refresh.py:108–123`).
- Side effects have persisted checkpoints and explicit retry recognition, including a remote update whose response was lost (`scripts/seed/refresh.py:143–173`, `tests/integration/test_seed_refresh.py:96–132`).
- The deterministic catalog and development-only PDF generator keep startup simple while providing coherent showcase data and reproducible artifacts (`scripts/seed/realistic.py:53–93`, `scripts/seed/generate_pdfs.py:66–80`).

### Issues

- Critical: None.
- Important: None.
- Minor: None.

### Assessment

**Task quality:** Approved.

**Reasoning:** The scoped change implements the requested fictional catalog and controlled migration without changing application contracts or monetary/deadline handling. The known lack of compare-and-swap is documented and mitigated by checks around each stage; it does not justify broader changes in this task.

**Checks:** Read the immutable review diff; the first tool output truncated its middle, so retrieved only the omitted seed implementation segment. No changed source file was reread for review. One focused outside-diff check evaluated the concrete risk that preserved/missing migration rows could block projection completion: inspected `scripts/seed/seed.py:88–113`; existing helper removes missing source IDs and waits current source versions, resolving the concern. Read the final evidence log without rerunning any reported suite. No repository/index/branch mutations; only this requested review report was written.
