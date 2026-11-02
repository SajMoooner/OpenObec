# CI success-status selector repair

Base: `d994d7f`. Test-only commit: `29b4e7a` (`test: qualify workflow success status assertions`). No push.

## Evidence and scope

Read `ci-status-brief.md` and the last 160 lines of `ci-third-failure.log`. CI run 41408422911 collected 69 tests; 67 passed and two failed. Both failure messages explicitly report `getByRole('status')` resolving to the expected success `<p role="status">` and the simultaneous loading `<div role="status" aria-label="Načítavam údaje">`. This CI output is direct RED evidence, not an inferred mutation failure.

Only `tests/e2e/workflow-ux.spec.ts` changed:

- Partial attachment-save test, line 231: qualify status with `.filter({ hasText: "Dokument bol uložený" })`; retain the existing `toContainText("Dokument bol uložený")`.
- Retained-page unpublication test, lines 431–433 (formerly 429): qualify status with `.filter({ hasText: "stiahnutý zo zverejnenia" })`; retain the existing `toContainText("stiahnutý zo zverejnenia")`.

`rg -n -i 'status' tests/e2e` reviewed every status occurrence. These are the only unqualified global status/success-message assertions. The two list-summary role locators already filter by `8 dokumentov` / `10 dokumentov`. They need no change. Exact-once creates/updates, upload filenames, unload count, and retained-page recovery assertions are unchanged. No skips, waits, retries, first/nth selection, fixtures, application code or data changed. User research and controller documentation remain untouched.

## Verification performed

- `pnpm exec playwright test --list`: exit 0; actual suite collection remains **69 tests in 9 files**, including both affected tests.
- `pnpm exec eslint tests/e2e/workflow-ux.spec.ts`: exit 0, with isolated-file React autodetection warning. Subsequently ran the normal project command below.
- `pnpm lint`: exit 0; `eslint apps packages tests/e2e`, with no warnings/errors.
- `pnpm exec tsc --noEmit --strict --skipLibCheck --target ES2022 --lib dom,dom.iterable,esnext --esModuleInterop --module esnext --moduleResolution bundler --types node tests/e2e/workflow-ux.spec.ts playwright.config.ts`: exit 0.
- `pnpm exec prettier --check tests/e2e/workflow-ux.spec.ts`: exit 0; formatting passes.
- `git diff --check`: exit 0 before commit.

Disposable browser selector verification ran via `node <<'NODE'` from the repository, importing `node:assert/strict` and `{ chromium, expect }` from `@playwright/test`, launching headless `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. No harness file was added. Initial restricted launch failed with SIGABRT/EPERM; approved elevated execution of the same harness exited 0. Browser was closed in `finally`.

Exact harness logic, for each of the two success substrings:

1. `page.setContent` inserted `<div role="status" aria-label="Načítavam údaje">Loading</div>` and a `<p role="status">` containing the success substring plus a period.
2. Asserted two statuses, then `assert.rejects(() => expect(page.getByRole('status')).toContainText(message), /strict mode violation/)`: original locator reproduced ambiguity.
3. `expect(page.getByRole('status').filter({ hasText: message })).toContainText(message)`: passed while loading was present. Asserted loading status remained visible.
4. Removed only the loading DOM node using locator `evaluate(node => node.remove())`; the same qualified content assertion passed again.
5. Replaced DOM with loading only; qualified `toContainText(message, { timeout: 100 })` rejected with `element(s) not found` as expected. The short timeout was solely for this negative disposable selector check, not a changed application test.
6. Replaced DOM with two matching success paragraphs; qualified `toContainText(message)` rejected with `strict mode violation` as expected, preserving uniqueness.

Output:

```text
PASS: Dokument bol uložený: old locator rejects two statuses; qualified locator passes during/after loading; missing and duplicate success reject
PASS: stiahnutý zo zverejnenia: old locator rejects two statuses; qualified locator passes during/after loading; missing and duplicate success reject
```

## Validation limit

The harness verifies selector behavior in a real browser with concurrent loading/success statuses. It is **not a fresh full-application or end-to-end pass**. No local Docker is running, so no live full-app browser suite was attempted. No whole-app frontend build, Java or backend suite was run for this test-only repair. The controller owns the next real CI run.
