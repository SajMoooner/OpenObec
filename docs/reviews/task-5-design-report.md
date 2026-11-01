# Task 5 — documented built visual system

Status: complete. Created DESIGN.md and .impeccable/design.json from the finished source, approved direction and current reviewed captures. No pre-existing DESIGN.md was overwritten. No source, staging/index or build-state mutation was performed.

## Inputs inspected

- Shipped documenter role and reference/document.md in full.
- PRODUCT.md; all three app surface briefs; .impeccable/review/finish-input.md and the historical review plus final ship verdict in finish-review.md.
- Shared globals.css, Button, Input, Badge, Table, Tabs, Label and sampled Sidebar/Dialog/Sheet/DropdownMenu code.
- Shared citizen, dashboard, shell, records/search, detail, editor, list, login and reference-picker patterns.
- Marketing hero, marketing.css, hero-geometry.css, lower sections and demo-choice containers; shadcn components.json and self-hosted font dependency/imports.
- Current marketing desktop, citizen home desktop and repaired office dashboard mobile captures opened visually. Finish review supplies broader capture coverage; this documentation pass did not rerun behavior tests or another detector.
- Installed Tailwind theme plus built CSS for default type, spacing, shadows, breakpoints, transitions and compiled full rounding.

## System summary

Palette: 26 exact semantic CSS colors, preserving IDSK3 navy/action-blue/pale-blue/white/neutral aliases.
Type: self-hosted Geist Sans, weights 400/500/600/700, nine observed hierarchy roles with marketing display scoped locally.
Shape and spacing: five observed corner values and eleven reused quarter-rem spacing steps; compiled full radius preserved exactly.
Components: ten frontmatter component entries and ten standalone HTML/CSS previews, including six genuine button variants, Input, Badge, section panel and Sidebar navigation.
Named rules: Colors Only, Shared Typeface and Quiet Surface; approved navy/skyline/register remains marketing-specific.

## Validation

- YAML parsed successfully with the workspace js-yaml package. Only canonical top-level groups are present.
- All 26 colors match shared :root values exactly; no primitive references other primitives.
- All 26 component token references resolve, and component properties stay within the eight allowed properties.
- All eight canonical Markdown sections appear in the required order.
- SchemaVersion 2 JSON parses successfully, contains extensions only rather than duplicate primitive arrays, and its color/type metadata keys match the frontmatter.
- Each color carries eight synthesized OKLCH preview ramp steps. These are sidecar preview metadata, not fabricated implementation tokens or IDSK3 palette replacements.
- All ten previews have expanded standalone CSS and ds-prefixed HTML classes; no framework runtime, external image, icon package or script dependency. Interactive previews retain focus/hover states; passive badge/panel previews do not invent interaction.
- Narrative overview, characteristics, three rules, do/don't lists and North Star match DESIGN.md. Standard shadcn/ui is the existing user-selected reference, not a newly invented metaphor.
- Documentation-only edits require no application rebuild. Existing controller-owned responsive/finish gates remain independent.

## Not canonized or repaired

Generated hero-geometry.css still carries a Google Sans Flex matcher-candidate metadata value. The actual shared font and approved user choice are self-hosted Geist; the stale matcher value is neither a typography token nor a future implementation rule. The local marketing reduced-motion override was documented at its observed scope rather than claimed as a global component guarantee. No remaining finish-review defect was promoted to a rule; documentation does not certify an exhaustive accessibility audit.
