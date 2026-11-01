### Spec Compliance

- ✅ Spec compliant: the homepage uses three same-invoice PNG stages with genuine shadcn Tabs, descriptive alternatives, explicit pause/play and manual stop (`apps/marketing/app/home/publication-showcase.tsx:8–32,89–134`); effects pause offscreen/hidden and clean up timers/subscriptions (`:34–77`). Reduced motion starts static and removes the 280ms spatial reveal (`apps/marketing/app/home/marketing.css:40–63`). Search remains a real citizen GET form (`apps/marketing/app/home/hero.tsx:55–84`), and the media/proof moved to documentation (`docs/media/showcase/README.md:3–9`). No application API, decimal/date, attachment or publication implementation changes appear in this diff.
- ✅ Focused coverage verifies image identity/loading, absence of homepage video requests, manual/keyboard selection, timer lifecycle, reduced motion, bounds, real search and both role destinations; a separate no-JavaScript test verifies the initial image (`tests/e2e/marketing-showcase.spec.ts:24–196`). Wide-center assertions are retained with the new frame selector (`tests/e2e/marketing-layout.spec.ts:5–15`).
- ⚠️ Cannot verify from text diff alone: binary appearance and historical database mutations. Controller-provided independent native/frame/source inspection addresses these; retained source/public version/hash evidence and exact owned IDs support the claims (`docs/reviews/2026-11-01-portal-refinement/showcase/2026-11-01T19-36-37-574Z/proof.json:1–83`, `showcase/preserved-user-record.json:1–9`). Final integrated browser suite remains controller-owned and pending. README/license/push are Task6.

### Strengths

- `apps/marketing/app/home/publication-showcase.tsx:34–77`: small, explicit state machine separates user playback intent from visibility and motion preferences; auto changes preserve focus, and subscriptions/timers have cleanup.
- `scripts/showcase/record.mjs:144–241`: ownership is captured from the actual creation response and retained alongside exact source/public field, version and three-way PDF hash checks; the script contains no incumbent-record update/delete path.
- `apps/marketing/public/showcase/README.md:3–13`: clear same-document provenance and separation of approved PNGs from later recording reruns avoid silent replacement or fabricated success.

### Issues

#### Critical (Must Fix)

- None.

#### Important (Should Fix)

- None.

#### Minor (Nice to Have)

- `.superpowers/sdd/2026-11-01-portal-refinement/task-5-report.md:59`: reported test output includes the inherited NO_COLOR/FORCE_COLOR warning. Remove the conflicting runner environment setting when maintaining the test harness so validation output is clean; this does not undermine the behavior assertions.

### Assessment

**Task quality:** Approved.

**Reasoning:** The final screenshot sequence matches the latest brief, keeps the actual recording as documentation media and preserves the real search/demo paths. No blocking correctness or maintainability defect found; no suites were rerun and no outside-diff code inspection was needed. Truncated tool output was recovered from the same immutable review package in bounded sections.
