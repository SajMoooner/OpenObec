---
version: 1
slug: "apps-citizen-app-obcan-home-page-tsx"
primary_target: "apps/citizen/app/obcan/home/page.tsx"
related_targets: ["apps/citizen/app/obcan/[agenda]/page.tsx"]
---

# Working portals OpenObec

Mode: Operate. Users: citizen finding published documents; official entering, linking and publishing records. Pinned world: standard shadcn/ui; only colors from IDSK3. Default Geist typography, standard components, spacing and layout conventions. No IDSK fonts or components.

## Direction contract

THESIS: Familiar task-first screens let users find or publish a document without learning a visual metaphor.

OWN-WORLD: White shadcn tables/forms and neutral dividers; IDSK3 navy office sidebar, pale blue selection, dark blue accessible primary buttons. Geist is used throughout.

STORY: Citizens search across six agendas then read full details and related files. Officials see live counts, enter concrete fields, optionally link records and add files before publication. Errors retain inputs and name the recovery.

FIRST VIEWPORT: Citizen home has a simple top navigation, readable heading, one full-width search and six agenda links; lists put filters above tables. Office uses the standard shadcn sidebar and header with a clear work area; forms constrain reading width and group fields by purpose. Mobile uses the shadcn sheet/sidebar controls.

FORM: The product shell and controls remain conventional. The single signature is an explicit related-document section, never a decorative graph. World inherits the user's chosen shadcn standard. seed:bf2abb90da53d612.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
