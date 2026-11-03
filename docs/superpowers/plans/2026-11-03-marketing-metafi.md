# MetaFi marketing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Replace only the marketing portal with the approved MetaFi visual identity and officer-focused content, then run it locally.
**Architecture:** Marketing-local components, CSS tokens and Inter font isolate the redesign from shared UI and other portals. Reuse shadcn primitives, real product screenshots and runtime portal URLs.
**Tech Stack:** Next.js 16, React 19, shadcn/ui, Tailwind 4.
**Spec:** docs/superpowers/specs/2026-11-03-marketing-metafi-design.md

## Global Constraints
- Only marketing changes; citizen, office, backend, data and shared styles remain unchanged.
- Faithful MetaFi visual reconstruction; original OpenObec logo and truthful Slovak content.
- Five pages /home, /vyhody, /o-nas, /pricing, /kontakt; retain / and /demo compatibility.
- No seed, no fake contacts/testimonials, no purchase or unlicensed premium code.

## Review Focus
- Mobile menu, focus and Escape with long Slovak labels.
- Theme preference persistence, reduced motion and no-JS readable content.
- Configured portal URL destinations; no hardcoded broken deployment links.
- Honest pricing/contact behavior and actual loaded product imagery.
- Isolation of shared tokens and unchanged operational portals.

### Task 1: Complete coherent marketing replacement
**Files:** apps/marketing/app/**, apps/marketing/public/brand/**, apps/marketing/public/marketing/**, apps/marketing/package.json, pnpm-lock.yaml if necessary; marketing-only design documentation; tests/e2e/marketing*.spec.ts and affected marketing expectations only.
**Interfaces:** Consume publicLinks() runtime URLs and existing shadcn exports. Preserve MarketingHeader/MarketingFooter imports or update all marketing callers. Produce the five routes and compatible redirects.
- [ ] Read spec, reference captures/measurements and craft-floor; inspect installed Next documentation before edits.
- [ ] Write focused browser regressions for five routes/navigation, theme, mobile menu, FAQ, real assets and portal CTA; confirm relevant failures against incumbent build. Replace obsolete blue-panorama expectations only.
- [ ] Implement isolated theme, licensed Inter, original mark, header/footer and all five complete pages with reference geometry and truthful content.
- [ ] Run typecheck, lint, marketing build and affected tests; inspect responsive renders and fix a single batched set of findings. Verify no operational/shared source edits.
- [ ] Update marketing-specific design contract and product authority note; keep historical evidence intact. Commit only task files and report tests/limitations.

### Controller finish
- [ ] Independent code and visual review, resolve concrete findings.
- [ ] Rebuild/run marketing Docker image, check all three portals and existing data read-only.
- [ ] Capture final desktop/mobile proof, reset temporary viewport, present working links.
