#!/usr/bin/env python3
"""Generate the Empyré Studio hybrid static site."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://empyrestudio.com"
EMAIL = "hello@empyrestudio.info"

NAV = [
    ("Work", "/work/"),
    ("Services", "/services/"),
    ("System", "/system/"),
    ("About", "/about/"),
    ("Notes", "/notes/"),
]


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def picture(src_base: str, alt: str, sizes: str, widths: list[int], lazy: bool = True, cls: str = "") -> str:
    srcset = ", ".join(f"{src_base}-{w}.jpg {w}w" for w in widths)
    fallback = f"{src_base}-{widths[min(1, len(widths)-1)]}.jpg"
    loading = 'loading="lazy" decoding="async"' if lazy else 'fetchpriority="high" decoding="async"'
    class_attr = f' class="{cls}"' if cls else ""
    return f"""<picture{class_attr}>
  <img src="{fallback}" srcset="{srcset}" sizes="{sizes}" alt="{esc(alt)}" {loading} width="{widths[-1]}" height="{int(widths[-1]*0.62)}">
</picture>"""


def head(title: str, description: str, path: str, og_image: str, extra: str = "") -> str:
    url = ORIGIN + path
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <meta name="theme-color" content="#0B0F13">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Empyré Studio">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{ORIGIN}{og_image}">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(description)}">
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-tight-latin-wght-normal.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/instrument-serif-latin-400-italic.woff2" crossorigin>
  <link rel="preload" as="image" href="/assets/img/loader/empyre-loader.gif">
  <link rel="stylesheet" href="/assets/css/hybrid.css?v=loadergif10">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/logo/mark-180.png">
  <link rel="manifest" href="/site.webmanifest">
  <script>
    (function () {{
      try {{
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        try {{
          var pref = localStorage.getItem("empyre-motion-preference");
          if (pref === "reduce" || pref === "reduced") reduce = true;
        }} catch (e) {{}}
        if (reduce) document.documentElement.setAttribute("data-motion", "reduced");
        var home = location.pathname === "/" || location.pathname === "/index.html";
        if (!reduce && home) document.documentElement.classList.add("empyre-loading");
      }} catch (e) {{}}
    }})();
  </script>
  {extra}
</head>"""


def header(current: str) -> str:
    links = []
    mobile = []
    for i, (label, href) in enumerate(NAV, 1):
        cur = ' aria-current="page"' if current == href else ""
        links.append(f'<a href="{href}"{cur}>{label}</a>')
        mobile.append(f'<a href="{href}"{cur}><span>0{i}</span>{label}</a>')
    return f"""<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header" data-header>
  <div class="header-inner shell">
    <a class="wordmark" href="/" aria-label="Empyré Studio home">
      <img src="/assets/img/logo/wordmark-140.png" srcset="/assets/img/logo/wordmark-140.png 1x, /assets/img/logo/wordmark-280.png 2x" width="140" height="38" alt="Empyré Studio">
    </a>
    <nav class="nav-primary" aria-label="Primary">
      {''.join(links)}
    </nav>
    <a class="header-cta" href="/contact/">Start a project</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu" data-menu-open>
      <span></span><span></span><span class="sr-only">Menu</span>
    </button>
  </div>
  <div class="mobile-menu surface-panel has-glare" id="mobile-menu" hidden data-mobile-menu>
    <div class="mobile-menu__top shell">
      <span class="micro">Navigation</span>
      <button class="menu-close" type="button" aria-label="Close menu" data-menu-close>
        <span>Close</span><i></i>
      </button>
    </div>
    <nav class="mobile-menu__nav shell" aria-label="Mobile">
      {''.join(mobile)}
      <a class="mobile-menu__cta" href="/contact/">Start a project <span aria-hidden="true">↗</span></a>
    </nav>
    <p class="mobile-menu__note shell">The standard, <em>made visible.</em></p>
  </div>
</header>"""


def footer(include_soar: bool = True) -> str:
    soar = ""
    if include_soar:
        soar = """<button type="button" class="soar" data-soar hidden aria-label="Soar to the top of the page">
  <span>Soar</span>
  <svg aria-hidden="true" viewBox="0 0 24 30"><path d="M12 28V3M4 11l8-8 8 8"/></svg>
</button>"""
    return f"""<footer class="site-footer">
  <div class="shell footer-grid">
    <div class="footer-brand">
      <a href="/" aria-label="Empyré Studio home">
        <img src="/assets/img/logo/lockup-100.png" srcset="/assets/img/logo/lockup-100.png 1x, /assets/img/logo/lockup-200.png 2x" width="100" height="78" alt="Empyré Studio" loading="lazy">
      </a>
      <p>The standard, made visible. Brand strategy, identity, verbal systems, and launch direction—built as one coherent operating system.</p>
    </div>
    <nav class="footer-nav" aria-label="Footer">
      <p class="micro">Explore</p>
      <a href="/work/">Work</a>
      <a href="/services/">Services</a>
      <a href="/system/">System</a>
      <a href="/notes/">Notes</a>
      <a href="/about/">About</a>
      <a href="/contact/">Start a project</a>
    </nav>
    <div class="footer-contact">
      <p class="micro">Begin</p>
      <a class="footer-email" href="mailto:{EMAIL}">{EMAIL}</a>
      <p class="muted">Every inquiry is reviewed personally within 48 hours, Monday through Friday.</p>
      <a class="text-link" href="/contact/">Start a project <span aria-hidden="true">↗</span></a>
    </div>
    <div class="footer-legal">
      <span>© 2026 Empyré Studio</span>
      <div><a href="/privacy/">Privacy</a><a href="/accessibility/">Accessibility</a></div>
      <span class="footer-signature">You own the system outright.</span>
    </div>
  </div>
</footer>
{soar}
<div class="sr-only" aria-live="polite" aria-atomic="true" data-soar-status></div>
<script src="/assets/js/hybrid.js?v=loadergif10" defer></script>
</body>
</html>"""


def page(path: str, title: str, description: str, current: str, main: str, og: str = "/assets/img/r/hero_atmosphere-1600.jpg", extra_head: str = "", h1_id: str = "hero", include_soar: bool = True, body_class: str = "surface-ground is-interior", main_class: str = "", body_prefix: str = "") -> None:
    dest = ROOT / path.lstrip("/")
    if path.endswith("/"):
        dest = dest / "index.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    if 'id="hero-title"' in main:
        main = main.replace('<h1 id="hero-title">', '<h1 id="hero-title" tabindex="-1">', 1)
    else:
        main = main.replace("<h1>", '<h1 id="hero-title" tabindex="-1">', 1)
    main_attr = f' class="{main_class}"' if main_class else ""
    html = f"""{head(title, description, path, og, extra_head)}
<body id="top" class="{body_class}">
{body_prefix}{header(current)}
<main id="main"{main_attr}>
{main}
</main>
{footer(include_soar)}"""
    dest.write_text(html, encoding="utf-8")
    print("wrote", dest.relative_to(ROOT))


ORG_JSON = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://empyrestudio.com/#organization",
      "name": "Empyré Studio",
      "url": "https://empyrestudio.com",
      "email": "hello@empyrestudio.info",
      "description": "Empyré Studio builds strategic brand systems and digital experiences that combine strategy, elegant craft, and measurable results.",
      "logo": "https://empyrestudio.com/assets/img/logo/lockup-1024.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://empyrestudio.com/#website",
      "url": "https://empyrestudio.com",
      "name": "Empyré Studio",
      "publisher": { "@id": "https://empyrestudio.com/#organization" }
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://empyrestudio.com/#professional-service",
      "name": "Empyré Studio",
      "url": "https://empyrestudio.com",
      "email": "hello@empyrestudio.info",
      "description": "Empyré Studio builds strategic, verbal, visual, and digital systems for ambitious brands.",
      "serviceType": ["Brand strategy", "Brand identity", "Verbal identity", "Launch direction", "Brand stewardship"],
      "parentOrganization": { "@id": "https://empyrestudio.com/#organization" }
    }
  ]
}
</script>"""

SERVICES = [
    {
        "n": "01",
        "slug": "brand-clarity-sprint",
        "name": "Brand Clarity Sprint",
        "cat": "Intensive · 5 days",
        "promise": "The fastest path from confusion to conviction.",
        "fit": "Founders who need the foundation before anything else. Businesses in transition that cannot yet articulate what they have become.",
        "outcome": "A Brand Clarity Map—the strategic argument everything else depends on.",
        "stakes": "Before you spend on design or a website, settle positioning, audience, voice, and competitive edge.",
        "timeline": "5 days",
        "invest": "Starting at $1,500",
        "img": "01_brand_clarity_sprint",
        "alt": "An open Brand Clarity Map with positioning, audience, voice, and clarity notes suspended in a vaulted chamber above the clouds.",
    },
    {
        "n": "02",
        "slug": "identity-transformation",
        "name": "Identity Transformation",
        "cat": "Comprehensive identity",
        "promise": "The brand, fully realized.",
        "fit": "Businesses whose brand no longer reflects who they are. New ventures that refuse to arrive unfinished.",
        "outcome": "A complete identity system—strategy, image, language, guidelines, and production-ready assets.",
        "stakes": "When the visual no longer matches the business, a cosmetic refresh will not hold. The system has to change.",
        "timeline": "5–6 weeks",
        "invest": "Starting at $4,500",
        "img": "02_identity_transformation",
        "alt": "The Empyré mark in dimensional form beside glass identity panels and material swatches above a cloud sea.",
    },
    {
        "n": "03",
        "slug": "signature-launch-suite",
        "name": "Signature Launch Suite",
        "cat": "Identity + launch",
        "promise": "From brand to market in one movement.",
        "fit": "Brands preparing for launch, rebrand reveal, or a significant market entry.",
        "outcome": "Identity Transformation carried through launch strategy, messaging, website direction, and launch assets.",
        "stakes": "The introduction deserves the same standard as the identity. Arrival is part of the work.",
        "timeline": "8–10 weeks",
        "invest": "Starting at $8,000",
        "img": "03_signature_launch_suite",
        "alt": "The Empyré mark on a glass plinth with launch messaging, website compositions, and campaign panels receding into open sky.",
    },
    {
        "n": "04",
        "slug": "brand-stewardship",
        "name": "Brand Stewardship",
        "cat": "Ongoing retainer",
        "promise": "The brand, sustained.",
        "fit": "Growing companies that need a dedicated brand partner rather than a rotating cast of vendors.",
        "outcome": "Month-over-month creative direction, consistency, content strategy, and brand evolution.",
        "stakes": "A system only remains a system if someone governs it as the company grows.",
        "timeline": "Monthly · 3-month minimum",
        "invest": "Starting at $1,200/month",
        "img": "04_brand_stewardship",
        "alt": "A full brand archive wall of stationery, swatches, and printed systems standing in a concrete room open to the clouds.",
    },
]


def cta(title: str, lede: str, primary_label="Start a project", primary_href="/contact/", secondary=None) -> str:
    sec = ""
    if secondary:
        sec = f'<a class="button button--secondary" href="{secondary[1]}">{secondary[0]}</a>'
    return f"""<section class="cta-block has-glare" aria-labelledby="cta-title">
  {picture("/assets/img/r/cta_summit", "A high cloud horizon used as the invitation to begin a project.", "100vw", [640, 960, 1280, 1600])}
  <div class="shell">
    <p class="eyebrow">Invitation</p>
    <h2 id="cta-title">{title}</h2>
    <p class="lede" style="margin-top:1.2rem">{lede}</p>
    <div class="button-row" style="margin-top:1.6rem">
      <a class="button button--primary" href="{primary_href}">{primary_label}</a>
      {sec}
    </div>
  </div>
</section>"""



def interior_hero(eyebrow: str, title: str, lede: str, aside: str = "", extra: str = "") -> str:
    aside_html = f'<aside class="interior-hero__aside">{aside}</aside>' if aside else ""
    extra_html = extra or ""
    return f"""<header class="interior-hero" id="hero">
  <div class="interior-hero__grid">
    <div class="interior-hero__copy">
      <p class="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p class="lede">{lede}</p>
      {extra_html}
    </div>
    {aside_html}
  </div>
</header>"""


def founder_frame() -> str:
    return """<figure class="founder-frame">
      <div class="founder-frame__glass">
        <div class="founder-frame__photo-wrap">
          <img class="founder-frame__photo" src="/assets/img/founder-samiaya.jpg" width="578" height="578" alt="SaMiaya, founder and creative director of Empyré Studio" decoding="async">
        </div>
        <figcaption class="founder-frame__nameplate">
          <span class="founder-frame__name">SaMiaya</span>
          <span class="founder-frame__role">Founder &amp; Creative Director</span>
        </figcaption>
      </div>
    </figure>"""


def home():
    extra = ORG_JSON + """
<style>
.home-hero{position:relative;display:grid;align-items:end;min-height:clamp(700px,92svh,980px);overflow:hidden;isolation:isolate;background-color:#070b10;background-image:url("/assets/img/r/empyre-hero-1600.jpg");background-size:cover;background-position:70% 48%;background-repeat:no-repeat}
.home-hero__media,.home-hero__image,.home-hero__image img,.home-hero__overlay{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;display:block!important;pointer-events:none;border:0}
.home-hero__image img{object-fit:cover!important;object-position:70% 48%;margin:0}
.home-hero__inner{position:relative;z-index:2}
@media (max-width:767px){.home-hero{min-height:max(760px,100svh);background-position:85% 42%}.home-hero__image img{object-position:85% 42%}}
html[data-motion="reduced"] .cinematic-overlay--film{display:none!important}
</style>
"""
    loader = """<div class="cinematic-overlay cinematic-overlay--film" data-cinematic-overlay data-mode="load" aria-hidden="true">
  <img class="loader-film" src="/assets/img/loader/empyre-loader.gif" width="426" height="240" alt="" decoding="async" fetchpriority="high">
</div>
"""
    main = f"""<section class="home-hero" id="hero" aria-labelledby="hero-title">
  <div class="home-hero__media" aria-hidden="true">
    <picture class="home-hero__image">
      <img src="/assets/img/r/empyre-hero-1600.jpg" srcset="/assets/img/r/empyre-hero-640.jpg 640w, /assets/img/r/empyre-hero-960.jpg 960w, /assets/img/r/empyre-hero-1280.jpg 1280w, /assets/img/r/empyre-hero-1600.jpg 1600w, /assets/img/r/empyre-hero-2200.jpg 2200w" sizes="100vw" alt="" fetchpriority="high" decoding="async">
    </picture>
    <div class="home-hero__overlay home-hero__overlay--base"></div>
    <div class="home-hero__overlay home-hero__overlay--copy"></div>
    <div class="home-hero__overlay home-hero__overlay--bottom"></div>
  </div>
  <div class="home-hero__inner shell">
    <div class="home-hero__content">
      <p class="eyebrow">Empyré Studio</p>
      <p class="home-hero__kicker">Brand strategy, identity &amp; digital systems</p>
      <h1 id="hero-title">The standard, <em>made visible.</em></h1>
      <p class="lede">We build strategic, verbal, visual, and digital systems for ambitious brands entering their next level—so they can be recognized, trusted, and scaled without losing coherence.</p>
      <div class="home-hero__actions">
        <a class="button button--primary" href="/contact/">Start a project</a>
        <a class="button button--secondary" href="/work/">Explore selected work</a>
      </div>
      <a class="home-hero__entry" href="#operating"><i></i>Enter the system</a>
    </div>
  </div>
</section>

<section class="home-section home-section--name" id="the-name" aria-labelledby="name-title">
  <div class="shell name-grid">
    <div>
      <p class="eyebrow">The name · Em-Py-Rei</p>
      <h2 id="name-title">From the highest heaven.</h2>
      <p class="body">Empyré is drawn from empyrean: the highest realm of pure fire and light in ancient cosmology.</p>
      <p class="body">We chose the name because every brand has a highest form—clear in its purpose, precise in its identity, and impossible to ignore. Our work is simply the ascent.</p>
    </div>
    <aside class="name-aside">
      <p class="name-quote">“We say it Em-Py-Rei—a name that rises as it is spoken.”</p>
      <p class="name-say">Em · Py · Rei</p>
      <p class="muted">The emphasis sits at the centre: em-PY-rei.</p>
    </aside>
  </div>
</section>

<section class="home-section home-section--ops" id="operating" aria-labelledby="operating-title">
  <div class="shell">
    <div class="home-ops__intro">
      <p class="eyebrow">Operating model</p>
      <h2 id="operating-title">How Empyré works</h2>
      <p class="lede">Founder-led strategic and creative direction from first question through equipped handover.</p>
    </div>
    <div class="home-ops">
      <article>
        <p class="micro">Built for</p>
        <h3>Serious founders and growing teams</h3>
        <p>Businesses in transition, new ventures, and established brands ready to evolve.</p>
      </article>
      <article>
        <p class="micro">Strategy first</p>
        <h3>The argument before the artefact</h3>
        <p>Every engagement begins with a clear, defensible position the work can hold.</p>
      </article>
      <article>
        <p class="micro">Working model</p>
        <h3>One standard of finish</h3>
        <p>What we show publicly is the floor, not the ceiling. Client identities remain private until they choose otherwise.</p>
      </article>
      <article>
        <p class="micro">Response</p>
        <h3>48 hours, personally</h3>
        <p>Every inquiry is reviewed by the studio. Unsolicited vendor pitches are not answered.</p>
      </article>
    </div>
  </div>
</section>

<section class="home-section home-section--pov" id="pov" aria-labelledby="pov-title">
  <div class="shell split">
    <p class="eyebrow">Point of view</p>
    <div>
      <h2 id="pov-title">A brand is <em>not</em> a logo.</h2>
      <p class="lede">It is the environment in which a company is understood—its position, language, structure, behavior, and standard.</p>
      <p class="body">Strategy before surface. Systems before artefacts. Most studios deliver files. Empyré delivers the system those files come from: a strategic argument, an architecture that holds it, and a handover that lets your team run it without us in the room.</p>
      <a class="text-link" href="/system/">Explore the Empyré system <span>↗</span></a>
    </div>
  </div>
</section>

<section class="home-section home-section--studio" id="studio" aria-labelledby="founder-title">
  <div class="shell split">
    <p class="eyebrow">Studio</p>
    <div>
      <h2 id="founder-title">The work was real <em>before the studio had a name.</em></h2>
      <p class="lede">SaMiaya B., Founder and Creative Director. Brands, elevated.</p>
      <p class="body">Founders turned to SaMiaya B. when they could not articulate what their business was, what it stood for, or why anyone should choose it. Empyré exists to give that work the structure, the standard, and the name it deserved.</p>
      <p class="body">Done right, a brand should feel inevitable.</p>
      <a class="text-link" href="/about/">Meet SaMiaya and the studio <span>↗</span></a>
    </div>
  </div>
</section>

<section class="home-section home-section--invitation" id="invitation" aria-labelledby="cta-title">
  <div class="shell">
    <div class="invitation-shell">
    <div class="home-invite__panel glass-real">
      <p class="eyebrow">Invitation</p>
      <h2 id="cta-title">If you’re ready to build <em>something with substance,</em> step inside.</h2>
      <p class="lede">Tell us where the brand is now, where it needs to stand, and what is changing. Every inquiry is reviewed personally.</p>
      <div class="home-hero__actions">
        <a class="button button--primary" href="/contact/">Start a project</a>
        <a class="button button--secondary" href="mailto:{EMAIL}">Write to the studio</a>
      </div>
    </div>
    </div>
  </div>
</section>
"""
    page(
        "/",
        "Empyré Studio — The standard, made visible.",
        "Empyré Studio builds strategic, verbal, visual, and digital systems for ambitious brands entering their next level—so they can be recognized, trusted, and scaled without losing coherence.",
        "/",
        main,
        extra_head=extra,
        og="/assets/img/r/empyre-hero-1600.jpg",
        body_class="surface-ground is-home",
        main_class="home-page",
        body_prefix=loader,
    )



def services_index():
    cards = []
    for s in SERVICES:
        cards.append(f"""<article class="service-card">
  <div class="service-card__media">{picture(f"/assets/img/r/{s['img']}", s['alt'], "(min-width:1080px) 42vw, 100vw", [640, 900, 1200])}</div>
  <div class="service-card__head"><span class="service-card__number">{s['n']}</span><span class="micro">{s['cat']}</span></div>
  <h3><a href="/services/{s['slug']}/">{s['name']}</a></h3>
  <p class="promise">{s['promise']}</p>
  <p class="fit"><strong style="color:var(--bone);font-weight:520">Best for.</strong> {s['fit']}</p>
  <p class="fit">{s['outcome']}</p>
  <p class="meta"><span>{s['timeline']}</span><span>{s['invest']}</span></p>
</article>""")
    rows = "".join(
        f"<tr><td><a href='/services/{s['slug']}/'>{s['name']}</a></td><td>{s['timeline']}</td><td>{s['invest']}</td><td>Confirmed during inquiry</td></tr>"
        for s in SERVICES
    )
    service_links = "".join(f'<li><a href="/services/{s["slug"]}/">{s["name"]}</a></li>' for s in SERVICES)
    main = f"""{interior_hero(
        "Services",
        "One standard. <em>Different starting points.</em>",
        "Clarity before execution. Identity before launch. Stewardship after transfer. Engagements are scoped to the decision in front of you.",
        aside=f'<p class="micro">Engagements</p><ul class="interior-hero__list">{service_links}</ul>',
    )}
<section class="section hairline">
  <div class="shell">
    <div class="service-grid">{''.join(cards)}</div>
  </div>
</section>
<section class="section hairline" aria-labelledby="glance-title">
  <div class="shell">
    <h2 id="glance-title">Engagements at a glance</h2>
    <p class="muted" style="max-width:58ch;margin:1rem 0 1.5rem">Starting prices are an entry point, not a complete quote. Final investment is confirmed after scope, timeline, and required deliverables are defined. Capacity is confirmed during inquiry.</p>
    <div class="table-wrap surface-panel">
      <table>
        <thead><tr><th>Engagement</th><th>Timeline</th><th>Investment</th><th>Availability</th></tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  </div>
</section>
<section class="section hairline">
  <div class="shell split">
    <p class="eyebrow">Boundaries</p>
    <div>
      <h2>Clear boundaries protect the work.</h2>
      <p class="body">Websites, expanded campaigns, photography, packaging, major presentations, and high-volume asset production are separately scoped unless the signed agreement explicitly includes them. Each engagement page identifies what is included, what is not, client responsibilities, revisions, meetings, and handoff.</p>
    </div>
  </div>
</section>
{cta("Not sure which tier fits?", "Tell us what is changing, what already exists, and what the business needs to be ready for next.", primary_label="Describe your project")}
"""
    page("/services/", "Services — Empyré Studio", "Four Empyré Studio engagements: Brand Clarity Sprint, Identity Transformation, Signature Launch Suite, and Brand Stewardship.", "/services/", main, og="/assets/img/r/02_identity_transformation-1200.jpg")


def service_page(s, extra_sections: str):
    main = f"""{interior_hero(
        f"Tier {s['n']} <span>/</span> {s['cat']}",
        s['name'],
        s['promise'],
        aside=f'<p class="micro">At a glance</p><ul class="interior-hero__list"><li>{s["timeline"]}</li><li>{s["invest"]}</li></ul>',
        extra=f"""<div class="button-row" style="margin-top:1.6rem">
    <a class="button button--primary" href="/contact/?service={s['slug']}">Inquire about {s['name']}</a>
    <a class="button button--secondary" href="/services/">Compare services</a>
  </div>""",
    )}
<section class="section hairline">
  <div class="shell">
    {picture(f"/assets/img/r/{s['img']}", s['alt'], "100vw", [640, 900, 1200])}
  </div>
</section>
<section class="section hairline">
  <div class="shell split">
    <p class="eyebrow">Fit / 01</p>
    <div>
      <h2>Who this is for</h2>
      <p class="lede">{s['fit']}</p>
      <p class="body">{s['stakes']}</p>
      <dl class="facts">
        <div><dt>Timeline</dt><dd>{s['timeline']}</dd></div>
        <div><dt>Investment</dt><dd>{s['invest']}. Final investment is confirmed after scope, timeline, and required deliverables are defined.</dd></div>
        <div><dt>Availability</dt><dd>Capacity is limited. Current timing is confirmed during inquiry.</dd></div>
        <div><dt>Core outcome</dt><dd>{s['outcome']}</dd></div>
      </dl>
    </div>
  </div>
</section>
{extra_sections}
<section class="section hairline">
  <div class="shell split">
    <p class="eyebrow">Related proof</p>
    <div>
      <p class="badge">Studio project</p>
      <h2>See the system in practice.</h2>
      <p class="body">Building the studio’s own operating system—an internal case study showing how strategy, language, visual structure, and digital behavior were designed as one system.</p>
      <a class="text-link" href="/work/empyre-studio/">View case study <span>↗</span></a>
    </div>
  </div>
</section>
{cta("Is this the right starting point?", "Share the current stage, the change in front of the business, and what needs to exist when the engagement is complete.", primary_label=f"Inquire about {s['name']}", primary_href=f"/contact/?service={s['slug']}", secondary=("Compare services", "/services/"))}
"""
    page(
        f"/services/{s['slug']}/",
        f"{s['name']} — Empyré Studio",
        f"{s['name']}: {s['promise']} {s['outcome']}",
        "/services/",
        main,
        og=f"/assets/img/r/{s['img']}-1200.jpg",
    )


def faq(items):
    bits = []
    for q, a in items:
        bits.append(f"<details><summary>{q}</summary><p>{a}</p></details>")
    return f'<section class="section hairline"><div class="shell"><p class="eyebrow">Details</p><h2>Frequently asked.</h2><div class="faq" style="margin-top:1.5rem">{"".join(bits)}</div></div></section>'


def all_service_pages():
    sprint = SERVICES[0]
    service_page(sprint, f"""
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Scope / 02</p>
  <div>
    <h2>What the engagement delivers.</h2>
    <div class="two-col" style="margin-top:1.5rem">
      <article><h3>Discovery</h3><ul class="list-check"><li>Business and goal review</li><li>Audience context</li><li>Competitive landscape</li><li>Market constraints</li></ul></article>
      <article><h3>Excavation</h3><ul class="list-check"><li>Brand positioning statement</li><li>Audience clarity profile</li><li>3–5 defensible differentiators</li><li>Brand promise</li></ul></article>
      <article><h3>Direction</h3><ul class="list-check"><li>Voice and tone definition</li><li>Visual direction brief</li><li>Complete Brand Clarity Map</li><li>60-minute strategic debrief</li></ul></article>
    </div>
  </div>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Boundaries / 03</p>
  <div>
    <h2>What is not included.</h2>
    <ul class="list-check">
      <li>Visual identity or logo design</li>
      <li>Color or typography systems</li>
      <li>Brand guidelines or production assets</li>
      <li>Verbal playbook, website, or launch materials</li>
    </ul>
    <p class="body">Client responsibilities include completing the strategic questionnaire, providing relevant context, making one decision-maker available, and attending the debrief. No revision rounds; alignment happens in the 60-minute debrief. The Brand Clarity Map is delivered digitally.</p>
  </div>
</div></section>
{faq([
    ("Does the Sprint include a logo or visual identity?", "No. Tier 01 contains no logo, visual identity, color, typography, guidelines, production assets, verbal playbook, or launch materials."),
    ("Can the Sprint happen before a website project?", "Yes. It is designed to establish direction before money is committed to a website, identity, content system, or launch."),
    ("What happens after the Sprint?", "You can use the strategic direction with your internal team or another partner, or discuss whether an Empyré identity engagement is the right next step."),
])}
""")

    ident = SERVICES[1]
    service_page(ident, f"""
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Scope / 02</p>
  <div>
    <h2>What the engagement delivers.</h2>
    <p class="body">The complete brand build: a full identity system that is strategically grounded, visually precise, and verbally consistent. Nothing templated. Nothing rushed.</p>
    <div class="two-col" style="margin-top:1.5rem">
      <article><h3>Strategy</h3><ul class="list-check"><li>Complete brand positioning</li><li>Audience clarity</li><li>Competitive landscape</li><li>Brand truth</li></ul></article>
      <article><h3>Visual identity</h3><ul class="list-check"><li>Primary logo and variations</li><li>Color palette across required formats</li><li>Typography hierarchy</li><li>Graphic language and art direction</li></ul></article>
      <article><h3>Verbal identity</h3><ul class="list-check"><li>Brand voice guide</li><li>Tagline and messaging hierarchy</li><li>Brand vocabulary</li><li>Copy frameworks</li></ul></article>
      <article><h3>Empyré Signature</h3><ul class="list-check"><li>Brand Bible and Identity Guidelines</li><li>Verbal Playbook</li><li>Production-ready asset suite</li><li>Launch Toolkit and recorded Brand Briefing</li></ul></article>
    </div>
  </div>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Boundaries / 03</p>
  <div>
    <h2>What is not included.</h2>
    <ul class="list-check">
      <li>Website design or development</li>
      <li>Launch strategy or campaign sequencing</li>
      <li>Ongoing content creation or management</li>
      <li>Photography, packaging, campaigns, or major presentations unless separately scoped</li>
    </ul>
    <p class="body">Two structured revision rounds are included. The approved production files and documented system are transferred at handoff according to the rights and payment terms in the final agreement.</p>
  </div>
</div></section>
{faq([
    ("Does Identity Transformation include a website?", "No. Website design, development, launch strategy, content creation, and ongoing management are not included unless separately scoped."),
    ("How many revision rounds are included?", "Two structured rounds of revision are included across the visual and verbal identity phases."),
    ("Do we own the final files?", "The approved production files and documented system are transferred at handoff according to the rights and payment terms in the final agreement."),
])}
""")

    launch = SERVICES[2]
    service_page(launch, f"""
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Scope / 02</p>
  <div>
    <h2>What the engagement delivers.</h2>
    <p class="body">Everything in Identity Transformation, extended into the world. The brand is built together with the strategy, language, digital direction, and launch assets required to introduce it as a movement.</p>
    <div class="two-col" style="margin-top:1.5rem">
      <article><h3>Identity foundation</h3><ul class="list-check"><li>Everything in Identity Transformation</li><li>The complete Empyré Signature</li></ul></article>
      <article><h3>Launch strategy</h3><ul class="list-check"><li>Sequencing and channel rollout</li><li>Announcement copy and brand story</li><li>Elevator pitches and launch email copy</li></ul></article>
      <article><h3>Digital direction</h3><ul class="list-check"><li>Homepage and About copy</li><li>Website layout and UX direction</li><li>Social foundations and 30 days of captions</li></ul></article>
      <article><h3>Launch assets</h3><ul class="list-check"><li>Post, story, and announcement graphics</li><li>Presentation deck</li><li>Post-launch debrief</li></ul></article>
    </div>
  </div>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Boundaries / 03</p>
  <div>
    <h2>What is not included.</h2>
    <ul class="list-check">
      <li>Website development unless separately scoped</li>
      <li>Ongoing social publishing or community management</li>
      <li>Photography, packaging, paid media, or campaign production unless separately scoped</li>
    </ul>
    <p class="body">Two rounds for identity work plus one additional round for launch assets. Website UX direction and copy are included; development is not, unless the signed agreement says otherwise.</p>
  </div>
</div></section>
{faq([
    ("Is the website built as part of this engagement?", "Website UX direction and copy are included. Website development is separately scoped unless it is explicitly included in the signed agreement."),
    ("Does this include ongoing social content?", "No. The suite includes social foundations and a 30-day caption plan, not ongoing publishing or management."),
    ("Can photography or packaging be added?", "Yes, when appropriate, but photography, packaging, expanded campaigns, and high-volume asset production are separately scoped."),
])}
""")

    stew = SERVICES[3]
    service_page(stew, f"""
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Scope / 02</p>
  <div>
    <h2>What the engagement delivers.</h2>
    <p class="body">A brand is not built once. It is carried across every communication, campaign, hire, and customer interaction. Stewardship keeps the brand as intentional as the day it was built.</p>
    <div class="two-col" style="margin-top:1.5rem">
      <article><h3>Monthly direction</h3><ul class="list-check"><li>60-minute strategy session</li><li>Creative direction on new decisions</li><li>Content calendar framework</li><li>Priority access with 48-hour turnaround</li></ul></article>
      <article><h3>Governance</h3><ul class="list-check"><li>Brand consistency audit and report</li><li>Review of up to 10 content pieces</li><li>Review of third-party creative</li></ul></article>
      <article><h3>Production support</h3><ul class="list-check"><li>Up to 5 new branded asset files</li><li>Application guidance</li><li>Vendor coordination direction</li></ul></article>
      <article><h3>Quarterly review</h3><ul class="list-check"><li>90-minute brand health review</li><li>Written brand health report</li><li>System evolution priorities</li></ul></article>
    </div>
  </div>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Boundaries / 03</p>
  <div>
    <h2>What is not included.</h2>
    <ul class="list-check">
      <li>More than 10 content reviews or 5 new asset files in a month</li>
      <li>Campaigns, full website builds, photography, packaging, or major decks</li>
      <li>A full rebrand unless separately scoped</li>
    </ul>
    <p class="body">Fit depends on the quality of the existing brand system. Empyré reviews the current foundation before confirming a retainer.</p>
  </div>
</div></section>
{faq([
    ("How much content can be reviewed each month?", "Up to 10 pieces of content can be reviewed monthly within the stated retainer scope."),
    ("How many new assets are included?", "Up to 5 new branded asset files are included monthly. Campaigns, websites, packaging, major presentations, and high-volume production are separately scoped."),
    ("Can Stewardship start without an Empyré identity project?", "Fit depends on the quality and completeness of the existing brand system. Empyré reviews the current foundation before confirming a retainer."),
])}
""")


def work_index():
    main = f"""{interior_hero(
        "Work",
        "The floor, <em>not the ceiling.</em>",
        "What we show publicly is the level of finish and thinking every engagement is held to. Client identities remain private until they choose otherwise.",
        aside='<p class="micro">Label</p><p class="interior-hero__statement">Studio project. Client work remains private until approved.</p>',
    )}
<section class="section hairline">
  <div class="shell">
    <article class="case-feature">
      {picture("/assets/img/r/01_brand_bible", "The Empyré Brand Bible open above a cloud horizon.", "(min-width:1080px) 50vw, 100vw", [640, 900, 1200])}
      <div>
        <p class="case-kicker">Studio project</p>
        <h2>Building the studio’s own operating system</h2>
        <p class="muted" style="margin-top:1rem">Empyré Studio · Brand and digital systems. Positioning, visual identity, verbal direction, digital experience, and production system.</p>
        <a class="text-link" href="/work/empyre-studio/" style="margin-top:1.2rem">View case study <span>↗</span></a>
      </div>
    </article>
  </div>
</section>
<section class="section hairline">
  <div class="shell split">
    <p class="eyebrow">The standard</p>
    <div>
      <h2>How unpublished work is evaluated.</h2>
      <div class="two-col" style="margin-top:1.5rem">
        <article class="proof-card"><h3>01 Thinking</h3><p class="muted">Positioning, territory, argument.</p></article>
        <article class="proof-card"><h3>02 Finish</h3><p class="muted">Detail resolved at every scale.</p></article>
        <article class="proof-card"><h3>03 Execution</h3><p class="muted">Design and engineering in one hand.</p></article>
        <article class="proof-card"><h3>04 Transfer</h3><p class="muted">Owned by your team, not rented.</p></article>
      </div>
      <p class="body">Where publication is restricted, relevant experience and selected materials can be discussed during a qualified project conversation, subject to client confidentiality.</p>
      <a class="text-link" href="/contact/">Discuss relevant experience <span>↗</span></a>
    </div>
  </div>
</section>
{cta("Begin a similar project.", "Tell us the change in front of you and what should be possible when the engagement is complete.")}
"""
    page("/work/", "Work — Empyré Studio", "Selected Empyré Studio work, labeled accurately. Internal work is identified as a studio project; client work remains private until approved.", "/work/", main, og="/assets/img/r/01_brand_bible-1200.jpg")


def case_study():
    main = f"""{interior_hero(
        "Studio project <span>/</span> Empyré Studio",
        "Building the studio’s <em>own operating system.</em>",
        "The identity had to prove the position: strategy before surface, disciplined systems, and details that remain coherent across environments.",
        aside='<p class="micro">Label</p><ul class="interior-hero__list"><li>Internal work</li><li>Brand and digital systems</li><li>Not a client case study</li></ul>',
    )}
<section class="section hairline"><div class="shell">{picture("/assets/img/r/hero_atmosphere", "Atmospheric cloud horizon used as Empyré Studio’s visual world.", "100vw", [640, 960, 1280, 1600])}</div></section>
<section class="section hairline"><div class="shell">
  <dl class="facts">
    <div><dt>Client</dt><dd>Empyré Studio (internal)</dd></div>
    <div><dt>Industry</dt><dd>Brand and digital systems</dd></div>
    <div><dt>Scope</dt><dd>Positioning, visual identity, verbal direction, digital experience, and production system</dd></div>
    <div><dt>Label</dt><dd>Studio project — not a client case study</dd></div>
  </dl>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Diagnosis</p>
  <div>
    <h2>The identity had to prove the position.</h2>
    <p class="body">Empyré’s own brand needed to demonstrate the same standard it asks clients to adopt. The risk was atmospheric art direction that looked premium while hiding the offer. The constraint was to hold cinematic taste and commercial clarity in the same system.</p>
  </div>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Decisions</p>
  <div>
    <h2>One argument, expressed through every layer.</h2>
    <p class="body">Positioning, language, typography, color, image direction, interface behavior, and handoff logic were developed as connected parts rather than independent deliverables. Routes that treated the studio as a logo vendor, or as an unexplained art object, were rejected.</p>
    <ul class="list-check">
      <li>Lead with “The standard, made visible.” as a positioning line, not a decoration.</li>
      <li>Name four engagements so the offer can be understood without a sales call.</li>
      <li>Make the six-part Signature the proof of a usable system.</li>
      <li>Keep client work private until permission exists, and label internal work as a studio project.</li>
    </ul>
  </div>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Applications</p>
  <div>
    <h2>Verbal, visual, and digital as one.</h2>
    <p class="body">The cloud world, mineral palette, and typographic contrast establish atmosphere. Service architecture, inquiry qualification, and system documentation make the atmosphere usable. Implementation includes organised production files, page templates for work and notes, and a handover logic the studio can operate.</p>
  </div>
</div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Outcome</p>
  <div>
    <h2>A system built to hold its character.</h2>
    <p class="body">The resulting framework gives the studio a recognizable visual world and a practical structure for service communication, publishing, project qualification, and future growth. No third-party metrics are claimed. The result is a coherent identity and digital framework designed to make the studio’s strategic standard visible at every touchpoint.</p>
  </div>
</div></section>
{cta("Begin a similar project.", "Tell us the change in front of you and what should be possible when the engagement is complete.", secondary=("Compare services", "/services/"))}
"""
    page("/work/empyre-studio/", "Empyré Studio case study — Empyré Studio", "Internal case study: how Empyré Studio designed strategy, language, visual structure, and digital behavior as one operating system.", "/work/", main, og="/assets/img/r/01_brand_bible-1200.jpg")



def system_page():
    items = [
        ("01", "Brand Bible", "The Foundation", "The master strategic and creative reference. Positioning, audience, territory, promise, differentiation, and the reasoning behind the system.", "01_brand_bible"),
        ("02", "Identity Guidelines", "The Architecture", "The complete visual identity rulebook. Logo use, typography, color, composition, imagery, graphic behavior, and application principles.", "02_identity_guidelines"),
        ("03", "Verbal Playbook", "The Voice", "Voice, tone, messaging hierarchy, narrative, writing principles, and the language the brand should avoid.", "03_verbal_playbook"),
        ("04", "Asset Suite", "The Ecosystem", "Production-ready files organised for real work. Approved formats, naming logic, source files, exports, and the assets required by the agreed scope.", "04_asset_suite"),
        ("05", "Launch Toolkit", "The Ascent", "Included only where scope requires it: launch templates, messaging, channel direction, and deployment materials.", "05_launch_toolkit"),
        ("06", "Brand Briefing", "The Handover", "A structured walkthrough that equips internal teams and external partners to use the system after handoff.", "06_brand_briefing"),
    ]
    cards = []
    for n, name, role, copy, img in items:
        cards.append(f"""<article class="system-card">
  {picture(f"/assets/img/r/{img}", name, "(min-width:1080px) 30vw, 100vw", [640, 900, 1200])}
  <p class="num">{n} · {role}</p>
  <h3>{name}</h3>
  <p>{copy}</p>
</article>""")
    main = f"""{interior_hero(
        "System",
        "Every component <em>has a job.</em>",
        "The system is assembled according to engagement scope. Tier 01 is strategic only; full identity and launch components apply where the selected tier explicitly includes them.",
        aside='<p class="micro">Signature</p><ul class="interior-hero__list"><li>Brand Bible</li><li>Identity Guidelines</li><li>Verbal Playbook</li><li>Asset Suite</li><li>Launch Toolkit</li><li>Brand Briefing</li></ul>',
    )}
<section class="section hairline"><div class="shell"><div class="system-grid">{''.join(cards)}</div></div></section>
<section class="section hairline"><div class="shell split">
  <p class="eyebrow">Governance</p>
  <div>
    <h2>A system is finished when another person can use it well.</h2>
    <p class="body">Documentation, production organisation, and transfer are part of the design. They protect the original decisions when the work moves into internal teams, developers, writers, vendors, and future campaigns. Clients own the system outright.</p>
    <a class="text-link" href="/services/brand-stewardship/">Explore ongoing stewardship <span>↗</span></a>
  </div>
</div></section>
{cta("Build a system the business can operate.", "Choose the scope that matches the current stage—or describe the change and let us help identify the right starting point.", secondary=("Explore services", "/services/"))}
"""
    page("/system/", "The Empyré Signature — Empyré Studio", "Six components of the Empyré Signature: Brand Bible, Identity Guidelines, Verbal Playbook, Asset Suite, Launch Toolkit, and Brand Briefing.", "/system/", main, og="/assets/img/r/01_brand_bible-1200.jpg")


def about_page():
    main = f"""<header class="about-hero" id="hero">
  <div class="about-shell about-hero__grid">
    <div>
      <p class="eyebrow">About Empyré</p>
      <h1>The world an identity <em>can exist in.</em></h1>
      <p class="lede">Empyré Studio is a design and brand strategy studio building brand systems and digital experiences that combine strategy, elegant craft, and measurable results.</p>
    </div>
    <aside class="about-hero__meta">
      <p class="about-hero__statement">The standard, made visible.</p>
      <ul class="about-hero__list">
        <li>Brand strategy</li>
        <li>Identity systems</li>
        <li>Digital systems</li>
      </ul>
    </aside>
  </div>
</header>

<section class="about-section" aria-labelledby="name-title">
  <div class="about-shell about-grid">
    <div>
      <p class="eyebrow">The name · Em-Py-Rei</p>
      <h2 id="name-title">From the highest heaven.</h2>
      <p class="body">Empyré is drawn from empyrean: the highest realm of pure fire and light in ancient cosmology.</p>
      <p class="body">We chose the name because every brand has a highest form—clear in its purpose, precise in its identity, and impossible to ignore. Our work is simply the ascent.</p>
    </div>
    <aside class="about-name__aside">
      <p class="name-quote">“We say it Em-Py-Rei—a name that rises as it is spoken.”</p>
      <p class="name-say">Em · Py · Rei</p>
      <p class="muted">The emphasis sits at the centre: em-PY-rei.</p>
    </aside>
  </div>
</section>

<section class="about-section" aria-labelledby="mark-title">
  <div class="about-shell about-grid about-grid--mark">
    <div class="about-mark__visual">
      <img class="about-mark__emblem" src="/assets/img/logo/mark-180.png" width="180" height="180" alt="" aria-hidden="true">
    </div>
    <div>
      <p class="eyebrow">The mark</p>
      <h2 id="mark-title">A mirrored duality forming <em>a rising path.</em></h2>
      <p class="body">The Empyré emblem joins two mirrored E forms through a central S-curve: Empyré, Elevation, Studio.</p>
      <p class="body">The mirrored forms hold the tension between what a brand is and what it can become. The curve between them is the work itself—clarity becoming direction, direction becoming form.</p>
      <p class="mark-close">Identity is not created. It is elevated.</p>
      <p class="muted about-mark__micro">A mirrored duality forming a rising path—the symbol of identity elevated to its highest form.</p>
    </div>
  </div>
</section>

<section class="about-section" aria-labelledby="founder-title">
  <div class="about-shell about-founder__grid">
    <figure class="founder-frame">
      <div class="founder-frame__glass">
        <div class="founder-frame__photo-wrap">
          <img class="founder-frame__photo" src="/assets/img/founder-samiaya.jpg" width="578" height="578" alt="SaMiaya, founder and creative director of Empyré Studio" decoding="async">
        </div>
        <figcaption class="founder-frame__nameplate">
          <span class="founder-frame__name">SaMiaya</span>
          <span class="founder-frame__role">Founder &amp; Creative Director</span>
        </figcaption>
      </div>
    </figure>
    <div class="founder-copy">
      <p class="eyebrow">The founder</p>
      <h2 id="founder-title">The bridge between what is and <em>what is becoming.</em></h2>
      <p class="body">Empyré is built around the space between a brand’s present reality and its highest potential.</p>
      <p class="body">As founder, SaMiaya works in that space: bringing strategy and aesthetics, technical problem-solving and creative direction into one deliberate system. The work is not to invent noise, but to uncover what is already true and give it a form that can hold.</p>
      <p class="mark-close">Identity rises when clarity is applied.</p>
    </div>
  </div>
</section>

<section class="about-section about-section--close" aria-labelledby="principles-title">
  <div class="about-shell about-grid about-grid--close">
    <div>
      <p class="eyebrow">Studio</p>
      <h2 id="principles-title">Studio principles</h2>
      <ul class="about-principles">
        <li>Strategy before surface.</li>
        <li>Systems before artefacts.</li>
        <li>Identity, elevated.</li>
      </ul>
    </div>
    <aside class="about-closing__panel">
      <p class="about-closing__lead">Ready to build a brand with substance?</p>
      <a class="button button--primary" href="/contact/">Start a project</a>
    </aside>
  </div>
</section>
"""
    page("/about/", "About — Empyré Studio", "Empyré Studio, founded by SaMiaya. The standard, made visible.", "/about/", main, body_class="surface-ground is-about")



def about_the_name():
    main = f"""{interior_hero(
        "Archive",
        "The name and the mark.",
        "Extended studio notes on Empyré’s naming and emblem. This page is not linked from primary navigation.",
        aside='<p class="micro">Spoken form</p><p class="interior-hero__statement">Em · Py · Rei</p>',
    )}
<section class="section hairline"><div class="shell-narrow prose">
  <h2>Empyré</h2>
  <p>Empyré is drawn from empyrean: the highest realm of pure fire and light in ancient cosmology. The spoken form is Em-Py-Rei, with emphasis at the centre: em-PY-rei.</p>
  <h2>The emblem</h2>
  <p>The mark joins two mirrored E forms through a central S-curve: Empyré, Elevation, Studio. The mirrored forms hold the tension between what a brand is and what it can become. The curve is the work itself.</p>
  <p>Elevation: the emblem is designed to feel as if it is lifting. Duality to clarity: Empyré sits in the middle as the bridge between potential and expression. Balance and precision: strategy and aesthetics held together. Identity as motion: the S is a path, not a freeze-frame. The highest form is the simplest, most intentional version of truth.</p>
  <p>Identity is not created. It is elevated.</p>
</div></section>
"""
    page("/about/the-name/", "The name — Empyré Studio", "Extended notes on the Empyré name and emblem.", "/about/", main, include_soar=False)

def notes_index():
    main = f"""{interior_hero(
        "Notes",
        "Published thinking, <em>when it earns its place.</em>",
        "Future notes should answer a real client question. Publishing volume is not a substitute for clarity.",
        aside='<p class="micro">Current</p><p class="interior-hero__statement">Brand systems · 5 minute read</p>',
    )}
<section class="section hairline"><div class="shell">
  <article class="note-card">
    <p class="micro">01 · Brand systems · 5 minute read</p>
    <h2><a href="/notes/a-brand-is-not-a-logo/">A brand is not a logo</a></h2>
    <p class="muted">The logo is one visible part of a larger operating environment: position, language, structure, behavior, and standard.</p>
    <a class="text-link" href="/notes/a-brand-is-not-a-logo/">Read the note <span>↗</span></a>
  </article>
</div></section>
{cta("Need the thinking applied to your business?", "A project conversation starts with the decision, constraint, or transition the brand needs to carry.", secondary=("Explore the system", "/system/"))}
"""
    page("/notes/", "Notes — Empyré Studio", "Studio notes on brand systems, positioning, and the standard Empyré holds.", "/notes/", main)


def note_article():
    main = f"""<article>
{interior_hero(
  "Notes <span>/</span> Brand systems",
  "A brand is <em>not</em> a logo.",
  "The mark is the smallest part of the system, and the last decision that should be made.",
  aside='<p class="micro">Note</p><p class="interior-hero__statement">Recognition is cumulative. Strategy gives the system a reason.</p>',
)}
<div class="section hairline"><div class="shell-narrow prose">
  <h2>Recognition is cumulative</h2>
  <p>A mark can identify a company, but recognition is built through repeated decisions: how the company describes its value, organizes information, behaves in moments of pressure, and maintains quality across channels.</p>
  <p>When those decisions share an underlying logic, the brand becomes easier to recognize and easier to trust. When they do not, even polished assets begin to feel unrelated.</p>
  <h2>Strategy gives the system a reason</h2>
  <p>Positioning determines what the brand must make clear and what it can deliberately leave behind. Audience understanding establishes which distinctions matter. A useful identity translates those decisions into language and form.</p>
  <p>This is why surface work completed before strategic clarity often produces expensive revision. The team is trying to solve a business argument through aesthetic preference.</p>
  <h2>A system must survive use</h2>
  <p>The real test begins after presentation. A brand system has to work in proposals, product interfaces, hiring, launches, social content, partner materials, and ordinary internal decisions.</p>
  <p>Guidelines, assets, verbal principles, and a clear transfer process are not administrative extras. They are how the original thinking continues when the studio is no longer in the room.</p>
  <h2>The standard becomes visible</h2>
  <p>A strong brand does not make every touchpoint identical. It makes every touchpoint feel governed by the same level of judgment.</p>
  <p>The logo matters. But the environment around it is what gives the mark meaning—and what allows the business to be understood consistently over time.</p>
</div></div>
</article>
{cta("Make the standard operational.", "If the business needs clearer positioning, a complete identity, launch direction, or long-term governance, begin with the change in front of you.", secondary=("Explore services", "/services/"))}
"""
    page("/notes/a-brand-is-not-a-logo/", "A brand is not a logo — Empyré Studio", "Why a brand is the environment in which a company is understood—not a mark, and not a folder of files.", "/notes/", main)


def contact_page():
    main = f"""{interior_hero(
        "Begin",
        "Project inquiry",
        f'Prefer email? Write to <a class="text-link" href="mailto:{EMAIL}">{EMAIL}</a>. Email is a fallback, never the only path.',
        aside='<p class="micro">Response</p><p class="interior-hero__statement">Every inquiry is reviewed personally within 48 hours, Monday through Friday.</p>',
    )}
<section class="section hairline"><div class="shell interior-contact">
  <div class="two-col interior-contact__notes" style="margin-bottom:2.5rem">
    <article class="proof-card"><p class="micro">Response</p><h3>Within 48 hours</h3><p class="muted">Every inquiry is reviewed personally, Monday through Friday.</p></article>
    <article class="proof-card"><p class="micro">Fit</p><h3>A clear decision-maker</h3><p class="muted">Empyré prioritizes projects with meaningful strategic change and respect for the process.</p></article>
    <article class="proof-card"><p class="micro">Privacy</p><h3>Used only to respond</h3><p class="muted">See the <a href="/privacy/" style="border-bottom:1px solid var(--line)">privacy policy</a>. Empyré does not respond to unsolicited vendor outreach.</p></article>
    <article class="proof-card"><p class="micro">Confidentiality</p><h3>Private work stays private</h3><p class="muted">Relevant unpublished experience can be discussed once fit is established.</p></article>
  </div>
  <form class="form surface-panel has-glare" name="project-inquiry" method="POST" action="/api/inquiry" data-inquiry-form>
    <input type="hidden" name="form-name" value="project-inquiry">
    <p class="hp"><label>Do not complete this field if you are human <input name="company-site-confirmation" tabindex="-1" autocomplete="off"></label></p>
    <p class="form-error" data-form-status hidden role="alert" aria-live="polite"></p>
    <div class="sr-only" data-form-summary tabindex="-1" aria-live="polite"></div>
    <input type="hidden" name="landing-page-url" value="">
    <input type="hidden" name="referrer" value="">
    <input type="hidden" name="utm-source" value="">
    <input type="hidden" name="utm-medium" value="">
    <input type="hidden" name="utm-campaign" value="">
    <input type="hidden" name="utm-term" value="">
    <input type="hidden" name="utm-content" value="">
    <div class="form-step" data-step="1">
      <p class="step-dots">Step 01 of 02 · What is changing</p>
      <p class="muted">A low-friction first step. Qualification follows.</p>
      <label class="field"><span>Name *</span><input name="name" type="text" autocomplete="name" required><span class="hint">Your full name.</span></label>
      <label class="field"><span>Email *</span><input name="email" type="email" autocomplete="email" required><span class="hint">A working email for the project reply.</span></label>
      <label class="field"><span>Company / organization *</span><input name="company" type="text" autocomplete="organization" required></label>
      <label class="field"><span>What is changing? *</span><textarea name="project-change" required placeholder="Where the brand is now, where it needs to stand, and what is in the way."></textarea></label>
      <div class="form-nav">
        <button class="button button--primary" type="button" data-next-step>Continue</button>
        <span class="step-dots">Then service, timing, and investment</span>
      </div>
    </div>
    <div class="form-step" data-step="2" hidden>
      <p class="step-dots">Step 02 of 02 · Qualification</p>
      <label class="field"><span>Primary service interest *</span>
        <select name="service" required>
          <option value="">Select one</option>
          <option value="brand-clarity-sprint">Brand Clarity Sprint</option>
          <option value="identity-transformation">Identity Transformation</option>
          <option value="signature-launch-suite">Signature Launch Suite</option>
          <option value="brand-stewardship">Brand Stewardship</option>
          <option value="not-sure">Not sure yet</option>
        </select>
      </label>
      <label class="field"><span>Current brand stage *</span>
        <select name="brand-stage" required>
          <option value="">Select one</option>
          <option>Starting something new</option>
          <option>Repositioning an existing business</option>
          <option>Preparing to launch</option>
          <option>Scaling a growing company</option>
          <option>Need ongoing brand support</option>
          <option>Other</option>
        </select>
      </label>
      <label class="field"><span>Desired timeline *</span>
        <select name="timeline" required>
          <option value="">Select one</option>
          <option>As soon as fit and availability allow</option>
          <option>Within 1–2 months</option>
          <option>Within 3–4 months</option>
          <option>Within 5–6 months</option>
          <option>More than 6 months away</option>
          <option>Exploring / not fixed</option>
        </select>
      </label>
      <label class="field"><span>Approximate investment orientation *</span>
        <select name="investment-range" required>
          <option value="">Select one</option>
          <option>Starting at $1,500 — Brand Clarity Sprint</option>
          <option>Starting at $4,500 — Identity Transformation</option>
          <option>Starting at $8,000 — Signature Launch Suite</option>
          <option>Starting at $1,200/month — Brand Stewardship</option>
          <option>Not sure yet — recommend the right starting point</option>
        </select>
        <span class="hint">Starting prices are an entry point, not a complete quote.</span>
      </label>
      <label class="field"><span>Website or social link</span><input name="website" type="url" placeholder="https://"></label>
      <label class="field"><span>How did you find Empyré?</span><input name="referral-source" type="text"></label>
      <label class="field"><span>Anything else we should know?</span><textarea name="additional-context"></textarea></label>
      <label class="consent">
        <input name="privacy-consent" type="checkbox" required>
        <span>I have read the <a href="/privacy/">privacy policy</a> and consent to Empyré using this information to assess and respond to my inquiry. *</span>
      </label>
      <div class="form-nav">
        <button class="button button--secondary" type="button" data-back-step>Back</button>
        <button class="button button--primary" type="submit">Send project inquiry</button>
      </div>
    </div>
  </form>
</div></section>
"""
    page("/contact/", "Start a project — Empyré Studio", "Start a qualified Empyré Studio project. Tell us what is changing. Every inquiry is reviewed personally within 48 hours.", "/", main)


def thank_you():
    main = f"""{interior_hero(
        "Received",
        "Your inquiry is with the studio.",
        f'Expect a personal reply within 48 hours, Monday through Friday. If the matter is urgent, write to <a href="mailto:{EMAIL}">{EMAIL}</a>.',
        aside='<p class="micro">Next</p><ul class="interior-hero__list"><li>Personal reply</li><li>Monday through Friday</li></ul>',
        extra="""<div class="button-row" style="margin-top:1.6rem">
    <a class="button button--primary" href="/">Return home</a>
    <a class="button button--secondary" href="/services/">Review services</a>
  </div>""",
    )}
"""
    page("/contact/thank-you/", "Inquiry received — Empyré Studio", "Your Empyré Studio inquiry has been received. A personal reply follows within 48 hours, Monday through Friday.", "/", main, include_soar=False)


def privacy():
    main = f"""{interior_hero(
        "Legal",
        "Privacy policy",
        "Last updated 20 August 2026. This page describes how Empyré Studio handles information collected through this website.",
        aside=f'<p class="micro">Contact</p><p class="interior-hero__statement">{EMAIL}</p>',
    )}
<section class="section hairline"><div class="shell-narrow prose">
  <h2>Who operates this site</h2>
  <p>This website is operated by Empyré Studio. Privacy questions can be sent to hello@empyrestudio.info. The studio’s legal entity name and governing jurisdiction will be added here after counsel review. Until that review is complete, treat this as an operational description of current practice, not legal advice.</p>
  <h2>Information collected</h2>
  <p>When you submit the project inquiry form, Empyré receives the information you choose to provide, including contact details, company information, project context, timing, investment orientation, referral source, and any additional notes.</p>
  <p>Hosting and security providers may also process limited technical information such as IP address, browser type, request time, and pages requested in order to deliver and protect the site.</p>
  <h2>How information is used</h2>
  <p>Inquiry information is used to assess project fit, respond to you, prepare a proposal where relevant, prevent spam, maintain business records, and meet legal obligations. It is not sold.</p>
  <h2>Forms and hosting</h2>
  <p>The intended production host is Netlify, using Netlify Forms. Form submissions are processed through that infrastructure and made available to Empyré. Review the host’s privacy and data-processing terms before production launch and configure submission retention appropriately.</p>
  <h2>Legal basis and retention</h2>
  <p>The applicable legal basis depends on jurisdiction and may include your consent, steps requested before entering a contract, legitimate business interests, and legal obligations. Inquiry data is retained only as long as needed to respond, to maintain records of the inquiry, and—if an engagement follows—for the duration of the work plus ordinary accounting and legal record-keeping. A jurisdiction-specific retention schedule will replace this description after legal review.</p>
  <h2>Sharing</h2>
  <p>Information may be shared with service providers that support hosting, security, communication, professional advice, or project delivery, only where necessary and subject to appropriate obligations. It may also be disclosed when required by law.</p>
  <h2>Your choices and rights</h2>
  <p>Depending on location, you may have rights to access, correct, delete, restrict, or object to processing of personal information, or withdraw consent. Contact hello@empyrestudio.info to make a request. Identity may need to be verified.</p>
  <h2>Cookies and analytics</h2>
  <p>No nonessential analytics or advertising cookies are configured in this build. If analytics, embedded media, or marketing technology is added later, this policy and any required consent mechanism must be updated before deployment.</p>
  <h2>Policy changes</h2>
  <p>This policy may be updated when the site, services, or legal requirements change. The revision date above identifies the current version.</p>
</div></section>
"""
    page("/privacy/", "Privacy policy — Empyré Studio", "How Empyré Studio collects and uses inquiry information. Contact hello@empyrestudio.info for privacy questions.", "/", main, include_soar=False)


def accessibility():
    main = f"""{interior_hero(
        "Access",
        "Accessibility",
        "Empyré Studio aims to provide a website that is usable by as many people as possible and to conform to WCAG 2.2 Level AA.",
        aside=f'<p class="micro">Feedback</p><p class="interior-hero__statement">{EMAIL}</p>',
    )}
<section class="section hairline"><div class="shell-narrow prose">
  <h2>Measures included in this build</h2>
  <ul class="list-check">
    <li>Semantic landmarks and a single primary heading on each page</li>
    <li>Keyboard-operable navigation, menus, forms, and disclosure widgets</li>
    <li>Visible focus indicators and a skip link</li>
    <li>Persistent form labels, instructions, and connected errors</li>
    <li>Touch targets of at least 44px and full-width primary actions on small screens</li>
    <li>Reduced-motion behavior for visitors who request it</li>
    <li>Alternative text for meaningful imagery and empty alternatives for decorative imagery</li>
    <li>Raised secondary-text contrast against the dark mineral palette</li>
  </ul>
  <h2>Known dependencies</h2>
  <p>Founder photography, approved client logos, testimonials, and future article or case-study media must be reviewed for meaningful alternative text, contrast, captions, and content accuracy before publication. This page does not claim certification.</p>
  <h2>Feedback</h2>
  <p>If you encounter a barrier or need information in another format, email hello@empyrestudio.info. Include the page, the issue, the assistive technology or browser used where relevant, and the format you need. Accessibility feedback is reviewed within 48 hours, Monday through Friday.</p>
</div></section>
"""
    page("/accessibility/", "Accessibility — Empyré Studio", "Empyré Studio accessibility statement, including keyboard access, contrast, reduced motion, and how to report a barrier.", "/", main, include_soar=False)


def write_static():
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nDisallow: /\n\n# Production launch: switch to Allow and publish sitemap.\n# Sitemap: https://empyrestudio.com/sitemap.xml\n",
        encoding="utf-8",
    )
    urls = [
        "/",
        "/services/",
        "/work/",
        "/system/",
        "/notes/",
        "/about/",
        "/contact/",
        "/privacy/",
        "/accessibility/",
        "/services/brand-clarity-sprint/",
        "/services/identity-transformation/",
        "/services/signature-launch-suite/",
        "/services/brand-stewardship/",
        "/work/empyre-studio/",
        "/notes/a-brand-is-not-a-logo/",
        "/contact/thank-you/",
    ]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        sm.append(f"<url><loc>{ORIGIN}{u}</loc></url>")
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")
    (ROOT / "site.webmanifest").write_text(
        """{
  "name": "Empyré Studio",
  "short_name": "Empyré",
  "description": "The standard, made visible.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0B0F13",
  "theme_color": "#0B0F13",
  "icons": [
    { "src": "/assets/img/logo/mark-48.png", "sizes": "48x48", "type": "image/png" },
    { "src": "/assets/img/logo/mark-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/assets/img/logo/mark-180.png", "sizes": "180x180", "type": "image/png" }
  ]
}
""",
        encoding="utf-8",
    )
    (ROOT / "netlify.toml").write_text(
        """[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-Content-Type-Options = "nosniff"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/contact"
  to = "/contact/"
  status = 301

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
""",
        encoding="utf-8",
    )
    # 404
    html = f"""{head("Page not found — Empyré Studio", "The requested Empyré Studio page could not be found.", "/", "/assets/img/r/hero_atmosphere-1600.jpg")}
<body class="surface-ground is-interior">
{header("/")}
<main id="main">
  {interior_hero(
        "404",
        "This page is not in the system.",
        "The address may have changed, or the page may not exist in this hybrid build.",
        aside='<p class="micro">Continue</p><ul class="interior-hero__list"><li>Return home</li><li>Start a project</li></ul>',
        extra='<div class="button-row" style="margin-top:1.6rem"><a class="button button--primary" href="/">Return home</a><a class="button button--secondary" href="/contact/">Start a project</a></div>',
    )}
</main>
{footer(False)}"""
    (ROOT / "404.html").write_text(html, encoding="utf-8")
    print("wrote static config")


def main():
    home()
    services_index()
    all_service_pages()
    work_index()
    case_study()
    system_page()
    about_page()
    about_the_name()
    notes_index()
    note_article()
    contact_page()
    thank_you()
    privacy()
    accessibility()
    write_static()


if __name__ == "__main__":
    main()
