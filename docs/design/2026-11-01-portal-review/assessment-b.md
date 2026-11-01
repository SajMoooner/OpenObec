# Assessment B — detector and browser evidence

Method: independent Assessment B (`/root/portal_evidence_review`), isolated from Assessment A until the parent signalled completion. No Assessment A report, scores or prior critique report was read. Target: `apps`, the three current Next.js portals. Analysis/proposals only; no product edits.

## Exact coverage

- **44 main routes × 3 viewport sizes = 132 completed route/viewport checks**: marketing 4, citizen 13, office 27. This expands 14 rendered page templates over all six agendas; it does not count root redirects as extra screens.
- Viewports: 1440×960, 768×1024, 390×844. Native Chrome CUA navigation, accessibility state and read-only DOM measurements were used. All 44 routes were source-reviewed and live-reviewed; zero main routes are source-only.
- Seed detail/edit URLs use record 0 from each agenda in `.run/seed-manifest.json`.
- The measurement window was 2026-11-01 18:15:34–18:17:41 UTC. There were 133 raw observations: one initially loading contract detail was checked again after data loaded. The route matrix keeps its completed observation.
- **Zero page-level horizontal-overflow cases across the 132 checks.** Local horizontally scrolling marketing tabs/table are intentional local regions and are not counted as page overflow.
- Every completed main-route observation had one H1. Normal-state warnings/errors in captured browser console logs: **0 warnings, 0 errors**. The settings page has its intentional simulation warning, not a failure.
- Six new-document forms were submitted empty at 390 px. All six stopped in local validation, focused `form-error`, retained the route and displayed field-level errors. Required invalid-field counts were 8 / 8 / 6 / 5 / 7 / 5 for invoices / supplier invoices / contracts / orders / procurement / ordinances.
- Root redirects (3), not-found components (3), route error boundaries (3), and the office missing-cookie redirect were reviewed in source only. They are separate from the 44 main-route total.

The exact route list, source mapping, dimensions and state coverage are in `route-matrix.json`. `assessment-b-state-evidence.json` records interaction evidence. `assessment-b-source-inventory.json` records 42 relevant source files and their hashes.

## Deterministic detector

Command, run exactly once:

`/Users/simonochotnicky/.codex/skills/impeccable/scripts/impeccable detect --json apps`

- Exit code: **0**. Stderr: empty. Full stdout retained as `detector.json` (665 bytes).
- **1 advisory**, **0 hard findings**: `design-system-font-size` / “Font size outside DESIGN.md”.
- Location: `apps/marketing/app/home/marketing.css:15`, imported by `page.tsx`.
- Literal: `font-size: clamp(2.25rem, 4vw, 3.5rem)`, where the 3.5rem endpoint is absent from the documented type ramp.
- Classification: **known current-surface / design-document mismatch**, not evidence that the current headline looks wrong. The parent verified that the current marketing surface brief permits 56 px; the inherited `DESIGN.md` display token is older. Do not revert the headline to satisfy this advisory. The scanner correctly found a documentation discrepancy; treating it as a required visual correction would be a false positive.
- No other false positives were emitted. The command target was `apps`; no separate deterministic scan of `packages/ui` or the entire repository was performed. Shared feature code was reviewed through source and live behavior. A clean/advisory-only app scan is not a clean bill for shared interaction behavior.
- `.impeccable/critique/ignore.md` was absent.

## Current issues confirmed by live evidence

### [P1] Existing related documents lose their human-readable identity in editors

On the seeded contract edit route, the four stored relations appear as raw IDs such as `fak_f6add3d7-9a2f-4420-8a63-6615bf5f1f9a`, plus agenda badges. Their remove controls also announce IDs. Opening the picker shows the same selected invoice with the useful document number and title, so the data is available but the selected-list presentation does not hydrate it. This was visually confirmed at 390 px and in accessibility/DOM output; the baseline 1440 and 768 observations contain the same IDs.

Source: `packages/ui/src/features/reference-picker.tsx:52`, `:201`, `:210`. The local label map starts empty and is populated only by a new toggle; existing values fall back to IDs.

Proposal: resolve existing selection labels on load and show document title, evidential number and agenda with standard shadcn text/Badge/Button styling. Use the number/title in the remove accessible name. Keep IDs inside optional technical metadata only.

### [P1] Switching agendas silently discards an unsaved document

At `/uradnik/faktury/novy`, a temporary value was typed into Evidenčné číslo. The mobile office menu was opened with Enter and Objednávky activated with Enter. Navigation completed without a JavaScript dialog or alert dialog. Returning to the form showed an empty field. No save was attempted and no document was created.

Source: `packages/ui/src/features/editor.tsx:46` stores values only in component state; office route navigation is in `packages/ui/src/features/shell.tsx`. The behavior is shared by the six new and six edit forms, though the destructive-navigation interaction itself was tested on the new invoice form only.

Proposal: show an explicit unsaved state and protect route changes with the standard shadcn AlertDialog offering stay/discard/save. Preserve the current values when a save fails. Make save actions easy to reach in long mobile forms.

### [P2] Search results appear below navigation and zero-result groups

Marketing search with the exact number `DEMO-2026-03-001` correctly opens `http://localhost:3001/obcan/home?q=DEMO-2026-03-001`. The citizen page finds one contract and zero items in the other five agendas. At 390×844, the six-item agenda grid stays above results; the two zero-result sections for invoices precede the contract. The first matching record starts at **y=1118.5 px**, below the first screen. Every empty group still offers “Všetky výsledky”.

Source: `packages/ui/src/features/citizen.tsx:71`, `:111`, `:119`.

Proposal: in search mode, place the matching results immediately after the search summary; put groups with matches first and collapse empty groups. Retain agenda navigation as secondary navigation. Use the existing table, Badge and Accordion patterns; no additional visual system is needed.

### [P2] The list loses search context when returning from a detail

In citizen invoices, searching `DEMO-2026-01-001` with Enter returns one record, but the address remains `/obcan/faktury` without the query. Opening that record and using the detail’s Faktúry return link produces all eight public invoices and an empty search field. A no-match query gives useful prose but no explicit reset action; clearing requires editing the search field and searching again.

Source: `packages/ui/src/features/list.tsx:32`, `:37`, `:139`; return link `packages/ui/src/features/detail.tsx:193`. The shared list source uses component state for query, sorting, publication filter and page. This exact interaction was tested on citizen invoices, not independently on all twelve lists.

Proposal: retain query/sort/filter/page in the URL and preserve that context in “Späť na výsledky”. Add a standard outline/ghost “Vymazať filtre” action in filtered and empty states.

### [P2] Procurement’s invalid status selector is not linked to its error explanation

The procurement blank-submit test produces seven invalid controls. Six have `aria-describedby` pointing to their errors; the `stav` combobox has `aria-invalid=true` but **no `aria-describedby`**, although “Vyplňte pole stav obstarávania.” is visible. Other tested forms link their input and textarea errors correctly.

Source: `packages/ui/src/features/editor.tsx:192` compared with `:185` and `:223`.

Proposal: associate the SelectTrigger with `stav-error` using the same error-description pattern as Input/Textarea. Preserve required-state semantics for the selector. This is DOM/keyboard evidence, not a completed screen-reader compliance audit.

## Smaller observations and source-supported proposals

- Mobile citizen menu and record-open arrows measure 36×36 px; the sort selector is 208×36 px while the adjacent search controls are 44 px tall. Increase touch hit areas to approximately 44 px while retaining standard shadcn appearance. This is a usability recommendation, **not a claim that 36 px alone violates WCAG 2.2 AA**.
- Citizen agenda navigation has no `aria-current` or source-driven active state. Keep the current agenda visibly and programmatically marked, as the office sidebar already marks it visually.
- Citizen home says “Naposledy zverejnené” while the reviewed source sorts `created_at` (`citizen.tsx:59`) and shared tables display creation dates. Review the wording/data contract so publication recency is not confused with creation recency. No publish/unpublish mutation was performed to test ordering transitions.
- Most operational route browser titles remain “OpenObec · Žilina”, including details and editors. Give each route a short agenda/document/task title for multi-tab work.
- `Failure` always says “Údaje sa nepodarilo načítať”, including when reused for mutation errors in detail/attachment flows. Split load and action error copy so users know whether a save, publication action or upload failed. This was reviewed in source; actual server failures were not induced.
- Keep Geist and the current semantic palette. The inspected computed marketing font was Geist Sans, and shared source imports the self-hosted Geist weights. None of the above proposals requires IDSK typography, IDSK components or a second component language.

## Verified strengths

- All 44 normal screens loaded at all three widths, without page overflow. Long seeded titles wrap and the working portals switch to compact responsive table rows.
- Labels and accessible names exist for the inspected form controls, search inputs, record-open actions, menu triggers and picker controls. All six blank forms use a focusable summary with linked field messages.
- Keyboard search worked. Citizen mobile navigation opened with Enter, closed with Escape and returned visible focus to the trigger. Office mobile navigation closed after route selection. The related-document picker opened with Enter and closed with Escape without changing selection.
- Deletion confirmation names the concrete document and starts focus on Cancel. It was opened and cancelled only; deletion was not executed.
- Settings clearly says its connection is a simulation; its keyboard-triggered simulation completes with a status announcement. No real system connection was made.
- Marketing-to-citizen query transfer preserved the exact search value and found the expected seed record.

## Provenance, limitations and cleanup

- Browser: fresh Assessment B Chrome tab `848388034`, separate from the other assessment’s tab. Viewport changes were coordinated with the parent; no parent or user tab was reused.
- Mutable injection preflight: the documented CUA `PlaywrightAPI.evaluate` is explicitly **read-only**. Mutation is unsupported; no title/script mutation was attempted and no alternative execution channel was used to bypass it.
- **No detector overlay is available. No impeccable live-server was started.** Fallback signal is the single CLI detector run plus current source, native accessibility/DOM inspection and representative native screenshots.
- Normal-state route coverage is exhaustive for the 44 requested main routes, but state-space coverage is representative. No real save, successful upload, publish/unpublish, delete, login/logout, backend outage, delayed projection or partial-service failure was executed. No user records or attachments were created/changed/deleted.
- Root redirects, not-found components, route error boundaries and unauthenticated access were source-only. Authentication used the existing local demo session; it was left unchanged.
- Full screenshot evidence was not regenerated for every route/width. Fresh screenshots were inspected in the native tool transcript for mobile edit, validation, search and existing relation states. Previously supplied capture manifests were treated as historical reference, not proof of this run. No new saved raster artifact is claimed.
- No full screen-reader run, 200% zoom run, quantitative pixel-contrast audit or all-states accessibility certification was performed.
- The temporary viewport override was reset and the B-created tab closed. No critique server or injected script needs cleanup. Only review artifacts in this directory were written; no product file was edited. Detector stdout, stderr and metadata are deliberately retained evidence rather than disposable temp files.
