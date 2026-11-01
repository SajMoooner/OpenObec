# OpenObec product previews

Captured 2026-11-01 from the local production citizen/office frontend at `15f669ebd92b55a76d4972acd263551ba372dc4f`, after the authorized Task 4 `realistic-2026-v1` migration of 72 owned IDs. Authored fictional municipal examples only: no external template assets, real transactions or user-authored documents.

- `citizen-contract.png`: http://127.0.0.1:3001/obcan/zmluvy/zml_df1176d5-248d-40fd-b737-4d2f78b1b885. Published library refurbishment contract `ZM/2026/0034`, fictional contractor, 22 694,48 EUR, matching PDF and four resolved related documents.
- `office-overview.png`: http://127.0.0.1:3002/uradnik/home. Demo cookie; fully loaded 72 total / 24 concepts / 48 published, 12 records per agenda, readable document numbers and natural titles.

Chromium / installed Google Chrome, viewport 1440×1040, device scale 1; original viewport captures without image edits. Checked both images visually. The capture script waits for all six agendas in each state and resolved numeric dashboard totals (without assuming fixed fixture counts) and loaded contract/PDF/relations, avoiding a partial loading screenshot. Only the 72 manifest-owned IDs were present at capture time, verified through all six source APIs after disposable-test cleanup. The global application demo disclosure and small fictional PDF footer remain explicit. Captions identify a static example environment; counts describe fixtures, not customer metrics.

Reproduce from repository root with the local stack ready and only these owned examples live:

```sh
node tests/e2e/support/capture-marketing-previews.mjs
```

Set `CHROME_PATH` if needed. The source UI commit above plus Task 4 catalog version identify the captured state; this README and images ship in the same Task 4 commit. Refresh images and provenance together when UI or owned data changes.

Task 5 adds one separately owned published showcase invoice after this static capture. The retained image documents the earlier 72-record state; reruns wait for the current complete totals rather than requiring 72/24/48.
