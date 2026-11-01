### Spec Compliance

- ✅ Spec compliant for the requested centered, expanded marketing homepage, with the minor copy correction below. The shared container caps at 80rem and pads by 1.5rem (`apps/marketing/app/home/marketing.css:1`); hero and register use that container (`apps/marketing/app/home/hero.tsx:60`, `:98`), and the reused header has matching max-w-7xl/px-6 geometry (`apps/marketing/app/components/site-shell.tsx:14`). The new user instruction explicitly supersedes the earlier absolute composition (`apps/marketing/.impeccable/surfaces/apps-marketing-app-home-page-tsx.md:25`).
- ✅ Requested content is present: two hero demo destinations (`apps/marketing/app/home/hero.tsx:72`, `:78`), citizen/office benefits (`apps/marketing/app/home/sections.tsx:61`), six agendas (`:153`), three steps (`:187`), proposed 199 EUR/year with setup/DPH undetermined (`:225`, `:229`), practical FAQ (`:272`), and final demo section (`:290`). The unchanged DemoLinks call remains in the diff context at the end of that section.
- ✅ Approved panorama is retained at the same asset URL (`apps/marketing/app/home/hero.tsx:87`). Existing shadcn Button/Input/Tabs/Table remain in use and Accordion is imported from the shared UI package (`apps/marketing/app/home/sections.tsx:6`). No dependency, font, palette, or new raster change appears in this package. Synthetic data and future IS integration are explicitly distinguished from real data/integration (`apps/marketing/app/home/hero.tsx:105`; `apps/marketing/app/home/sections.tsx:40`, `:293`).
- ✅ Search retains GET submission and q input (`apps/marketing/app/home/hero.tsx:107`, `:118`), agenda tabs retain the shared AGENDAS list (`:131`), and table links retain actual citizen agenda destinations (`:160`). The existing three-row example behavior remains illustrative; this change does not replace it with an invented API result.
- ⚠️ Cannot verify from diff: actual screenshots, visual finish, mobile browser overflow, endpoint health, all 21 existing agenda actions, current container images, inherited Geist/token definitions, and unchanged API/backend behavior. The controller reports those tests/builds/captures in `task-7-report.md`; I did not rerun them or independently inspect their raw logs. Fresh visual review is a separate gate. The new tests cover wide centering/font cap and actual FAQ expansion (`tests/e2e/marketing-layout.spec.ts:2`, `:20`).

### Strengths

- The change removes the home import of absolute hero geometry (`apps/marketing/app/home/page.tsx:5`) and replaces viewport-scaled layout with a short, readable grid/container stylesheet (`apps/marketing/app/home/marketing.css:1`, `:71`). This directly addresses the stated wide-screen problem without changing the product world.
- Content is grounded in the actual product: attachment types/limits match `contracts/openapi.yaml:770`, descriptions match the six-agenda ordering in `packages/api-client/src/agendas.ts:38`, and the relations/VZN explanation matches its explicit related lists (`apps/marketing/app/home/sections.tsx:32`; `packages/api-client/src/agendas.ts:92`, `:143`). Proposed pricing avoids pretending that setup or tax details are settled (`apps/marketing/app/home/sections.tsx:44`).
- Browser assertions check measured geometry and user-observable FAQ content, rather than only matching classes (`tests/e2e/marketing-layout.spec.ts:6`, `:35`). Local tab overflow and the existing Table wrapper remain compatible with narrow layouts (`apps/marketing/app/home/marketing.css:32`, `:40`).

### Issues

#### Critical (Must Fix)

- None found in this scoped diff.

#### Important (Should Fix)

- None found in this scoped diff.

#### Minor (Nice to Have)

- `apps/marketing/app/home/sections.tsx:18`: procurement copy lists “postup”, but the implemented procurement form and API expose “stav” rather than a procedure field (`packages/api-client/src/agendas.ts:112`; `contracts/openapi.yaml:9859`). In public-procurement wording, “postup” suggests the procurement procedure, which the demo does not capture. Replace it with “stav” to keep the expanded marketing description precise.

### Assessment

**Task quality:** Approved, with one minor copy correction recommended.

**Reasoning:** The bounded layout, richer product information, retained interactions, and honest price/IS disclosures satisfy this task without widening backend scope. The diff introduces no blocking behavior or maintainability defect; visual approval remains with the separately commissioned visual reviewer.

**Checks performed:** Read the brief, implementer report, and full supplied `review-5f24195..8c7d992.diff` (the initial combined output was truncated, so missing diff ranges were read separately). No git command or test suite was run. Focused unchanged-code checks addressed three named risks: matching header/container geometry (`apps/marketing/app/components/site-shell.tsx:14`), positional agenda descriptions and relation claims (`packages/api-client/src/agendas.ts:38`), and newly added feature/attachment copy against the actual contract (`contracts/openapi.yaml:770`, `:9859`). No changed source file was read separately; new line references were derived from diff hunk offsets. Only this review report was written.

### Follow-up resolution

- ✅ Resolved: focused inspection of `apps/marketing/app/home/sections.tsx:18` confirms “Predmet zákazky, stav, predpokladaná hodnota a lehota ponúk.” The only Minor finding is closed.
- **Spec compliance:** Approved. **Task quality:** Approved. Scope and previously recorded limitations remain unchanged. No additional code search or test run was performed; the controller reports subsequent build, marketing-regression, and visual verification separately.
