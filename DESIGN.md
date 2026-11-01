---
name: "OpenObec"
description: "Standard shadcn/ui and self-hosted Geist, with IDSK3 colors for municipal document workflows."
colors:
  background: "#ffffff"
  foreground: "#072c66"
  card: "#ffffff"
  card-foreground: "#072c66"
  popover: "#ffffff"
  popover-foreground: "#072c66"
  primary: "#0b4199"
  primary-foreground: "#ffffff"
  secondary: "#eff5fe"
  secondary-foreground: "#072c66"
  muted: "#f5f5f5"
  muted-foreground: "#616161"
  accent: "#eff5fe"
  accent-foreground: "#072c66"
  destructive: "#c3112b"
  border: "#e0e0e0"
  input: "#bdbdbd"
  ring: "#126dff"
  sidebar: "#072c66"
  sidebar-foreground: "#ffffff"
  sidebar-primary: "#ffffff"
  sidebar-primary-foreground: "#072c66"
  sidebar-accent: "#0b4199"
  sidebar-accent-foreground: "#ffffff"
  sidebar-border: "#0b4199"
  sidebar-ring: "#88b3f6"
typography:
  display:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline-wide:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1111111111
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  title-section:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5555555556
    letterSpacing: "0em"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  body-compact:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4285714286
    letterSpacing: "0em"
  label:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0em"
  metadata:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3333333333
    letterSpacing: "0em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  full: "2147483647px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  "16": "4rem"
  "20": "5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.5rem 1rem"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.5rem 1rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.5rem 1rem"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.5rem 1rem"
  button-ghost:
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.5rem 1rem"
  button-link:
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.5rem 1rem"
  text-input:
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0.25rem 0.75rem"
    width: "100%"
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.5rem"
  document-panel:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  sidebar-item:
    textColor: "{colors.sidebar-foreground}"
    rounded: "{rounded.md}"
    height: "2rem"
    padding: "0.5rem"
---

# Design System: OpenObec

## Overview

**Creative North Star: "Standard shadcn/ui"**

OpenObec uses the user-selected standard shadcn/ui New York visual language: familiar controls, self-hosted Geist, white work surfaces and restrained blue emphasis. IDSK3 supplies colors only; it does not supply typography, components or spacing. The visual priority is readable Slovak document names, field labels and explicit publication state.

The marketing home has its own approved navy opening, raster civic panorama and overlapping document register. Those choices describe that surface; they are not a template for citizen searches, office lists or editors. Working portals remain conventional and task-first, with a navy office sidebar and pale-blue interaction states.

**Key Characteristics:**
- Genuine shadcn/ui controls and New York conventions.
- One self-hosted Geist family across all three applications.
- IDSK3 navy, action blue, white and neutral dividers.
- Readable document information and visible status at narrow widths.

## Colors

The palette combines civic navy, dark action blue, pale-blue states and neutral white surfaces. The frontmatter preserves the exact semantic values in the shared stylesheet, including aliases with the same color.

### Primary
- **Action Blue** (`primary`): primary buttons, links and emphasis.
- **Focus Blue** (`ring`): visible keyboard focus and the brighter marketing action treatment.
- **Civic Navy** (`foreground`, `sidebar`): text, office navigation ground and marketing opening.
- **Light Sidebar Focus** (`sidebar-ring`): focus against the dark navigation ground.

### Secondary
- **Pale Blue** (`secondary`, `accent`): secondary buttons, hover surfaces and the marketing offer field; their foreground aliases remain navy.

### Neutral
- **White** (`background`, `card`, `popover`): work surfaces and overlay surfaces; the corresponding foreground aliases remain navy.
- **Muted Neutral** (`muted`): subdued states and skeleton surfaces.
- **Muted Text** (`muted-foreground`): supporting labels, record numbers and descriptive copy.
- **Divider Gray** (`border`): panel edges and row separation.
- **Input Gray** (`input`): stronger field boundary.
- **Destructive Red** (`destructive`): destructive actions and validation/error feedback, not a decorative accent.

**The Colors Only Rule.** Use IDSK3 for the palette only. Keep typography, components and spacing in the approved shadcn/ui system.

Selection and scrollbars retain their additional base-stylesheet colors. Color mixes and alpha states derive from the semantic palette. There is no implemented dark palette: the components contain upstream dark-state utilities, but the shared stylesheet defines only the current light theme and navy navigation.

## Typography

**Display Font:** self-hosted Geist Sans, with ui-sans-serif / system-ui / sans-serif fallbacks.
**Body Font:** the same family. There is no separate display or mono family in the implemented interface.

**Character:** clear and conventional. Hierarchy comes from size, weight and spacing, with sentence-case labels and slightly tightened headings. The installed font imports provide normal weights 400, 500, 600 and 700.

### Hierarchy
- **Display:** marketing uses `clamp(2.25rem, 4vw, 3.5rem)` with a 1.08 line height. Secondary page titles use 2.25–3rem. Headlines remain bounded on wide monitors; the old container-scaled comp is historical, not the current geometry.
- **Headline / Headline wide:** the ordinary page heading is the headline token; citizen home increases to headline-wide from the small breakpoint. Detail headings start one step smaller and grow to headline at that breakpoint.
- **Title / Title section:** section headings and editor field-group titles; title-section also appears at medium weight in login and empty-state headings.
- **Body:** ordinary descriptive copy. Longer prose in the implementation uses a 1.75 rem line height where space permits and a `max-w-prose` measure (65ch).
- **Body compact:** tables, detail values, supporting labels and compact descriptions. Record-detail values use a 1.5 rem line height for readability.
- **Label:** form labels at medium weight and a tight line height; buttons use the same size/weight with a 1.25 rem line height.
- **Metadata:** record numbers, helpers and badges. Badges use medium weight rather than metadata’s normal weight.

**The Shared Typeface Rule.** Use the self-hosted Geist Sans family for headings, controls and body copy. Generated comp font-matcher metadata is not the implemented font authority.

## Layout

The shared spacing vocabulary follows the existing quarter-rem utility scale in the frontmatter. Content shells use a maximum width of 80 rem. Citizen pages use 1 rem side gutters, growing to 1.5 rem from the small breakpoint; office content grows from 1 rem to 1.5 rem and then 2 rem at the large breakpoint. Headers are 4 rem high. Editors constrain the main form to 56 rem; citizen search content uses 48 rem. Information groups use gaps and spacing of 1–1.5 rem, with larger separation between page sections.

The small, medium and large breakpoints are recorded in the sidecar. Citizen navigation moves into a Sheet below medium. The office sidebar is 16 rem on desktop, 18 rem in its mobile Sheet and 3 rem when icon-collapsed. Agenda grids change column count with available width; this is a task-dependent layout rather than a universal card grid.

Below the large breakpoint, document tables use a wide wrapping title/number column and a narrow 3 rem action column. Agenda, publication state and amount group beneath the title; desktop restores their separate columns and date. Preserve this grouping instead of squeezing names into narrow columns. Marketing tabs and its illustrative table retain local horizontal scrolling; that behavior is specific to the preview.

Marketing uses a centered maximum 80rem container with 1.5rem gutters. Its navy introduction and panorama lead into the overlapping functional search/register. The product story follows with two real, labeled screenshots of synthetic demo records, arranged beside short scenario copy and stacked below 1024px. Benefits and Demo reuse these previews; Contact states the actual project/contact limits. Sections use 4rem vertical spacing, reduced to 3rem on small screens. The approved refinement supersedes the historical 1536:1024 comp geometry without changing that archived evidence. No screenshot is presented as an interactive control.

## Elevation & Depth

White surfaces, neutral borders, pale fields and the navy sidebar carry most hierarchy. Ordinary document panels have no shadow. Inputs and outline buttons retain the stock extra-small shadow; menus, dialogs and Sheets use the existing overlay shadows. The marketing search adds a subtle focus-within shadow. Exact shadow and motion values live in the sidecar.

**The Quiet Surface Rule.** Keep document panels flat with borders. Reserve the existing small control shadows and overlay elevation for their functional roles.

State changes retain the stock short transitions. Sidebar movement is linear over 200 ms; the marketing search uses its implemented 180 ms easing. The marketing opening disables transitions when reduced motion is requested. The documentation does not extend that local reduced-motion rule to all upstream component animations.

## Shapes

Controls use the medium radius; panel edges generally use large, with extra-large on login and demo-choice containers. The shared base radius is large. Small is available for focus/link and small internal details. Badges are fully rounded. Panels use a single neutral border; record rows use horizontal dividers, and empty states use the existing dashed border. Circular icon fields occur in the approved marketing benefits and workflow; they are not a replacement shape for ordinary controls.

## Components

### Buttons

Stock shadcn/ui variants, with compact sentence-case labels. Default height is 2.25 rem with medium corners and the tokenized padding; a direct child icon reduces horizontal padding to 0.75 rem. Small is 2 rem high, large is 2.5 rem; search actions explicitly grow to 2.75 rem. Icons default to 1 rem.

Primary uses action blue with white text; destructive uses red. Outline is white with a neutral border and tiny shadow; secondary uses pale blue; ghost adds its pale hover field; link uses underlining on hover. Primary/destructive hover uses 90% of its base color, secondary 80%, and outline/ghost use the accent field. Keyboard focus uses a 3 px ring at 50% focus-blue opacity and the focus-colored boundary; destructive focus uses its existing red ring at 20%. Disabled controls have half opacity and do not accept pointer input. Marketing’s existing larger actions and white secondary action are explicit local overrides, not another shared button family.

### Chips

The implemented chip is the Badge. Secondary marks Zverejnené with pale blue; outline marks Koncept and agenda labels with a white/transparent field and neutral boundary. Use text as well as color. Default badges have full rounding, metadata-size medium text and the frontmatter padding. Link badges retain their upstream hover and focus treatment.

### Cards / Containers

The project uses bordered section containers rather than a shared Card component. Document panels use large corners, a white field, no shadow, 1.25 rem padding and 1.5 rem padding from the small breakpoint. Table wrappers may have no inner padding. Login and the two-part marketing demo choice use extra-large corners. Do not invent a Card API from these section patterns.

### Inputs / Fields

Stock Input uses medium corners, input-gray stroke, a transparent field, tiny shadow, 2.25 rem height and tokenized padding. Text is body-size below medium and compact above it. SearchBox grows to 2.75 rem and adds a leading SVG search icon; marketing has its own measured input. Focus matches buttons. Invalid fields use destructive stroke/ring, with text feedback associated to the field; disabled fields use half opacity. Labels remain explicit even where visually hidden for a search field.

### Navigation

Citizen navigation has a white header, text wordmark and ghost agenda links, with a Sheet on narrow viewports. The office uses the genuine Sidebar: white text on navy, action-blue active/hover fields, medium item corners, 2 rem default item height and a 2 px light-blue keyboard ring. Active items use medium weight. Mobile route selection closes the Sheet. Marketing navigation belongs to its approved opening and keeps its compact demo action on mobile.

### Document records and related documents

Records preserve a linked title, muted number, agenda, amount, publication state in office mode and an explicit open action. The responsive grouping described in Layout is part of this pattern. Related documents are labeled expandable rows using the existing Accordion, with full fields and file actions in the expanded content. They are not rendered as a decorative graph.

## Do's and Don'ts

### Do:
- **Do** use the shared semantic colors and genuine shadcn/ui components.
- **Do** preserve readable document titles, explicit Koncept / Zverejnené labels and visible open actions on mobile.
- **Do** use stock Lucide SVG icons with accessible names for icon-only actions.
- **Do** keep the approved panorama and bounded register composition specific to the marketing home.

### Don't:
- **Don't** import IDSK typography, components or spacing.
- **Don't** replace self-hosted Geist with the generated comp matcher’s Google Sans Flex candidate.
- **Don't** turn the marketing home composition into a global page-composition rule.
- **Don't** introduce decorative eyebrow labels or unsupported customer, saving or compliance claims.
