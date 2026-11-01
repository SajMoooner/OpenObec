# OpenObec product previews

Captured 2026-11-01 from the locally running production frontend at source version `2265a3a97151a249968bcab303122af0e2c53ea0` (approved Task 2). Owned OpenObec UI and controlled synthetic seeded records only; no external template assets or user-authored records.

- `citizen-contract.png`: http://127.0.0.1:3001/obcan/zmluvy/zml_df1176d5-248d-40fd-b737-4d2f78b1b885. Synthetic library contract, PDF and four relations.
- `office-overview.png`: http://127.0.0.1:3002/uradnik/home. Demo cookie, 72 total / 24 draft / 48 published records. Visible rows explicitly marked synthetic.

Chromium / installed Google Chrome, viewport 1440×1040, device scale 1, viewport screenshots without image edits. Captured with Playwright after page content loaded. Checked visually against live routes. Original PNGs total approximately 227 KB, delivered through Next Image with stable dimensions and responsive sizing. ProductPreview captions explain that these are static application images with synthetic data. Counts are illustrative fixture state, not customer metrics. Refresh screenshots and this version record when product UI changes.

Reproduce from repository root: `node tests/e2e/support/capture-marketing-previews.mjs` (set CHROME_PATH if needed). Task 4 handoff: user subsequently requested realistic fictional names/numbers/files instead of explicitly synthetic record names. After its ID-preserving dataset migration, regenerate both images, inspect them, update alt descriptions if needed and replace the source version/date above. Current Task 3 assets remain an honest capture of the current fixture state until then.
