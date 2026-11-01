# OpenObec Portal Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved professional presentation and usability improvements across all three working portals, with the subsequently requested realistic fictional data and real publication showcase video.

**Architecture:** Preserve the existing Next.js apps and shared shadcn/ui features. Improve presentation metadata, client navigation state and work flows against the existing Java APIs; no backend changes. Execute three sequential, independently reviewable deliveries and a final integrated visual and functional verification.

**Tech Stack:** Next.js 16.4.3, React 19, Tailwind 4, shadcn/ui, Radix, Geist, TypeScript, Playwright; existing Java/Mongo/Kafka/RustFS infrastructure.

**Spec:** `docs/design/2026-11-01-portal-review/navrh.md` (user approved design and behavior on 2026-11-01). Existing PRODUCT.md, DESIGN.md and surface briefs describe incumbent identity; the approved refinement supersedes old screenshot geometry.

## Global Constraints

- Zachovať shadcn/ui, Geist, farby IDSK3 a centrovanú šírku najviac 1280 px.
- IDSK3 contributes colors only: no IDSK components, fonts or layout system. Reuse genuine installed shadcn components and Lucide icons.
- Preserve navy marketing/panorama, light citizen surfaces, navy office sidebar. No invented customers, savings, legal guarantees, contact address, live integrations or misleading dashboard charts.
- All 44 content route variants: 4 marketing, 13 citizen, 27 office. Responsive at 390/768/1440 px, centered on 2560/3440 px. No page horizontal overflow or obscured focused controls.
- Existing APIs, monetary decimal strings, Bratislava deadline precision (seconds, fractions and ambiguous DST instants), publication/projection behavior, attachment retry/idempotency and visibility protections must remain intact.
- No new backend contracts, real authentication, external IS, sending messages, destructive data resets, production deployment or push. Use only disposable test records for mutations.
- Demo status, simulated integration and proposed 199 €/year remain explicit. Setup fee and VAT status are unspecified; do not invent them.
- Read each app AGENTS.md and relevant installed Next.js docs before route/navigation edits. Read Impeccable craft-floor immediately before UI edits; do not rerun its already-loaded context command.
- Leave unrelated root OpenObec-analyza-systemov.md, OpenObec-mapa-systemov.csv and OpenObec-predpoklady.md untouched and uncommitted.

## Review Focus

1. Mixed agenda rows and missing optional values: amounts/date labels must retain domain meaning, especially procurement without VAT and VZN without money (Task 1 presentation tests).
2. Non-default search/page/sort/state and malformed return destinations: return from detail/edit restores the user's list without creating an external redirect (Task 1 navigation tests).
3. Partially failing APIs and fast-changing searches: stale responses cannot overwrite new results; totals are honest and partial states have a recovery path (Task 1/2 browser tests).
4. Unsaved values/files, failed uploads and published edits: navigation protects work; successful save exits safely; publication and retries retain existing semantics (Task 2 workflow tests).
5. Long labels, small screens and keyboard validation: controls remain reachable, Select errors are linked, and sticky actions do not hide focus (Task 2/3 browser checks and final route matrix).

### Task 1: Shared document browsing and citizen portal

**Files:**
- Create `packages/api-client/src/presentation.ts`, `packages/api-client/test/presentation.test.ts` for domain display and safe list context helpers; export through `src/index.ts`.
- Modify `packages/ui/src/features/shared.tsx`, `list.tsx`, `citizen.tsx`, `shell.tsx`, `detail.tsx` (only return context), `editor.tsx` (only context propagation).
- Modify route wrappers under `apps/citizen/app/obcan/` and `apps/office/app/uradnik/` as needed for search params/metadata; shared shell styling as needed.
- Create `tests/e2e/browsing-ux.spec.ts`; update existing expectations only where intentionally obsolete.

**Interfaces:**
- Export `documentPresentation(agenda: Agenda, data: Record<string, unknown>): { party?: {label:string;value:string}; date:{label:string;value:unknown}; amount?:{label:string;value:unknown}; secondaryDate?:{label:string;value:unknown} }` from api-client, using actual Agenda type from agendas.ts. If existing row types require narrower values, keep all callers consistent and document final signature.
- Export `safeReturnTo(value: string | null | undefined, fallback: string): string`, accepting only same-portal agenda list/home relative paths, rejecting external/protocol-relative, traversal, malformed and unrelated paths.
- RecordsTable preserves current nodes/office/showAgenda props and adds optional `returnTo?: string`, `dateContext?: "document" | "updated"`; same-agenda columns derive from nodes or explicit `agenda?: Agenda` for empty sets. Mixed rows show their own semantic labels.
- List state q/page/sort/state resides in URL and synchronizes with back/forward. Detail/edit links propagate an encoded `returnTo`; later Task 2 retains it.

- [x] Write focused RED tests for invoice/customer/date, supplier/date, contract effective date, order date, procurement ex-VAT/deadline/status, VZN no amount, missing values and safeReturnTo rejection.
- [x] Add browser RED tests for list query/sort/state/page retained through detail and browser back, clear-search reset, single matching global search showing results before empty agendas, mobile date and active navigation. Run against current baseline and capture expected failures.
- [x] Implement domain-aware tables: relevant party, dates, clearly qualified amount; VZN without empty money column, procurement lifecycle distinct from publication. Display useful dates on mobile; use 44px touch targets for main controls/actions.
- [x] Refine citizen home: compact pale-blue search area, examples from actual demo terms, six concise agenda descriptions/icons; during search prioritize matching groups, total result count, compact zero groups, clear search and honest partial failure. Rename default recent section to truthful "Najnovšie dokumenty". Preserve cancellation/stale-result protection.
- [x] Refine list toolbar, count pluralization and empty/error/loading states; explicit reset filters; one clear office Add action. Persist URL state safely, including refresh and browser back/forward.
- [x] Improve active citizen navigation/aria-current, mobile demo identification, office contextual header and page titles for route/agenda/action. Do not replace office navigation behavior required by Task 2 guard.
- [x] Run `pnpm test:frontend`, `pnpm typecheck`, `pnpm lint`; build relevant apps and serve fresh code (Docker apps only via `python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml up -d --build marketing citizen office` or own dev servers with configurable ports). Run focused browser tests against fresh code; do not count stale Docker evidence.
- [x] Self-review and commit only Task 1 files. Report final interfaces, test commands/results, RED/GREEN and any concerns.

### Task 2: Office workflows and useful shared details

**Files:**
- Modify `packages/ui/src/features/editor.tsx`, `reference-picker.tsx`, `dashboard.tsx`, `detail.tsx`, `attachments.tsx`, `login.tsx`, `settings.tsx`, `shell.tsx`, and editor-entry links in `list.tsx`.
- Create `packages/ui/src/features/navigation-guard.tsx` (dirty-state and guarded app navigation), `document-fields.tsx` (shared summary/detail/form grouping where useful), `dashboard-data.ts` in api-client if pure aggregation helps tests. Keep responsibilities narrow.
- Modify office/citizen layout or wrappers only as required for runtime citizen URL, guard provider and metadata.
- Create `tests/e2e/workflow-ux.spec.ts`; update existing interaction expectations intentionally changed; preserve deadline/publication/review-regression tests.

**Interfaces:**
- Consume Task 1 presentation, RecordsTable and safe return context. Preserve existing DocumentDetail/EditorPage public props unless all call sites are updated.
- Office shell owns a navigation-guard context with dirty/active registration, confirmation and bypass on successful save. All in-app exits, cancel, sidebar, logout, browser back/forward and reload must handle dirty work. Use a single shadcn confirmation dialog for app navigation; native beforeunload for browser traversal/reload/close. Controller decision: editors are full-document navigation boundaries. Use native anchors for ALL editor entries (new, edit, inverse-reference edit), full-document navigation when leaving an active editor even if clean, and full-document replacement after successful save. This makes browser traversal use native beforeunload without global history monkey-patching or fabricated history entries. Ensure Next links in the surrounding shell cannot create a same-document exit while editor is mounted. Ordinary list/detail browsing remains Next navigation. Test browser Back and Forward across these boundaries; preserve modifier/new-tab/download/hash behavior and do not prompt for opening another tab. Report any gap before final implementation.
- Public detail link uses actual configured runtime citizen URL, points to the current document and appears only for published records (projection may be pending and must stay truthful).

- [x] Write/run RED browser cases for dirty cancel/sidebar/browser back, stay preserves values and files, confirm leave works, successful save bypass, published warning, reference labels after existing record load, Select error descriptions, count correctness with more than one page and failed service. Use owned fixtures and existing API tools; clean them safely.
- [x] Group editor fields into understandable sections (document, organisation/financials, dates, relations, attachments). Show context title/number/status, required-field hints, published-edit consequence and sticky actions with sufficient bottom space/focus scroll margin. Link every validation error including procurement Select via aria-describedby.
- [x] Hydrate selected references with human title/number using existing source or picker endpoints. Respect aborts/races; give an honest retryable unavailable label rather than raw UUID default. Explain reverse references in plain Slovak. Preserve maximum/ref filtering and existing inverse-reference protections.
- [x] Implement guarded navigation and robust dirty detection for field/reference/file changes, reverting changes, upload retries and saved state. Saving/validation failure must not disable protection; do not create duplicate records on retry.
- [x] Dashboard: actual all/concept/published totals from existing per-agenda pagination totals/filter requests; compact agenda counts, actionable drafts and recent changes showing updated_at labeled "Upravené". Use partial failure handling; no fake zero totals or counts inferred from five rows. Surface retry without losing successful sections.
- [x] Shared detail: compact summary of 2–4 relevant fields, prominent attachment panel near top (side column wide, early single-column mobile), full details below without repeated summary rows, relation groups/counts and quiet technical metadata. Long titles wrap; VZN no money/relations. Give edit main weight when published, unpublish secondary and deletion separate. Publication success leads to clear feedback and actual public detail link; preserve projection retry. The back-link label describes its destination: results/home when returnTo points there, otherwise the agenda list (never label a return to global search only "Faktúry").
- [x] Attachments: human PDF/PNG/JPEG labels, size, clear selected/uploaded/error state; preserve real download/upload/remove and partial retry. Login compact single-button demo; settings simulated read-only values rendered as data, not inputs.
- [x] Run focused new browser tests on fresh served code, then full frontend unit/type/lint and all existing workflow/precision browser tests once. Build apps, self-review and commit Task 2 files. Report test evidence and any platform limitation honestly.

### Task 3: Product-led marketing and integrated polish

**Files:**
- Modify `apps/marketing/app/home/page.tsx`, `hero.tsx`, `sections.tsx`, `marketing.css`, `app/vyhody/page.tsx`, `app/demo/page.tsx`, `app/kontakt/page.tsx`, `app/components/site-shell.tsx`, `demo-links.tsx` as actual tree requires.
- Create reusable `apps/marketing/app/components/product-preview.tsx` and owned `apps/marketing/public/previews/*.png` with provenance; use real updated OpenObec views or genuinely shared rendered components with clearly labeled synthetic demo data, never external template assets.
- Modify `tests/e2e/marketing.spec.ts`, `marketing-layout.spec.ts`; add only meaningful interactions/layout constraints, not duplicated styling snapshots.
- Update DESIGN.md and applicable `.impeccable` surface briefs to document this approved refinement (not rewriting historical audit evidence). Controller records final evidence under `docs/reviews/2026-11-01-portal-refinement/`.

**Interfaces:**
- Consume current citizen/office views after Task 2 for product examples. Existing server runtime publicLinks and functioning search route remain source of URLs; static previews are images, not fake working controls.
- Keep .marketing-container maximum 80rem, normal gutters, headline maximum 3.5rem. Preserve panorama asset and navy identity. Typography Geist and component styling shadcn.

- [ ] Inspect current live Task 2 portal views; obtain own screenshots for the two product examples (controller may supply files). Record capture routes/version and avoid exposing user-created records in assets.
- [ ] Home: centered compact hero, working search, distinct citizen/office product examples and specific benefits; consolidate repetitive prose. Show six agendas with meaningful differences, clear three-step publication, proposed pricing, FAQ and demo CTA.
- [ ] Benefits: two concrete illustrated scenarios with useful domain differences, no six identical sentences. Demo: both role previews and three-step try-it paths. Contact: honest current project/demo information with useful route onward; no invented address or nonfunctional message form.
- [ ] Refine navigation/footer/current links, spacing/type, long text, focus and mobile rhythm across four pages. Preserve all functioning demo/search links, semantic headings and image alt text; lightweight stable image dimensions.
- [ ] Run relevant marketing tests; update obsolete copy expectations only with clear intended behavior. Run type/lint, all frontend unit tests and three production builds. Commit files.
- [ ] Controller: rebuild three frontend Docker services and run full browser suite on fresh version. Inspect all 44 routes at 390/768/1440, wide marketing at 2560/3440; check no overflow, console errors, stuck loading, keyboard focus/validation and genuine mutations with owned fixtures. Inspect rendered screenshots, not only geometry.
- [ ] Controller: one scoped Impeccable detector over all changed UI, resolve actual findings; record final verification and visual evidence honestly. Run one final whole-branch review against starting commit, address must-fix findings, archive reports and leave branch available locally without push.

### Task 4: Realistic fictional records and useful PDFs

**User authority:** Additional message requests data that looks real instead of demo placeholders. All existing global constraints apply; this authorizes a controlled refresh of owned seed records, not a database reset or overwriting user-created/modified documents.

**Files:**
- Create `scripts/seed/realistic.py` for a deterministic catalog of 12 meaningful records per agenda, `scripts/seed/refresh.py` for explicit resumable owned-record migration, and `scripts/seed/generate_pdfs.py` for development-time PDF generation.
- Create `scripts/seed/documents/` with 72 compact PDFs and provenance/generation README. Generation uses bundled reportlab/embedded Liberation Sans; ordinary seed only reads committed PDFs, retaining standard-library runtime simplicity.
- Modify `scripts/seed/seed.py`; add `tests/runtime/test_realistic_seed.py`, `tests/integration/test_seed_refresh.py`; preserve existing seed preservation/projection tests. Modify existing browser tests that assume DEMO-2026 numbers to assert actual readable numbers/realistic queries without weakening route/publication checks.
- Refresh `apps/marketing/public/previews/*.png` using existing `tests/e2e/support/capture-marketing-previews.mjs` after live migration; update image provenance and any obsolete synthetic-specific caption (global fictional/demo notice remains). Update README seed instructions.

**Interfaces:**
- Keep `payload(agenda,index,prefix)`, `seed(path,prefix,count)`, request/upload/pdf_bytes/wait_projection APIs compatible with existing integration tests. Custom test prefixes remain unique namespaces. The ordinary default seed creates realistic numbers (e.g. FV/2026/0041, DF/2026/0187, ZM/2026/0034, OBJ/2026/0096, VO/2026/0012, 4/2026); no visible DEMO/syntetický suffix in stored document titles/numbers or organization names.
- Ordinary rerun never rewrites existing records, edits or deletions. `--refresh-realistic` is an explicit opt-in controlled migration of IDs from the supplied manifest. Keep IDs and relationships; do not adopt records found merely by number. Skip/report modified or missing records rather than overwrite uncertain ownership. Save pre-migration source/attachment metadata and progress under `.run/`, resume safely after partial failure.
- Existing manifest baseline is old; prove legacy fixture content using its known legacy payload and expected relation graph before updating. Preserve unrelated fields/files; replace only demonstrably owned old fixture PDF (known filename/hash), upload replacement before retiring it. New PDF upload is hash-idempotent. Migration retries must not recreate records, duplicate attachments or overwrite subsequent user edits. Record new content version and source baseline in manifest. Wait for Kafka/query projection through existing helper.

- [ ] Write RED tests for varied/valid catalog and money totals using Decimal, date ordering, human numbers/names, meaningful first two relation-connected scenarios, and migration identity/preservation/retry behavior. Keep at least a published contract containing `knižnice`; citizen search examples `knižnice`, `stromov`, `osvetlenia` must match actual data.
- [ ] Author coherent 72-record catalog: issued invoices have customers/income or cost reimbursement; supplier invoices have suppliers/costs; related contract/order/procurement records refer to the same work where linked. Use varied decimal-string amounts, dates distributed through 2026, appropriate VAT arithmetic, lifecycle states aligned with deadlines, distinct VZN topics/effectiveness. Do not scrape or claim actual municipal transactions, personal data or real supplier identifiers. Keep existing 8 published/4 concepts per agenda unless protecting a user's edit requires otherwise.
- [ ] Generate actual useful one-page PDFs with Slovak diacritics, document number/title, parties where applicable, dates and amounts matching the catalog. A small footer states fictional example; no fake signature/seal or legal compliance claim. Use PDF skill marker once before authoring and render/inspect representative invoice, procurement and VZN pages. Bundle generated fixtures; no new runtime PDF dependency for startup.
- [ ] Implement explicit preview/apply migration through existing APIs only. Preview expected owned IDs, backup, apply and verify live stack without resets. Verify each refreshed record/PDF, all 72 identities preserved, first two linked graphs still resolve, source/query versions caught up and ordinary rerun no-op. Report any intentionally preserved modified records.
- [ ] Test interruption/retry and preservation with focused mocks plus owned live fixture records; run existing seed preservation/projection/integration acceptance and affected browser tests on actual refreshed data. Run frontend type/lint/unit if shared tests/captions change. Do not rerun unchanged Java suites.
- [ ] Refresh both marketing product screenshots on realistic data, inspect them and update provenance. Rebuild only frontends as needed for updated assets; self-review, commit task files and report migration counts, tests, fixture scenario suitable for showcase and exact reproduction commands.

### Task 5: Real publication showcase video in the hero

**User authority:** User attached current hero register and requested a short clip showing invoice creation, PDF upload/publication and discovery in citizen portal. This supersedes the hero's static three-row register, while preserving a compact functioning search and portal links.

**Files:**
- Create `scripts/showcase/record.mjs` (reproducible real-UI recording and proof), `apps/marketing/public/showcase/publication.webm` (optionally MP4 if available), `poster.jpg`, `captions.sk.vtt`, provenance README.
- Create `apps/marketing/app/home/publication-showcase.tsx`; modify `hero.tsx`, `marketing.css`, relevant homepage marketing copy/design brief and `tests/e2e/marketing*.spec.ts`, only superseded hero-table tests in `review-regressions.spec.ts`.
- Record evidence under `docs/reviews/2026-11-01-portal-refinement/` including actual source/public same-id proof and media metadata.

**Interfaces:**
- Render actual HTML video with native controls, playsInline, muted, preload="none" or "metadata", stable aspect ratio and poster. No autoplay/forced loop; respects reduced motion by requiring user play. Slovak captions and adjacent concise step transcript. Downloads/static assets stay local; no external embeds or new player library.
- Capture 25–45s approximately, prioritizing legibility over exact duration; 1280×800 or 1440×900, smooth deliberate actions, concise cuts/holds. Show actual app UI with readable stage labels in the surrounding presentation/captions. No fake loading, fabricated publication or unrelated visual redesign.
- Use an isolated browser recording via existing Playwright developer/test setup, a realistic uniquely owned invoice and real PDF, actual uploads/API persistence/Kafka then public UI. Verify final public record id and attachment hash match source. Never alter user records. Keep the published showcase invoice available if linked; record ownership/cleanup separately, and make reruns unique or reuse own manifest safely.

- [ ] Create a focused video UI test for poster/no-autoplay/native controls/caption/transcript, media load and play/pause, responsive bounds and working compact search/demo links. Expect baseline missing video; capture RED then implement.
- [ ] Record the real sequence: office entry → Faktúry → add document → meaningful fields → select actual invoice PDF → Uložiť a zverejniť → citizen search/list → same published invoice/detail with PDF. Use realistic Task4 fixture language and exact monetary strings. Any cut compresses waiting only, never fabricates an unavailable success.
- [ ] Produce locally playable small video (target below 12MB for 720p-equivalent screen content where practical), stable poster and caption timings; inspect representative beginning/form/upload/publication/public frames plus actual playback. If full FFmpeg unavailable, existing Playwright FFmpeg VP8/WebM encoder is installed; prefer portable tool within workspace to global installation. Record codec/resolution/duration/bytes and provenance; provide reproducible script.
- [ ] Replace the hero register with the video showcase and concise invitation to watch; keep real search in a compact separate row and both demo CTAs. Remove only obsolete static-register UI/tests, preserving real route/search behaviors. Document this user-directed supersession rather than comparing to old comp geometry.
- [ ] Run video/marketing browser tests on fresh app build, frontend unit/type/lint/three production builds. Commit and report assets, verified real workflow proof and exact supported behavior. Controller then performs final full-browser suite, correct per-tab viewport matrix for all44 routes, detector and final global review for tasks1–5.
