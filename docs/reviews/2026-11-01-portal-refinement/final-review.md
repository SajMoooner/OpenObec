# Final whole-refinement review

Reviewed range: `625fc6d..d40e517`. Requirements: `docs/superpowers/plans/2026-11-01-portal-refinement.md`, `docs/design/2026-11-01-portal-review/navrh.md`, and the recorded controller rulings. Latest screenshot-on-homepage / video-in-documentation direction takes precedence. Review performed read-only; this report is the only checkout file written. No records, index, HEAD or branch state were changed, and no subagents were used.

### Strengths

- Domain presentation is centralized and retains raw monetary/date values for existing formatters. Customer versus supplier, procurement lifecycle/value without VAT, and VZN's nonfinancial dates are correctly distinguished. Source versus Query API routing and the existing deadline conversion/publication/attachment retry interfaces remain intact.
- URL-owned browsing state, exact same-portal return-path allowlisting, abort handling and stale-request keys are sound. The editor navigation boundary is implemented consistently across new/edit/inverse links and shell exits; successful saves bypass the guard, while failed saves, pending files and failed logout retain protection.
- The office dashboard uses actual pagination totals and preserves successful sections during service failures. Editor field groups, associated Select errors, early detail attachments, published-edit consequences and the configured public-document link materially improve the workflow.
- The marketing implementation uses genuine installed shadcn components and preserves Geist, IDSK3 colors, navy/panorama and bounded composition. The screenshot sequence has a visible manual/pause control, server-rendered first frame, reduced-motion default, and visibility-aware timer cleanup. Homepage video delivery is removed without losing the documentation recording.
- The fictional catalog and migration show careful ownership handling: explicit manifest identities, full legacy-content/PDF proof, backups, resumable checkpoints, replacement-before-retirement and protection of later edits. The narrow restored-fixture exception is explicitly authorized in the ledger. MIT and retained third-party notices are clear; README describes actual demo limits and distinguishes future capabilities from implemented behavior.

### Issues

#### Critical (Must Fix)

None found.

#### Important (Should Fix)

**I1 — Recover from a retained page that no longer contains rows.**

- **Files:** `packages/ui/src/features/list.tsx:132`, `:148`, `:192`; deletion preserves this destination in `packages/ui/src/features/detail.tsx:198`.
- **Problem:** Pagination exists only inside the nonempty-row branch, and the reset button ignores `page`. A positive but out-of-range page therefore shows an empty-agenda message even when `pagination.total` is positive, with neither previous-page nor clear/reset control. This occurs naturally when a user opens the last document on the last page, deletes it (or changes its filtered publication state), then returns to the preserved list URL. It also affects bookmarked URLs after the dataset shrinks.
- **Reproduction:** Read-only Chrome visit to `/obcan/faktury?page=999` displayed **“8 dokumentov”** followed by **“Zatiaľ tu nie sú žiadne dokumenty”** and “Zverejnené dokumenty sa zobrazia po spracovaní.” Both `Predchádzajúca` and `Zrušiť filtre` button counts were zero.
- **Impact:** The new context-preserving navigation strands the user on a misleading empty page and fails the required clear recovery from empty results.
- **Fix:** When a successful response has `page > total_pages` and documents remain, navigate/replace to a valid page while preserving q/sort/state, or render a clear valid-page recovery action outside the row branch. Distinguish a genuinely empty dataset from an empty page. Cover deletion/filter-shrink and direct out-of-range URLs.

**I2 — A selected filename can break the mobile editor layout.**

- **File:** `packages/ui/src/features/editor.tsx:362–365`.
- **Problem:** The selected-file list renders the filename as an unbreakable text run, without wrapping or containment. Valid filenames commonly contain long identifiers; the input accepts them, and the list forces horizontal overflow.
- **Reproduction:** At a 390×844 viewport on `/uradnik/faktury/novy`, selecting an in-memory PDF named `Faktura` + `1234567890` repeated ten times + `.pdf` increased `document.documentElement.scrollWidth` to **929px**. No upload or save was performed.
- **Impact:** The ordinary attachment-selection step violates the explicit mobile no-page-overflow requirement and makes the form substantially wider than the screen.
- **Fix:** Allow filename text to wrap anywhere, and ensure the enclosing file list/section/fieldset can shrink. Preserve the full accessible filename. Add a focused narrow-viewport case with a long valid filename and check page width plus save/cancel reachability, including the pending/error display.

#### Minor (Nice to Have)

**M1 — Back-link labels name the current agenda after crossing to a related document.**

- **File:** `packages/ui/src/features/document-fields.tsx:9–12` (used by detail and editor).
- **Problem:** `returnLabel` recognizes home/search destinations but otherwise returns the current document's agenda title. Related-document links intentionally retain the originating list's `returnTo`, so a contract list → contract → related invoice path produces an invoice detail whose back link says **“Faktúry”** but points to `/obcan/zmluvy`.
- **Evidence:** Confirmed in the live browser: the main link had `{text: "Faktúry", href: "/obcan/zmluvy"}`.
- **Impact / fix:** Navigation goes to the correct place but its label misleads the reader. Derive the agenda label from the validated destination pathname, retaining the current fallback only for unknown destinations. Cover cross-agenda related navigation and its editor continuation.

**M2 — Recent-document sections truncate each agenda before selecting the global latest rows.**

- **Files:** `packages/ui/src/features/dashboard.tsx:32`, `:71–78`; analogous default citizen-home sampling at `packages/ui/src/features/citizen.tsx:30`, `:61–64`.
- **Problem:** Each agenda returns only five candidates, but the combined lists select ten recent documents (and six drafts). If six or more of the newest changes belong to one agenda, newer records are omitted and older records from other agendas appear instead. The retained citizen sampling has the same issue under its now-explicit “Najnovšie dokumenty” heading.
- **Evidence:** A read-only browser response fixture returned twelve recent invoice records and one older record per other agenda, honoring the requested `page_size`. “Posledné zmeny” displayed **New 1–5 plus five Old 1 rows**; drafts displayed **New 1–5 plus Old 1**, omitting New 6 and later records.
- **Impact / fix:** Totals are accurate, but the recent-work ordering is incomplete. Fetch at least the final display limit from each participating agenda before merging (ten for recent documents, six for drafts); citizen search groups may keep their separate five-row preview. Add a concentrated-single-agenda ordering case. This sampling pattern partly predates the range, but it remains relevant to the explicitly refined recent-work surfaces.

### Recommendations

- Address these four focused findings in one wave. Keep API contracts, decimal/deadline conversion, editor navigation boundaries and migration semantics unchanged.
- Add regression assertions for the demonstrated cases, run their focused browser coverage on fresh affected builds, and refresh the source-hash verification record after code changes. The already-passing unrelated suites need not be repeated solely for this review.

### Review coverage and verification limits

- Read the immutable review package in bounded sections across Tasks 1–6, the approved requirements, the ledger and relevant existing helper/launch interfaces. Inspected the task reports/reviews, Task 5 fix reviews, full-suite evidence and native route matrix. The matrix contains **132 distinct route/width pairs**, with separately documented eight wide-screen observations and updated screenshot-home checks.
- Independently checked all **32 recorded source hashes** and **seven capture hashes** against the checkout: all match. The retained WebM byte size and SHA-256 match `media.json`. Visually inspected the shipped homepage capture, citizen invoice detail and office overview; these agree with the described identity and hierarchy.
- The archived **59-test browser run**, subsequent focused portability fix, frontend checks/builds, PDF parsing/rendering and historical live migration outcomes are supplied execution evidence, not tests rerun by this reviewer. Their assertions/code were considered rather than inferring completeness from their pass status; the uncovered cases above explain the remaining gaps.
- Independently reproduced I1, I2 and M1 against the served app, and M2 using isolated browser response fixtures. Initial restricted Chrome launch failed before page execution; the same read-only check succeeded with the approved execution permission. No unresolved browser-launch limitation remains. No full suites were repeated.
- Historical database writes and every frame of the recording cannot be reconstructed solely from the present source and retained metadata. The ownership/source/public/PDF snapshots, matching media hash and prior native evidence support those claims; this review does not assert a fresh migration or end-to-end video re-recording. Individual PDF binaries were not all re-rendered here.
- GitHub push, remote rendered README/media and remote CI completion remain pending controller actions. This review does not certify publication or production deployment.

### Declined to judge

- Real authentication, municipal/external integrations, intelligent search, multi-municipality support and production hardening: explicitly excluded from this demo refinement; present disclosures are accurate.
- Re-auditing the original Java backend or introducing compare-and-swap for concurrent seed maintenance: the backend predates this range and new contracts are forbidden; the refresh explicitly documents no concurrent editing and checks source state around its phases.
- Expanding the editor dirty-work guard to the separate immediate-upload attachment panel on a detail page: selected-but-not-uploaded files there retain existing behavior; the approved navigation contract specifically establishes active editor boundaries. This is called out for the controller rather than silently treated as covered by the editor tests.
- Cross-platform redesign of the optional PDF/video authoring toolchain: the macOS/Chrome/runtime assumptions and environment overrides are documented; ordinary startup reads committed PDFs and does not require that authoring stack.
- Matching the superseded full-width comp, restoring the old register or embedding homepage video: the user's later centered-layout and screenshot direction explicitly supersedes those requirements; preserved historical failed comp evidence is not a current implementation failure.
- Changing the three untracked root research files, repository visibility or deployment: outside authorized refinement scope and untouched.

### Assessment

**Ready to merge? With fixes.**

The six-task refinement is substantially aligned with the approved design and preserves the important existing data/workflow interfaces. Resolve the two demonstrated Important usability defects before publication; the two small correctness fixes are concrete and suitable for the same consolidated wave.
