# Assessment B — detector and browser evidence

Date: 2026-11-03. Independent assessment; no Assessment A output consulted. Source target: `apps/marketing/app`. This records the pre-refinement page state seen during inspection; concurrent parent changes may supersede it.

## Deterministic scan

Executed the bundled `/Users/simonochotnicky/.codex/skills/impeccable/scripts/impeccable detect --json apps/marketing/app` exactly once. Raw output is `detector.json`. Command returned exit 0 despite one advisory.

Count: **1 advisory**, rule `codex-grid-background`, name “Decorative grid-line background”, category `slop`, `apps/marketing/app/marketing.css:264` (two-axis grid-line gradient background). Source confirms `.home-hero::before` draws two gradients with 64px cells, opacity .42 and a fade mask. Screenshot confirms the grid behind the hero product image. This is a genuine decorative-grid match, not a functional data grid. It is a taste advisory, not an accessibility defect or automatic reason to remove the existing design.

No `.impeccable/critique/ignore.md` exists.

## Browser evidence

Created an independent background IAB tab at `http://localhost:3000`; it redirected to `/home`. Read native accessibility snapshots, DOM snapshots, read-only DOM link/style data, and a native screenshot. Visited `/home`, `/demo`, `/pricing`, `/kontakt`, `/vyhody`, `/o-nas`; each rendered the expected named page. No global viewport changes were made.

- The shared header's **Vyskúšať demo** links directly to `http://localhost:3002/uradnik/prihlasenie`, while other links named Vyskúšať demo / Sprievodca demom lead to `/demo`. This is the concrete routing inconsistency relevant to the requested demo chooser. The existing `/demo` page already distinguishes Pre úradníka and Pre občana, with named outgoing links to ports 3002 and 3001 respectively.
- The home primary CTA and repeated final CTA explicitly say Vyskúšať pracovný portál and point to the working portal. Their labels accurately describe that destination; generic demo links should be distinguished from these explicit role links.
- All inspected routes provide a skip-to-content link and a single visible primary heading. Source confirms the contact page has `main id="obsah"`, despite the native AX tree omitting the identifier there. Header source supplies `aria-current="page"` for the current navigation item.
- Product screenshots expose meaningful Slovak alt descriptions. Theme control has the accessible name Prepnúť tému. Demo search input is labeled Hľadať dokumenty. FAQ buttons expose expanded/collapsed state. Feature navigation exposes a tablist, tabs and associated named panel.
- Clicked the Prílohy a súvislosti feature tab: selected state and matching panel/image changed to the attachment-and-relations content. The selected tab's accessible name expands to include the full explanatory paragraph; this is verbose rather than unlabeled.
- Native AX presented four home editorial links with URL-only descriptions; read-only DOM inspection confirmed each contains descriptive heading/body text (e.g. Celý postup zverejnenia … Pozrieť viac). Do not report these as definitively empty accessible names based on that native snapshot alone.
- Read computed text color on `/o-nas`: navigation and paragraphs use rgb(109,116,135), 14–18px. Against the confirmed white page background this computes to **4.67:1**, passing normal-text AA narrowly. This is a sampled color pair, not a complete contrast audit; tinted cards, dark mode, hover and disabled states were not measured.
- Contact explicitly states that GitHub requires an account and that a new issue is public; no form submission was made. The only contact channel shown is a public GitHub issue, a concrete friction point for municipal staff that should be considered in the design assessment.
- Pricing identifies the managed service as planned, the 199 €/year as proposed, and ordering/payments as unavailable. No checkout was implied by this inspection.
- Browser warning/error log query after the initial four routes returned no entries. This does not establish absence of every network or console failure.

## Limits and cleanup

The browser's documented evaluate interface is read-only. Mutable title/script injection is unavailable; no forbidden mutation preflight was attempted, no overlay was injected, no human-visible overlay was claimed, and no detector live server was started. Browser console detector findings therefore do not exist. Fallback signal: CLI scan plus native screenshot/accessibility/DOM inspection.

The existing localhost application server was reused and left running. The independent temporary browser tab was closed. No temporary files beyond the requested audit artifacts were created. No source edits were made by this assessment. Outgoing portal targets and GitHub links were recorded but not traversed; mobile sizes, dark theme, full keyboard flow, and end-to-end demo creation/search remain outside this evidence sample.
