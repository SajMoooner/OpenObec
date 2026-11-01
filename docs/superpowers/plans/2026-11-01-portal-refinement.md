# OpenObec Portal Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved professional presentation and usability improvements across all three working portals.

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

- [ ] Write focused RED tests for invoice/customer/date, supplier/date, contract effective date, order date, procurement ex-VAT/deadline/status, VZN no amount, missing values and safeReturnTo rejection.
- [ ] Add browser RED tests for list query/sort/state/page retained through detail and browser back, clear-search reset, single matching global search showing results before empty agendas, mobile date and active navigation. Run against current baseline and capture expected failures.
- [ ] Implement domain-aware tables: relevant party, dates, clearly qualified amount; VZN without empty money column, procurement lifecycle distinct from publication. Display useful dates on mobile; use 44px touch targets for main controls/actions.
- [ ] Refine citizen home: compact pale-blue search area, examples from actual demo terms, six concise agenda descriptions/icons; during search prioritize matching groups, total result count, compact zero groups, clear search and honest partial failure. Rename default recent section to truthful "Najnovšie dokumenty". Preserve cancellation/stale-result protection.
- [ ] Refine list toolbar, count pluralization and empty/error/loading states; explicit reset filters; one clear office Add action. Persist URL state safely, including refresh and browser back/forward.
- [ ] Improve active citizen navigation/aria-current, mobile demo identification, office contextual header and page titles for route/agenda/action. Do not replace office navigation behavior required by Task 2 guard.
- [ ] Run `pnpm test:frontend`, `pnpm typecheck`, `pnpm lint`; build relevant apps and serve fresh code (Docker apps only via `python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml up -d --build marketing citizen office` or own dev servers with configurable ports). Run focused browser tests against fresh code; do not count stale Docker evidence.
- [ ] Self-review and commit only Task 1 files. Report final interfaces, test commands/results, RED/GREEN and any concerns.

### Task 2: Office workflows and useful shared details

**Files:**
- Modify `packages/ui/src/features/editor.tsx`, `reference-picker.tsx`, `dashboard.tsx`, `detail.tsx`, `attachments.tsx`, `login.tsx`, `settings.tsx`, `shell.tsx`.
- Create `packages/ui/src/features/navigation-guard.tsx` (dirty-state and guarded app navigation), `document-fields.tsx` (shared summary/detail/form grouping where useful), `dashboard-data.ts` in api-client if pure aggregation helps tests. Keep responsibilities narrow.
- Modify office/citizen layout or wrappers only as required for runtime citizen URL, guard provider and metadata.
- Create `tests/e2e/workflow-ux.spec.ts`; update existing interaction expectations intentionally changed; preserve deadline/publication/review-regression tests.

**Interfaces:**
- Consume Task 1 presentation, RecordsTable and safe return context. Preserve existing DocumentDetail/EditorPage public props unless all call sites are updated.
- Office shell owns a navigation-guard context with `setDirty`/registration, `confirmNavigation` and bypass on successful save. All in-app exits, cancel, sidebar, logout, browser back/forward and reload must handle dirty work. Use a single shadcn confirmation dialog for app navigation; native beforeunload for reload/close. Do not patch global history unsafely or silently drop browser-back coverage; if platform constraints require a different robust pattern, report before final implementation.
- Public detail link uses actual configured runtime citizen URL, points to the current document and appears only for published records (projection may be pending and must stay truthful).

- [ ] Write/run RED browser cases for dirty cancel/sidebar/browser back, stay preserves values and files, confirm leave works, successful save bypass, published warning, reference labels after existing record load, Select error descriptions, count correctness with more than one page and failed service. Use owned fixtures and existing API tools; clean them safely.
- [ ] Group editor fields into understandable sections (document, organisation/financials, dates, relations, attachments). Show context title/number/status, required-field hints, published-edit consequence and sticky actions with sufficient bottom space/focus scroll margin. Link every validation error including procurement Select via aria-describedby.
- [ ] Hydrate selected references with human title/number using existing source or picker endpoints. Respect aborts/races; give an honest retryable unavailable label rather than raw UUID default. Explain reverse references in plain Slovak. Preserve maximum/ref filtering and existing inverse-reference protections.
- [ ] Implement guarded navigation and robust dirty detection for field/reference/file changes, reverting changes, upload retries and saved state. Saving/validation failure must not disable protection; do not create duplicate records on retry.
- [ ] Dashboard: actual all/concept/published totals from existing per-agenda pagination totals/filter requests; compact agenda counts, actionable drafts and recent changes showing updated_at labeled "Upravené". Use partial failure handling; no fake zero totals or counts inferred from five rows. Surface retry without losing successful sections.
- [ ] Shared detail: compact summary of 2–4 relevant fields, prominent attachment panel near top (side column wide, early single-column mobile), full details below without repeated summary rows, relation groups/counts and quiet technical metadata. Long titles wrap; VZN no money/relations. Give edit main weight when published, unpublish secondary and deletion separate. Publication success leads to clear feedback and actual public detail link; preserve projection retry.
- [ ] Attachments: human PDF/PNG/JPEG labels, size, clear selected/uploaded/error state; preserve real download/upload/remove and partial retry. Login compact single-button demo; settings simulated read-only values rendered as data, not inputs.
- [ ] Run focused new browser tests on fresh served code, then full frontend unit/type/lint and all existing workflow/precision browser tests once. Build apps, self-review and commit Task 2 files. Report test evidence and any platform limitation honestly.

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
