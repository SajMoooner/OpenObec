# Task 2 implementation report

Status: DONE, self-reviewed. Base: `5e64971`. Commit recorded below after staging only Task 2 code/tests.

## Implemented

- Office shell owns `OfficeNavigationProvider`, a single shadcn AlertDialog for dirty application exits, runtime citizen URL context, and native beforeunload protection. No history monkey-patching, fabricated history entries or popstate rewinding. Editor entries from list Add, dashboard Add/drafts, detail Edit and inverse-reference Edit are native anchors. All anchors leaving an active editor are captured before Next's handler and use full document navigation, even when clean. Normal surrounding list/detail browsing stays Next Link navigation. Downloads, same-document hash links, modifier clicks, other mouse buttons and other-tab targets retain native semantics.
- Dirty snapshots compare editable field values, normalized optional party text and sorted reference identities, allowing actual reversions. Files, active saves and incomplete post-save work remain protected. Successful full save uses a synchronous bypass plus full-document `location.replace`; savedId and pending-file retry loops remain intact. Validation and upload/publication failures do not disarm protection. Native Back, Forward and reload were exercised, including Stay and confirmed departure. Logout waits for confirmation; server/network failure shows a retryable error and keeps the guard armed. Generic confirmation does not prematurely set native bypass.
- Editor groups document, financial and date fields, organization, relations and attachments. Existing record context/number/publication state and consequences of published edits are explicit; draft versus publish consequence is explained. Sticky actions have reserved bottom/focus scroll space, minimum44px buttons, and a primary Save changes action for published edits. Procurement Select now associates its visible error with aria-describedby, matching other controls.
- Selected references hydrate title/number through existing source endpoints, with AbortController/stale-effect protection. Failed labels display an honest unavailable message and a retry action instead of a raw UUID. Reverse references are explained as documents that reference this record; existing inverse owner filtering and maximum100 selections remain unchanged.
- Dashboard independently requests existing all/draft/published filters and their pagination totals for six agendas (18 requests, not counts inferred from five rows). Summaries, compact agenda counts, actionable draft edit links and recent changes labeled Upravené use actual data. Failed requests leave successful data visible; retry requests only missing/failed datasets. Missing counts render a dash/Načítavam until actual failure, never a fabricated zero. Incomplete summaries explain how many agendas loaded.
- Shared detail uses agenda-specific summary fields, early attachment panel (right at wide widths, above further details on narrow screens), remaining details without repeated summary rows, relation counts by agenda and quiet technical metadata. Exact decimal strings continue through the existing formatter. VZN remains without money/relations. Published document Edit is primary, Unpublish secondary, Delete separated below. Publication/save feedback and actual configured citizen-document URL are visible only when published; public projection delay remains explicit and existing retry behavior is unchanged. Back link describes global results/home rather than incorrectly naming the current agenda.
- Attachment types use PDF/PNG/JPEG labels, sizes and selected/uploaded/error states. Existing uploads/downloads/removals and partial retries remain. The detail aside uses plain divided rows and border-top upload region, avoiding nested bordered cards. Login is one compact demo block/button; settings read-only simulated values are a definition list, with an explicit Simulácia badge.
- Shared table now switches expanded columns based on available container width (66rem), preserving readable compact rows on notebooks with a sidebar. Office flex content has min-w-0; the action column is64px for a44px target plus cell padding. This fixes measured1280px page overflow and4px local table overflow without clipping actions. Existing shadcn/Geist/IDSK3 palette/max1280 identity retained.

## RED / GREEN evidence

Created and ran browser specifications against baseline served code before refreshing apps:

1. Four initial cases failed for intended absent behavior: dirty cancel lacked confirmation; dirty browser Back lacked native prompt; Select lacked error association; failed dashboard service removed all successful sections instead of showing incomplete totals.
2. Three further baseline cases failed for missing published-edit warning/reference behavior, lack of guarded exit after partial upload save, and lack of native file-only reload protection.
3. First fresh-code pass:6/9 passed. Two native-dialog tests had already received beforeunload but incorrectly waited for a canceled page load until test timeout. Changed tests to assert the dialog and allow the expected canceled commit timeout, preserving value/file assertions. Third failure was an overly broad alert selector also matching Next's hidden route announcer; scoped to actual logout error. Focused native Back/reload and failed logout then3/3 passed.
4. Added forward-exit, public-link/draft and notebook-width cases. Fresh pass11/12; only measured4px local table overflow failed. Measured the48px last column against44px action +16px cell padding, changed it to64px. Container-width table behavior already fixed root overflow at1280px.
5. Final fresh build:12/12 focused workflow tests passed in14.4s. Covers dirty cancel/sidebar/inverse edit, Stay preserving values/files, confirmed leave, native Back/Forward/reload across full-document boundaries, clean boundary exit, file-only work/new tab, successful save bypass, same-record partial upload retry (first.pdf, second.pdf failure, second.pdf retry only), validation/Select, reference hydration/unavailable/retry, exact pagination counts/partial failure recovery, runtime public URL/published-only link, destination back label and390/768/1024/1280/1440 page/table/action fit.
6. All existing relevant browser regressions run once on final code:32/32 passed in41.4s. Includes real create/PDF upload/link/publish/search/download hash/edit/unpublish and failed-upload same-record retry; server validation; all three exact procurement fractional/DST deadline preservation cases and deliberate edits; browsing/history/context; citizen partial-service handling; marketing preview route assertions; mobile/tablet table/action/title regressions. Existing save URL assertions intentionally updated for preserved returnTo plus save feedback query parameters; precision/publication assertions retained.

## Commands / final verification

- `pnpm test:frontend`:23/23 passed. Exact money, date/DST precision, source/public adapter, projection pagination and inverse owner tests retained.
- `pnpm typecheck`: all six workspace projects passed on final source.
- `pnpm lint`: clean, zero warnings on final source.
- `git diff --check`: clean.
- `python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml up -d --build --no-deps marketing citizen office`: all three Next production app builds passed and containers refreshed. Only frontend containers were rebuilt; backend/data stayed intact. Final build log `/tmp/openobec-task2-build-final.log`.
- One early build failed because a removed router variable remained in the evolving logout callback; corrected before final build. No failed build was represented as final served code.
- `pnpm exec playwright test tests/e2e/workflow-ux.spec.ts`:12/12 passed,14.4s.
- `pnpm exec playwright test tests/e2e/browsing-ux.spec.ts tests/e2e/deadline.spec.ts tests/e2e/publication.spec.ts tests/e2e/review-regressions.spec.ts tests/e2e/portal.spec.ts`:32/32 passed,41.4s. Log `/tmp/openobec-task2-regressions.log`.
- Docker, Chrome and tsx commands used normal justified escalation required by this environment. No test/browser capability limitation remains. Native navigation cancellation requires dialog-aware test waiting; browser prompt content itself is browser-owned.

## Self-review / visual evidence

Read the brief first, only Global Constraints from the plan, approved navrh, Task1 final interfaces, PRODUCT/DESIGN/portal brief, all app AGENTS and installed Next Link/useRouter docs. Read Impeccable craft-floor immediately before edits; did not rerun loaded context command. Self-reviewed source diff and mutation paths; no backend contract, conversion/formatting implementation, deadline logic, projection algorithm or attachment retry loop was altered.

Controller native checks independently confirmed published detail hierarchy, attachment/public link, mobile procurement seven linked validation errors/focused summary, dirty Stay/Leave and absence of page overflow. Controller's notebook/aside feedback was incorporated. Local visual inspection confirmed final desktop detail/dashboard and mobile procurement form. Focused responsive automation includes notebook widths and locally scroll-free tables/actions.

Final desktop screenshots, refreshed after disposable records were cleaned:

- `/tmp/openobec-task2-dashboard-desktop.png` — actual72 all /24 drafts /48 published after cleanup.
- `/tmp/openobec-task2-detail-desktop.png` — seeded library contract, PDF and four related documents; final plain attachment rows.
- `/tmp/openobec-task2-editor-mobile.png` —390px procurement form (earlier capture before added draft explanation; same grouping/layout; root width390). Sticky elements in full-page screenshots are rasterized at their viewport position, so controller native focus/scroll checks are authoritative.

Product routes suitable for Task3 marketing screenshots, existing seeded synthetic records only:

- `http://localhost:3001/obcan/zmluvy/zml_df1176d5-248d-40fd-b737-4d2f78b1b885` — Obnova mestskej knižnice – syntetický záznam1; `synteticky-dokument.pdf`; four related agenda documents. Office: `http://localhost:3002/uradnik/zmluvy/zml_df1176d5-248d-40fd-b737-4d2f78b1b885`; append `/upravit` for hydrated related-document names and published-edit warning.
- `http://localhost:3001/obcan/zmluvy/zml_bb91a400-2de9-4a4d-b313-64b5faf94227` — Výsadba stromov v parku – syntetický záznam2; four relations; corresponding office route uses same id.
- `http://localhost:3002/uradnik/home` — useful actual counts/draft workflow screenshot.

## Final interfaces for controller / Task3

Public `DocumentDetail({ agenda, id, office? })`, `EditorPage({ agenda, id? })`, `OfficeShell({ children, citizenUrl })` and `RecordsTable` props remain compatible. OfficeShell internally wraps its content in OfficeNavigationProvider. No new API-client exports/contracts.

New internal feature exports:

- `OfficeNavigationProvider({ citizenUrl, children })` supplies register({active,dirty}), requestExit(action), saved(href) and runtime citizenUrl. `saved` does synchronous native-unload bypass and full-document replacement; generic requestExit confirmation never leaves bypass set after asynchronous failure.
- `useEditorGuard(dirty)` registers active editor state and cleans it up. `useOfficeNavigation()` is nullable outside OfficeShell, allowing citizen detail to share the module without an office guard.
- `DocumentSummary({agenda, record})`, `summaryFields(agenda, record)` and `returnLabel(returnTo, fallback)` are shared detail/back-context composition helpers using Task1 presentation and existing exact formatters.
- `RecordFields` has an optional `belowSummary` flag; omitted preserves full expanded related-record display.
- `attachmentType(contentType)` supplies human file labels.
- Native editor-entry anchors are an intentional boundary contract. Future editor-entry surfaces must preserve them; future navigation buttons within an active editor must use the shell requestExit/saved interface. Ordinary list/detail routes continue to use Next links.
- Shared Table's native wrapper is an inline-size query container; RecordsTable expanded columns require66rem of available content. Updated-date label is now Upravené. The larger detail action column intentionally fixes the prior local4px overflow.

## Concerns / scope

No implementation blocker. Native beforeunload appearance/wording and browser permission to display it are browser-controlled; desktop Chrome Back/Forward/reload were verified. Full44-route native review belongs to the controller's final matrix. API totals are separate existing requests and cannot claim an atomic cross-service snapshot. Public projection can lag confirmed source writes; messaging and retries remain truthful.

All newly authored workflow mutation cases use owned browser response fixtures (no persistent writes). Existing integration suites create and delete only their own random-id disposable records. Final dashboard returned to72/24/48, and final screenshot contract returned to four seeded relations after cleanup. No resets, pushes, deployment or external messages. Root research files and controller plan/archive edits remain unstaged/uncommitted. Coordination report remains in intentionally ignored .superpowers directory.

Commit: `2265a3a` — Refine office workflows and shared document details. Exactly16 Task2 source/test files committed; controller documentation/archive and unrelated root research files were not included. Apps remain served from the final verified build.
