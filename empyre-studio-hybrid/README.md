# Empyré Studio hybrid website

Audit-driven hybrid implementation of the Empyré Studio website.

This repository is a **local review workspace**. It does not change [empyrestudio.com](https://empyrestudio.com/) or either existing source repository.

## Purpose

Combine:

- **Website A** (preview / multi-page): `https://deploy-preview-3--empyrestudio.netlify.app/`
- **Website B** (live one-page): `https://empyrestudio.com/`

…into one production-shaped site directed by the approved comparison audit (`website-comparison-audit.html`, 20 August 2026).

**Direction:** Website A’s multi-page architecture, qualification flow, and systems narrative, art-directed with Website B’s cinematic scale, editorial compression, and quieter navigation.

## Technical foundation

A **clean static HTML/CSS/JS foundation** modeled on Website A’s information architecture.

Website A and Website B GitHub repositories were not provided. Public live/preview sites were inspected in read-only mode. Public brand images, wordmark, and fonts already published on those sites were reused. Neither original repository was cloned, modified, or overwritten.

- Language: HTML, CSS, JavaScript
- Package manager: none
- Build: none (static)
- Forms: Netlify Forms (`project-inquiry`) when hosted on Netlify; otherwise the form posts to `/contact/thank-you/` for local review
- Preview indexing: `noindex, nofollow` and `robots.txt` Disallow until production approval

## Local setup

```bash
cd empyre-studio-hybrid
python3 -m http.server 4173 --bind 0.0.0.0
```

Open the local preview URL. There is no install, lint, or test toolchain in this foundation.

Regenerate pages after editing `scripts/generate_site.py`:

```bash
python3 scripts/generate_site.py
```

## Deployment note

Preferred host: **Netlify**. Do not connect the production domain, change DNS, or replace the live site from this workspace. This preview is for visual and content review only.

When launching to production (after approval):

1. Replace `noindex, nofollow` with index/follow.
2. Allow crawlers in `robots.txt`.
3. Confirm Netlify Forms, legal entity on `/privacy/`, and measurement events.
4. Map any Website B hash URLs that should redirect.

## Documents

- `AUDIT_IMPLEMENTATION.md` — recommendation register and status
- `docs/HYBRID_DESIGN_SPEC.md` — experience, homepage sequence, design system, source map
