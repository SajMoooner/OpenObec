# Task 1 implementation report

Status: DONE. Base: `625fc6d`.

## Implemented

- Added shared domain presentation and safe return-context helpers without modifying API contracts, data, monetary conversion, publication/projection, dates/deadline conversion, upload retry or idempotency logic.
- Same-agenda tables now show the actual party (invoice customer versus supplier), document date, qualified VAT amount, procurement lifecycle separately from publication, and VZN approval/effective dates without a money column. Mixed tables label each row's date, party/lifecycle and amount. Missing values use existing em-dash display. Mobile rows retain these domain labels and useful dates.
- List URL owns q/page/sort/state. Native history integration with Next `useSearchParams` restores them on back/forward and reload. Sort/state/page input is allowlisted/validated before API use. Search/sort/state changes reset page; explicit reset restores defaults. Search drafts remain separate from committed URL search. Result/document count forms are pluralized; loading/error/empty states remain distinct, with reset and retry actions. Office has one primary Add action.
- Encoded `returnTo` propagates list/home -> detail -> edit -> saved detail and cancellation/back; related-document links retain it, and deletion returns to it. No dirty-form guard was added (Task 2 owns that).
- Citizen home has a pale-blue compact search block, real seeded search examples, distinct Lucide agenda icons and concise descriptions. A committed search suppresses the expanded agenda chooser so results immediately follow search; only matching agenda sections expand; zero groups are summarized compactly, with total result count, clear action, and existing honest partial-service failures/retry. Original AbortController and stale-key protection remain intact. Default recent section is truthfully named “Najnovšie dokumenty”.
- Citizen current agenda has `aria-current=page` and visible highlighting on desktop/mobile; mobile brand shows Žilina/demo. Office header shows agenda/action context. Relevant route pages have static/dynamic metadata titles. New-agenda navigation explicitly scrolls top while native browser history remains intact.
- Existing shadcn components, Geist, IDSK3 color tokens and centered max1280 layout retained. Main list/search/navigation/action targets use minimum44px, including SelectTrigger's attribute-height specificity fix.

## Final interfaces for Task 2

API client exports through `src/index.ts`:

```ts
documentPresentation(agenda: Agenda, data: Record<string, unknown>): {
  party?: { label: string; value: string };
  date: { label: string; value: unknown };
  amount?: { label: string; value: unknown };
  secondaryDate?: { label: string; value: unknown };
}
safeReturnTo(value: string | null | undefined, fallback: string): string
```

`Agenda` is the actual definition from `agendas.ts` (not AgendaSlug). Presentation keeps unknown/raw dates and exact monetary strings for existing formatters. Procurement exposes lifecycle via `party` with label “Stav obstarávania”. `secondaryDate` is VZN effective date. Missing party/lifecycle value is “—”; date/amount values remain undefined when absent.

`safeReturnTo` uses the portal from trusted `fallback`. It accepts only exact same-portal `/{obcan|uradnik}/home` or one of the six agenda-list paths, optionally with a query. It rejects external/protocol-relative, opposite-portal, detail/editor/unrelated, traversal/encoded traversal, backslash, hash, whitespace/control and malformed percent-encoded values. Call with a trusted same-portal list fallback.

```ts
RecordsTable({
  nodes: RecordNode[],
  office?: boolean,       // default false
  showAgenda?: boolean,   // default true
  returnTo?: string,
  dateContext?: "document" | "updated", // default document
  agenda?: Agenda,        // explicit same-agenda headings, including empty nodes
})
```

If agenda omitted, table infers single agenda only when every node has that type. `dateContext=updated` uses `updated_at` and “Naposledy upravené”. `countLabel(count, [singular, twoToFour, other])` is also exported from shared.tsx for readable Slovak counts.

Existing `DocumentList.initialQuery?` / `CitizenHome.query?` props remain accepted for wrapper compatibility; URL is authoritative. Office state URL values are `all|true|false` (API translates to zverejnene). Sort accepts `-created_at|created_at|-updated_at|updated_at`; page is positive safe integer. Detail/editor signatures unchanged and read returnTo directly via useSearchParams.

## RED and GREEN evidence

1. Created focused helper tests before implementation. `node --import tsx --test packages/api-client/test/presentation.test.ts` initially failed: index did not export documentPresentation. After helpers,2/2 passed. Coverage includes customer/supplier labels, invoice/contract/order/procurement date semantics, procurement exact ex-VAT amount/lifecycle, VZN no money/secondary date, missing values, and return-path rejection matrix.
2. Created browser tests before implementation. Initial sandbox execution could not launch Chrome (SIGABRT); escalated run against baseline captured3 intended failures: URL-created_at sort ignored; global summary absent; mobile domain-date absent. This is actual functional RED evidence, separate from the launch limitation.
3. First fresh-code browser run4/6 passed. Two test issues were corrected: original search term did not exist in the seeded document set, and mobile active-link selector also matched the hidden desktop link. Query changed to actual seeded “knižnice”; selector scoped to mobile dialog. No product behavior was weakened.
4. Controller live findings were implemented: search grid no longer precedes matching results; lower-mobile-agenda navigation starts at heading. Added focused assertions for both.
5. Fresh-code7/7 then8/8 passed (before final minimum-height assertion), covering all6 agenda columns, real detail/explicit return/back/reset, office query/page/sort/state/reload (read-only mock pagination fixture), single-match ordering, active nav/mobile dates, VZN no money,390/768/1440/3440 overflow and lower agenda scroll.
6. Final minimum44px selector assertion and app rebuild verification:8/8 browser tests passed in6.4s against freshly rebuilt app containers.

Commands:

- `pnpm test:frontend`:23/23 passed (escalated because tsx IPC pipe is denied in restricted execution).
- `pnpm typecheck`: all6 workspace projects passed.
- `pnpm lint`: clean, no warnings.
- `git diff --check`: clean.
- `python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml config --services`: inspected services before build.
- Initial required `... up -d --build marketing citizen office`: succeeded; Compose also rebuilt dependencies. No resets or volume removals.
- Subsequent final refreshes used `... up -d --build --no-deps marketing citizen office`: all3 production Next16 app builds succeeded. Latest build log `/tmp/openobec-task1-build-final.log`. URLs remain marketing3000/citizen3001/office3002.
- `pnpm exec playwright test tests/e2e/browsing-ux.spec.ts`:8/8 passed in6.4s; final responsive/native-control assertion included.

## Self-review / visual inspection

Read citizen/office AGENTS.md, installed Next16 useSearchParams/useRouter/metadata docs, Impeccable craft-floor; context command was not rerun. Inspected own diff for scope and preservation of backend/precision/retry code. Rendered screenshot review at390px and1440px for VZN confirmed legible titles, dates, absent money column, current-nav style, mobile demo label, no horizontal overflow. All-six agenda column/mobile sweep and responsive width checks supplement this. Screenshot files under `/tmp/openobec-task1-*` are local review outputs, not deliverables or source assets.

No database mutation/reset performed by these tests. Office pagination and unique global-match cases use browser response fixtures only. Unrelated root research files and controller plan/progress edits remain unstaged. This report lives in the intentionally gitignored coordination directory.

## Concerns / remaining scope

No Task1 implementation blocker. Task2 retains ownership of editor guarding, full editor/detail composition, office dashboard and settings behavior. Metadata-only office home/settings edits are included here. Full44-route audit belongs to later planned tasks, not this focused slice. No push/deployment performed.

Commit: `c17055b` — Refine document browsing and citizen portal context. Only19 Task1 source/test/metadata files committed; ignored coordination report remains local.
