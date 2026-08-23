# Hybrid Design Specification

## Final experience direction

The finished website should feel cinematic in the first seconds and precise as soon as the visitor needs to evaluate. It is not Website A with extra atmosphere, and not Website B with extra pages stapled on.

**First 5–10 seconds:** oversized “The standard, made visible.” over the cloud world; one plainspoken sentence that names who it is for and what becomes possible; two visible actions.

It elevates Empyré by looking like B (taste, scale, restraint) and behaving like A (routes, services, inquiry). Service clarity comes from four editorial cards that route to dedicated pages. Conversion comes from a persistent **Start a project** action and a two-step inquiry.

## Homepage architecture

1. Header and quieter primary nav (Work, Services, System, About, Notes) + Start a project
2. Cinematic hero with hybrid copy and dual CTAs
3. Compact operating-model band (not “Selected collaborations”)
4. Point of view: a brand is not a logo
5. Featured studio case study
6. Four-engagement selector (curated cards)
7. Six-part Empyré Signature
8. Honest evidence / private-work module
9. Five movements: Understand, Define, Build, Deploy, Transfer
10. Founder authority
11. One note
12. Inquiry invitation
13. Footer

## Design system

- **Type:** Inter Tight (variable) + Instrument Serif italic for emphasis
- **Display:** clamp ~3.6rem to 10.4rem (B’s scale, slightly constrained for readability)
- **Body:** ≥ 1.0625rem, line-height 1.65, muted `#C9C5BE` on `#0B0F13`
- **Color:** ink `#0B0F13`, bone `#ECE9E4`, sand `#F8F5F2`, ember `#FF5A3C`, hairline rules
- **Space:** section clamp 5.5–10.5rem (shorter than B’s chapter gaps)
- **Buttons:** primary ember fill; secondary hairline; 52px min height; full-width on small screens
- **Motion:** hover lift and image scale only; disabled under `prefers-reduced-motion`
- **Focus:** 2px ember outline, 4px offset
- **Nav:** desktop uppercase quiet links; mobile full-screen authored drawer

## Hybrid source map

### KEEP FROM WEBSITE A

- Multi-page architecture → all routes
- Buyer-specific hero meaning → homepage hero support line
- Service qualification depth → four service pages
- Qualified inquiry fields → `/contact/` step 2
- Six-component system → `/system/` and homepage overview
- Founder and fit → `/about/` and homepage studio module
- SEO-ready structure → titles, descriptions, schema, sitemap (held noindex in preview)
- Dual CTAs → Start a project / Explore selected work
- Notes + case-study templates → `/notes/`, `/work/empyre-studio/`
- Accessibility statement, skip link, form labels

### KEEP FROM WEBSITE B

- Cinematic hero composition and cloud world
- Editorial compression and manifesto lines
- Distinctive visual pacing, hairline grids, ember signals
- Method naming: Understand, Define, Build, Deploy, Transfer
- Premium service studies as visual objects
- Mobile drawer aesthetic
- Private work framed as principle (“the floor, not the ceiling”)
- Philosophy: strategy before surface; systems before artifacts; owned, not rented

### BUILD NEW

- Hybrid hero copy (audit wording)
- Shorter homepage with one job per section
- Progressive two-step inquiry
- Evidence architecture that does not invent clients
- Outcome-led service cards (stakes before file lists)
- Expanded case-study template (diagnosis → decisions → applications → outcome)
- Price framing: “engagements begin at” without Q3 scarcity
- Contact as CTA, not a primary-nav label
- Preview noindex / robots Disallow

### EXCLUDE

- Mandatory preloader
- “Selected collaborations” label without collaborations
- Repeated service/method manifesto on the homepage
- Stale Q3 spot counts
- Nested closed accordions for essential offer information
- Mailto-only conversion and misspelled `empyreatudio` hrefs
- `http://empyre.studio` social destination until a verified profile exists
- Invented testimonials, logos, metrics, or client names
