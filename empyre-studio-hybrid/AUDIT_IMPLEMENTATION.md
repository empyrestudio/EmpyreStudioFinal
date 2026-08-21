# Audit implementation register

Source: Empyré Studio — Website Comparison Audit (20 August 2026).  
Workspace: local `empyre-studio-hybrid` (no GitHub repository created, per instruction).  
Live domain: **not modified**.

## Audit Extraction Summary

- **Audit-selected final hybrid direction:** Website A architecture + Website B art direction. “Choose A to operate. Use B to elevate.”
- **Primary business objective:** Make Empyré easier to understand, trust, evaluate, and hire without losing premium perception.
- **Primary conversion objective:** Qualified project inquiries via a visible CTA path and a working form (email as fallback only).
- **Target audience:** Ambitious founders and growing teams; businesses in transition; new ventures; established brands ready to evolve.
- **Core Empyré positioning to preserve:** “The standard, made visible.” Strategic brand-systems studio. Not a logo vendor.
- **Brand attributes to preserve:** Premium, editorial, cinematic, precise, selective, intelligent, crafted.
- **Website A strengths to retain:** Audience/outcome clarity; dual CTAs; four service pages; system page; inquiry + thank-you; founder/fit; SEO templates; mobile CTA visibility.
- **Website B strengths to retain:** Cinematic entrance; POV compression; philosophy language; private-work framing; curated service studies; Understand–Transfer naming; restraint; mobile drawer.
- **New hybrid elements to build:** Hybrid hero; shorter homepage; proof architecture; progressive inquiry; outcome-led services; robust case-study template; launch governance (noindex, legal, redirects, measurement).
- **Critical recommendations:** Repair contact destinations; complete legal/privacy placeholders; build a credible proof layer.
- **High-priority recommendations:** Hybrid hero; reframe price/availability; expand case studies; progressive inquiry; raise contrast; edit homepage / expose B essentials.
- **Medium-priority recommendations:** Production migration and measurement plan.
- **Low-priority recommendations:** None numbered below the ten; remaining items are blueprint details implemented with the above.
- **Recommended homepage structure:** Hero → operating band → POV → featured proof → four engagements → six-part system → evidence → method → founder → one note → inquiry.
- **Navigation recommendations:** Work, Services, System, About, Notes + distinct Start a project. B’s quieter type and drawer. No Contact in the primary row.
- **CTA and conversion recommendations:** One primary label “Start a project”; proof CTA “Explore selected work”; service-specific inquiry links; email fallback; two-step form.
- **Content and messaging recommendations:** Two-layer copy (editorial headline + plainspoken explanation). A’s specificity at B’s compression. No repeated manifesto.
- **Service-tier recommendations:** Dedicated pages; homepage cards curated; lead with business stakes; ranges on detail/inquiry, not homepage hero.
- **Empyré Signature recommendations:** Six components with plain-language jobs and scope caveats; lead with ownership/transfer value.
- **Process-section recommendations:** Understand, Define, Build, Deploy, Transfer. Client-role/output detail on inner pages.
- **Mobile recommendations:** One CTA before scroll; contrast; no nested accordion for basics; 44px targets; shorter gaps than B; reduced motion.
- **SEO recommendations:** Unique titles/descriptions; H1; service URLs; canonicals; schema; sitemap/robots; noindex previews; no keyword stuffing.
- **Accessibility recommendations:** Contrast on muted text; focus; labels; skip link; keyboard menu; reduced motion; no AA certification claim.
- **Performance-sensitive recommendations:** No mandatory preloader; responsive images; font preload; restrained motion.
- **Elements specifically recommended for removal:** Preloader gate; Selected collaborations label; repeated homepage copy; stale scarcity; B nested accordions; low-contrast microtype; mailto-only / broken links.
- **Existing features that must remain:** Four services; six Signature components; process; inquiry; policies; notes; about; work.
- **Required new pages or components:** Hybrid homepage; evidence module; two-step form; expanded case study; quieter header; authored drawer.
- **Required new content modules:** Operating-model band; private-work proof; pending-permission testimonials slot.
- **Recommendations requiring client-provided copy/imagery/proof:** Named logos, testimonials, quantified outcomes, founder photography, verified social profile, additional case studies.
- **Recommendations requiring legal/licensing/credential/deployment approval:** Legal entity and jurisdiction; retention schedule; production domain, DNS, analytics events, Netlify production forms, Search Console.
- **Recommendations that appear ambiguous or conflicting:** Process naming (brief listed Discovery–Elevation; audit requires Understand–Transfer). **Resolved in favor of the audit.** Price transparency vs premium perception: **resolved as “engagements begin at” on service/inquiry pages, not homepage.**

## Technical foundation decision

- **Selected foundation:** Clean static HTML/CSS/JS modeled on Website A’s IA.
- **Why:** Audit: “Build the hybrid on Website A’s foundation.” Source GitHub repos were not provided. Both live sites are static (Inter Tight, Instrument Serif, shared imagery). Recreating A’s routes in a clean static base was the safe, maintainable path.
- **Retained directly:** Public brand assets (wordmark, lockup, cloud studies, fonts) already published on the live/preview hosts.
- **Recreated:** Header, pages, CSS, JS, form, metadata.
- **Adapted from B:** Hero scale, drawer, manifesto lines, method names, service-study presentation.
- **Risks:** Cannot pixel-match unpublished source components; Netlify Forms only live once hosted; no analytics in this preview.
- **Safeguards:** noindex; no secrets; no live-domain changes; no invented proof.

## Status legend

- **Implemented** — in this workspace
- **Implemented with adaptation** — intent kept; technical or content constraint
- **Deferred** — blocked on assets, legal, credentials, or production access
- **Rejected** — documented conflict

| ID | Exact audit recommendation | Priority | Category | Source A / B / New | Build? | Status | Reason / adaptation | Validation |
|---|---|---|---|---|---|---|---|---|
| R01 | Repair every contact destination; correct B mailto `hello@empyreatudio.info` | Critical | Conversion | Both | Yes | Implemented | All mailto and visible address use `hello@empyrestudio.info` | Grep: no `empyreatudio` |
| R02 | Replace A’s `http://empyre.studio` social with a verified profile | Critical | Conversion | A | Yes | Deferred | No verified social URL provided; link omitted rather than repeated | Footer has email only |
| R03 | Automated link check before launch | Critical | Technical architecture | New | Yes | Implemented with adaptation | Internal hrefs and image srcs checked in this workspace; production crawl still required | Scripted check |
| R04 | Complete privacy placeholders: legal entity and jurisdiction | Critical | Content | A | Yes | Deferred | Entity/jurisdiction unknown; placeholders removed; operational policy + counsel note | `/privacy/` |
| R05 | Complete privacy placeholders: retention period | Critical | Content | A | Yes | Implemented with adaptation | Operational retention described; jurisdiction schedule still needs counsel | `/privacy/` |
| R06 | Legal review before production domain switch | Critical | Asset/content dependency | A | No | Deferred | Requires counsel | Documented |
| R07 | Build a credible proof layer (named proof, outcomes, testimonials, credentials, private-work path) | Critical | Conversion | New | Yes | Implemented with adaptation | Architecture shipped; no invented clients/quotes/metrics. Studio case + private conversation + pending-permission slots | Homepage evidence, `/work/` |
| R08 | Stop using “Selected collaborations” until collaborations are shown | Critical | Content | A | Yes | Implemented | Operating-model band replaces the label | Homepage |
| R09 | Ship hybrid hero: B scale + A audience/outcome + dual CTAs | High | UI | New | Yes | Implemented | Audit support line used verbatim | `index.html` hero |
| R10 | Eyebrow: Empyré Studio / Brand strategy, identity & digital systems | High | Content | New | Yes | Implemented | | Hero |
| R11 | H1: The standard, made visible. | High | Content | Both | Yes | Implemented | | Hero |
| R12 | Support copy per audit hybrid sentence | High | Content | New | Yes | Implemented | | Hero |
| R13 | Actions: Start a project / Explore selected work | High | Conversion | New | Yes | Implemented | Primary label unified to “Start a project” | Hero, header |
| R14 | Reframe price: “engagements begin at” on detail/inquiry, not homepage lead | High | Conversion | A | Yes | Implemented | Homepage has no price table; service pages + form use orientation language | Services, contact |
| R15 | Remove stale/manual Q3 scarcity counts | High | Content | A | Yes | Implemented | Availability = confirmed during inquiry | Services |
| R16 | Expand case studies: diagnosis, constraints, decisions, applications, implementation, outcome | High | Content | New | Yes | Implemented with adaptation | Studio project expanded; no fabricated results | `/work/empyre-studio/` |
| R17 | Two-step inquiry: contact + change first, then service/stage/timing/investment | High | Conversion | New | Yes | Implemented | Progressive disclosure; “Not sure yet”; email fallback | `/contact/` |
| R18 | Raise muted-text contrast; reduce microtype dependence | High | Accessibility | B | Yes | Implemented | `--muted:#C9C5BE`, `--faint:#B4AFA6`; body ≥ 1.0625rem | `hybrid.css` |
| R19 | Overlays behind text on imagery | High | Accessibility | Both | Yes | Implemented | Hero and CTA gradients | CSS |
| R20 | Edit A’s homepage; one job per section; proof earlier | High | UX | New | Yes | Implemented | Audit sequence | Homepage |
| R21 | Expose B essentials (no nested closed accordions for offer comprehension) | High | UX | B | Yes | Implemented | Services, system, method visible | Homepage |
| R22 | Govern production migration: noindex previews | Medium | SEO | Both | Yes | Implemented | `noindex,nofollow` + robots Disallow | Head, robots.txt |
| R23 | Canonicals, sitemap, robots on production | Medium | SEO | A | Yes | Implemented with adaptation | Files exist; production Allow deferred | sitemap.xml |
| R24 | Map old B anchors / redirects | Medium | SEO | B | Yes | Deferred | Production DNS/redirect approval required | netlify.toml has 404 only |
| R25 | Measurement plan for CTA, form-start, form-submit | Medium | Conversion | New | No | Deferred | No analytics credentials; none installed | — |
| R26 | Keep dedicated routes: Work, Services, System, About, Notes | High | Navigation | A | Yes | Implemented | Contact removed from primary row | Header |
| R27 | Replace Contact in primary row with Start a project | High | Navigation | New | Yes | Implemented | | Header |
| R28 | B quieter navigation typography | High | UI | B | Yes | Implemented | | CSS |
| R29 | B full-screen mobile drawer + About + Start a project + close label | High | Mobile | B | Yes | Implemented | Keyboard, Escape, focus return | JS |
| R30 | Visual system: cloud world, dark palette, sans/serif contrast, coral, hairlines | High | Brand | B | Yes | Implemented | | CSS, assets |
| R31 | A readability rules, button states, content grid | High | UI | A | Yes | Implemented | | CSS |
| R32 | Trust modules: logos, testimonials, outcomes, anonymized snapshots, founder, confidentiality, transfer | High | Conversion | New | Yes | Implemented with adaptation | Honest slots; founder + confidentiality + transfer live; logos/testimonials pending permission | Evidence section |
| R33 | Portfolio: dedicated service pages + case routes; homepage editorial cards | High | Content | Hybrid | Yes | Implemented | | Services, work |
| R34 | Mobile: one CTA before scroll | High | Mobile | New | Yes | Implemented | Primary button in first viewport | Hero |
| R35 | Tap targets ≥ ~44px | High | Accessibility | New | Yes | Implemented | Buttons 52px; nav 44px | CSS |
| R36 | Shorter section gaps than B | High | Mobile | New | Yes | Implemented | `--space-section` clamp 5.5–10.5rem | CSS |
| R37 | Preserve reduced-motion | High | Accessibility | A | Yes | Implemented | | CSS |
| R38 | Remove A preloader as mandatory gate | High | Performance | A | Yes | Implemented | Site loads directly | — |
| R39 | Remove B nested accordions for essentials | High | UX | B | Yes | Implemented | | Homepage |
| R40 | Email never the only conversion path | High | Conversion | New | Yes | Implemented | Form + mailto | Contact |
| R41 | Service-specific inquiry links that preselect the form | High | Conversion | New | Yes | Implemented | `?service=` | JS + service pages |
| R42 | System narrative: six components; ownership value first | High | Brand | A | Yes | Implemented | | System, homepage |
| R43 | Method naming Understand–Transfer | High | Content | B | Yes | Implemented | Audit over Discovery–Elevation | Homepage |
| R44 | Two-layer copy system | Medium | Content | New | Yes | Implemented | Editorial H2 + plainspoken lede | Templates |
| R45 | Outcome-led service framing before deliverable lists | High | Content | New | Yes | Implemented | Homepage stakes; lists on inner pages | Services |
| R46 | Unique titles, meta descriptions, one H1 | High | SEO | A | Yes | Implemented | 17 HTML files checked: 1 H1 each | Head |
| R47 | Descriptive internal links | Medium | SEO | A | Yes | Implemented | | Templates |
| R48 | Image alt text for meaningful images; empty for decorative | High | Accessibility | A | Yes | Implemented | Hero media empty alt | Templates |
| R49 | Organization / ProfessionalService schema | Medium | SEO | A | Yes | Implemented | Homepage JSON-LD | index.html |
| R50 | Skip link, landmarks, focus | High | Accessibility | A | Yes | Implemented | | CSS/HTML |
| R51 | Form labels, errors, consent | High | Accessibility | A | Yes | Implemented | | Contact |
| R52 | Accessibility statement without false certification | Medium | Accessibility | A | Yes | Implemented | | `/accessibility/` |
| R53 | Thank-you receipt state | Medium | Conversion | A | Yes | Implemented | | `/contact/thank-you/` |
| R54 | Privacy + accessibility pages | Medium | Content | A | Yes | Implemented | | Routes |
| R55 | Notes architecture + existing article | Medium | SEO | A | Yes | Implemented | | `/notes/` |
| R56 | Founder / for-not-for | Medium | Brand | A | Yes | Implemented | | `/about/` |
| R57 | 48-hour response + no vendor pitches | Low | Content | A | Yes | Implemented | | Contact, footer |
| R58 | Scope boundaries on services | Medium | Content | A | Yes | Implemented | | Service pages |
| R59 | FAQs only with genuine value | Medium | Content | A | Yes | Implemented | Existing A FAQs retained | Service pages |
| R60 | No keyword stuffing / no ranking promises | Medium | SEO | New | Yes | Implemented | | Copy |
| R61 | CMS-ready fields for proof later | Low | Technical architecture | New | Yes | Implemented with adaptation | Evidence module structured for future entries; no CMS installed | Evidence |
| R62 | Keyboard/screen-reader/zoom/Safari testing | High | Accessibility | Both | Yes | Implemented with adaptation | Keyboard menu + focus CSS reviewed; full AT lab testing not performed — no certification claimed | Manual review |
| R63 | Do not launch A untouched; do not keep B as only journey | Critical | Brand | New | Yes | Implemented | Hybrid site | Entire IA |
| R64 | Noindex this preview; do not switch production domain | Medium | SEO | New | Yes | Implemented | | robots, meta |
| R65 | Netlify as preferred host without connecting live domain | Medium | Technical architecture | New | Yes | Implemented with adaptation | `netlify.toml` present; no account connection | netlify.toml |

## Counts

| Status | Count |
|---|---|
| Total | 65 |
| Implemented | 51 |
| Implemented with adaptation | 9 |
| Deferred | 5 |
| Needs clarification | 0 |
| Rejected | 0 |

Deferred: R02 verified social URL; R04 legal entity name; R06 counsel review before production; R24 production redirects; R25 analytics events.

## Validation performed

- Regenerated 17 HTML pages
- Internal links resolve (query strings on `/contact/` are valid)
- Image files referenced by pages exist after launch-toolkit width aliases
- No misspelled mailto
- No privacy `[INSERT]` placeholders
- Local static server started for visual review
- No lint/type/test toolchain in this static foundation (N/A)
- Production Netlify deploy: not created (no credentials; live site untouched)
