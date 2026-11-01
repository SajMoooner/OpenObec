### Task 5: Three complete portals and shared UI

**Files:** `apps/{marketing,citizen,office}/`, `packages/{ui,api-client,config}/`, frontend root workspace/lockfile, `.impeccable/` visual artifacts, `DESIGN.md`, frontend tests.

**Interfaces:** REST calls use gateway through same-origin server adapter, fixed municipality, no-store. Public adapter forces published=true, checks domain VZN publication and attachment parent state. Local browser addresses 3000/3001/3002, internal addresses runtime env only. API client types generated from OpenAPI. Forms use strict agenda-specific schemas, linked reference picker and actual upload; no mock persistence.

- [ ] Complete Impeccable direction/comp selection with user, retain approval and prompt provenance. Read craft-floor immediately before UI edits.
- [ ] Create genuine shadcn/ui components and local Geist fonts. IDSK3 contributes colors only, never components, typography or spacing. Write tests for API error parsing, typed form conversion, whole related cursor accumulation and partial search failure; observe red before implementation.
- [ ] Implement citizen search across six lists, six agenda tables/details, published-only attachments and all pending/empty/error states. Run focused tests green.
- [ ] Implement office demo entry, live dashboard, six create/update/delete/publish flows, own versus inverse links, file upload and simulated IS settings. Assert saved data survives navigation; keep dirty inputs on errors.
- [ ] Implement marketing faithfully from approved comp, benefits/contact/demo routes with honest price and no invented contacts. Independent Dockerfile/README per app.
- [ ] Build/typecheck/lint all three apps; desktop/mobile visual inspection, Impeccable detector and fresh visual review. Commit task files.
