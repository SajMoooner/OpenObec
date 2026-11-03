# OpenObec marketing design

Mode: Persuade. Audience: municipal officers assessing document publishing. Primary action: try the working portal. Authority: user-approved MetaFi replacement, 2026-11-03, documented in `docs/superpowers/specs/2026-11-03-marketing-metafi-design.md`. This replaces the navy/panorama/Geist composition for marketing only. Root DESIGN.md remains authoritative for citizen and office portals.

## Visual system

Reference: public rendered https://metafi-nextjs-template.vercel.app/ and its features/about/pricing/contact routes. Measurements and visual evidence: `docs/design/2026-11-03-metafi/reference/`. Implementation is original React using the project's existing shadcn Button, Sheet, Tabs, Accordion and Input; no purchased or copied premium source.

- Local Inter upright variable font, weights 400/500/600, with SIL OFL license in public/fonts. Headings 500, desktop h1 68px/1.25, h2 48px/1.25; mobile h1 36px and h2 32px. Tracking -0.03 to -0.035em.
- White background; near-black foreground/buttons `oklch(.172 .006 286.3)`; neutral border `oklch(.924 .003 255.9)`; purple #6055f5 for closing CTA and feature emphasis. Muted text #6d7487 is slightly darker than the reference for readability.
- Dark background `oklch(.23 .02 265)` follows the blue-gray reference; light text, matching card/line surfaces, retained purple closing CTA. Screenshots retain their authentic light product interfaces.
- 1152px centered content, 24px minimum side gutters. 80px header. 112px desktop/72px mobile major section spacing. The template's purchase banner is omitted.
- Original circular geometric mark with open doorway and detached square, 34px alongside Inter wordmark. Light/dark SVG assets in public/brand; same geometry used in favicon and live brand.
- 48px main actions, 8px corners; 12–16px panels; 20px pricing cards. Thin neutral lines and restrained downward image shadows.

## Composition by route

Home: centered two-line product statement, paired actions, 994×386 desktop crop of the authentic office dashboard over a fading grid, six agenda names, 2×2 product panels, six agenda blocks, pale three-step workflow band, narrow FAQ, 2×2 editorial links, full-width purple CTA and black footer.

Benefits: two-column hero; three concise benefits; vertical keyboard-operable workflow tabs with actual screenshots; alternating public-portal story; six agenda blocks and explicitly planned IS integrations.

About: centered statement and wide real product capture; split origin story with verifiable project facts (6 agendas / 2 portals / open code); six project principles in a pale band. No fictional team/customer photographs or claims.

Pricing: two cards with internal split columns, purple proposed managed service and white self-hosted option; agenda summary; comparison table; FAQ. Proposed 199 €/year is clearly not a checkout, and implementation/VAT remain unspecified.

Contact: centered heading over a soft background, overlapping 768px white panel containing genuine GitHub and demo paths. No fake email address or delivery form. A public-issue note explains visibility and avoids encouraging private municipal data disclosure.

Demo: two real portal entry points, three steps for each role, actual screenshots and a functional citizen document search.

## Interaction and accessibility

Theme button `aria-label="Prepnúť tému"`, `aria-pressed` for dark; storage key `openobec-marketing-theme`, document `data-theme` and `.dark` class. An inline initial script applies the saved choice before render. Storage failure does not disable switching; cross-tab changes synchronize.

Mobile trigger `Otvoriť navigáciu`; shadcn Sheet provides focus containment/Escape; `Mobilná navigácia` names the landmark; selected page has aria-current. Footer links and desktop navigation remain real anchors. Theme tokens live only in the marketing app and also apply to its Sheet portal.

FAQ uses shadcn Accordion. Workflow uses vertical shadcn Tabs with ArrowUp/ArrowDown and visible selected text. Content starts visible; no autoplay, scroll-reveal dependency or video requests. Reduced-motion removes transitions. A visible-on-focus skip link goes to #obsah.

Every portal action consumes publicLinks() runtime destinations. Demo data is labeled synthetic. Real screenshots and existing README provenance are preserved byte-for-byte. Decorative image crops never pretend to be interactive UI.

## Verification

Focused browser regressions cover six routes at 390/768/1440/2560px, bounded containers, theme persistence, mobile navigation/focus, FAQ, workflow tabs, authentic image hashes, no-JavaScript usefulness, demo links and real search. Reference and candidate desktop/mobile screenshots are reviewed as a batch. A controller performs final deployment and verifies operational portals unchanged.
