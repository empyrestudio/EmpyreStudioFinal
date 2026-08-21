import { download, nameOf, slug, fmtDate } from './utils.js'
import { TIERS } from './constants.js'

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function md(s) {
  return String(s ?? '').replace(/\n/g, '  \n')
}

export function buildMarkdown(record, { internal = false } = {}) {
  const c = record.client || {}
  const a = record.assessment
  const n = nameOf(c)
  if (!a) return `# ${n}\n\nNo assessment generated yet.\n`
  let out = []
  out.push(`# Empyré Studio — Brand Elevation Assessment`)
  out.push(`## ${n}`)
  out.push(`*Internal draft. Human creative-director review required before client delivery.*`)
  out.push(`Generated ${fmtDate(a.generatedAt)} · Engine ${a.engineVersion || '1.0.0'}`)
  out.push('')
  out.push(a.diagnosis?.headline || '')
  out.push('')
  out.push(`**Confidence:** ${a.diagnosis?.confidence || '—'}  `)
  out.push(`**Recommended tier:** ${a.tier?.name || '—'}`)
  out.push('')
  out.push(`## 1. Executive Diagnosis`)
  out.push(`- Perceived position: ${a.diagnosis?.perceived}`)
  out.push(`- Business problem: ${a.diagnosis?.businessProblem}`)
  out.push(`- Strongest asset: ${a.diagnosis?.asset}`)
  out.push(`- Gap: ${a.diagnosis?.gap}`)
  out.push(`- Desired future: ${a.diagnosis?.future}`)
  out.push(`- Missing information: ${(a.diagnosis?.missing || []).join('; ') || 'None flagged'}`)
  out.push('')
  out.push(`## 2. Brand Clarity Map`)
  const cl = a.clarity || {}
  out.push(`**Essence:** ${cl.essence}`)
  out.push(`**Positioning:** ${cl.positioning}`)
  out.push(`**Promise:** ${cl.promise}`)
  out.push(`**Audience:** ${cl.audience?.text || ''}`)
  out.push(`**Motivations:** ${cl.motivation?.text || ''}`)
  out.push(`**Objections:** ${cl.objections?.text || ''}`)
  out.push(`**White space:** ${cl.whitespace}`)
  out.push(`**We are:** ${(cl.weAre || []).join(' / ')}`)
  out.push(`**We are not:** ${(cl.weAreNot || []).join(' / ')}`)
  out.push('')
  out.push(`## 3. Recommended Empyré Tier`)
  out.push(`### ${a.tier?.name}`)
  out.push(a.tier?.why || '')
  out.push('')
  out.push(`Deliverables:`)
  ;(a.tier?.deliverables || []).forEach((d) => out.push(`- ${d}`))
  out.push('')
  out.push(`## 4. Three Elevation Directions`)
  ;(a.directions || []).forEach((d) => {
    out.push(`### Direction 0${d.index} — ${d.name} (${d.territory})`)
    out.push(d.concept)
    out.push(`- Signal: ${d.signal}`)
    out.push(`- Positioning: ${d.positioning}`)
    out.push(`- Taglines: ${(d.taglines || []).join(' · ')}`)
    out.push(`- Hero: ${d.messaging?.hero}`)
    out.push(`- Voice: ${d.voice}`)
    out.push(`- Logo: ${d.logo?.type}`)
    out.push(`- Risk: ${d.risk}`)
    out.push('')
  })
  out.push(`## Recommended direction`)
  out.push(a.recommended?.statement || '')
  out.push(a.recommended?.why || '')
  out.push('')
  out.push(`## 5. Website + UX`)
  out.push(a.web?.hero || '')
  out.push(`Nav: ${a.web?.nav || ''}`)
  out.push(`CTA: ${a.web?.cta || ''}`)
  out.push('')
  out.push(`## 6. SEO + Content`)
  out.push(`Themes:`)
  ;(a.seo?.themes || []).forEach((t) => out.push(`- ${t}`))
  out.push(a.seo?.disclaimer || '')
  out.push('')
  out.push(`## 7. Marketing + Launch`)
  out.push(`Channels: ${(a.marketing?.channels || []).join(', ')}`)
  out.push(`Pillars: ${(a.marketing?.pillars || []).join(', ')}`)
  out.push('')
  out.push(`## 8. 90-Day Roadmap`)
  ;(a.roadmap || []).forEach((ph) => {
    out.push(`### ${ph.phase} — ${ph.title}`)
    ;(ph.items || []).forEach((it) => out.push(`- [${it.priority}] ${it.task} (${it.owner})`))
  })
  out.push('')
  out.push(`## Closing`)
  out.push(a.closing || '')
  out.push('')
  out.push(`---`)
  out.push(`Do not claim trademark availability. Do not invent testimonials, rankings, or metrics.`)
  if (internal) {
    out.push('')
    out.push(`## Internal notes (not for client)`)
    const nts = record.internalNotes || {}
    Object.entries(nts).forEach(([k, v]) => {
      if (k === 'needsReview') return
      if (v) out.push(`**${k}:** ${v}`)
    })
  }
  return out.join('\n')
}

export function buildProposalSummary(record) {
  const c = record.client || {}
  const a = record.assessment
  const n = nameOf(c)
  if (!a) return `No assessment generated for ${n}.`
  return [
    `EMPYRÉ STUDIO — PROPOSAL SUMMARY`,
    n,
    '',
    a.diagnosis?.headline,
    '',
    `Recommended engagement: ${a.tier?.name}`,
    a.tier?.line,
    '',
    `Why this tier`,
    a.tier?.why,
    '',
    `What it includes`,
    ...(a.tier?.deliverables || []).map((d) => `• ${d}`),
    '',
    `Strategic direction (draft)`,
    a.recommended?.statement,
    a.recommended?.why,
    '',
    `Primary conversion: ${c.conversionGoal || c.desiredAction || '—'}`,
    `Timeline (client-stated): ${c.timeline || '—'}`,
    `Budget range (client-stated): ${c.budget || '—'}`,
    '',
    `This is a strategic first draft for Empyré creative-director review. It is not a finished identity and not a legal clearance.`,
  ].join('\n')
}

export function buildClientEmail(record) {
  const c = record.client || {}
  const a = record.assessment
  const n = nameOf(c)
  return [
    `Subject: ${n} — Brand Elevation Assessment from Empyré Studio`,
    '',
    `Hello,`,
    '',
    `Thank you for the material you shared. We have prepared a Brand Elevation Assessment for ${n}.`,
    '',
    a?.diagnosis?.headline || 'The assessment is ready for review.',
    '',
    `Recommended next step: ${a?.tier?.name || 'a working session to lock positioning'}.`,
    a?.tier?.line || '',
    '',
    `This document is a strategic recommendation, not finished creative work. We would like to walk you through the diagnosis, the three directions, and the proposed engagement.`,
    '',
    `When you have thirty quiet minutes, we can debrief.`,
    '',
    `Empyré Studio`,
    `The standard, made visible.`,
  ].join('\n')
}

export function buildInternalBrief(record) {
  const c = record.client || {}
  const a = record.assessment
  const n = nameOf(c)
  const notes = record.internalNotes || {}
  return [
    `EMPYRÉ INTERNAL CREATIVE BRIEF`,
    n,
    `Status: ${record.status} · Human reviewed: ${record.humanReviewed ? 'yes' : 'NO'}`,
    '',
    `OFFER: ${c.primaryOffer || '—'}`,
    `AUDIENCE: ${c.primaryAudience || '—'}`,
    `ACTION: ${c.desiredAction || '—'}`,
    `STAGE: ${c.stage || '—'}`,
    `MUST REMAIN: ${c.mustRemain || '—'}`,
    `AVOID: ${c.avoidBrands || '—'}`,
    `ADMIRE: ${c.admiredBrands || '—'}`,
    '',
    `TIER: ${a?.tier?.name || '—'}`,
    `DIRECTION: ${a?.recommended?.statement || '—'}`,
    '',
    `CD NOTES`,
    notes.cdNotes || '—',
    '',
    `RISKS`,
    notes.risks || a?.recommended?.exclude || '—',
    '',
    `QUESTIONS FOR CLIENT`,
    notes.questions || (a?.diagnosis?.missing || []).join('\n') || '—',
    '',
    `SCOPE / PRICING NOTES`,
    notes.scopeConcerns || '',
    notes.pricingNotes || '',
    '',
    `HYPOTHESES REMAIN OPEN. Do not present invented proof. Trademark not cleared.`,
  ].join('\n')
}

export function buildRoadmapMarkdown(record) {
  const a = record.assessment
  const n = nameOf(record.client || {})
  if (!a) return `# Roadmap\nNone generated.\n`
  const lines = [`# 90-Day Elevation Roadmap — ${n}`, '']
  ;(a.roadmap || []).forEach((ph) => {
    lines.push(`## ${ph.phase}: ${ph.title}`)
    lines.push('| Task | Owner | Priority | Dependencies | Impact | Status | Due |')
    lines.push('|---|---|---|---|---|---|---|')
    ;(ph.items || []).forEach((it) => {
      lines.push(`| ${it.task} | ${it.owner} | ${it.priority} | ${it.deps} | ${it.impact} | ${it.status || ''} | ${it.due || ''} |`)
    })
    lines.push('')
  })
  return lines.join('\n')
}

export function buildHtmlReport(record) {
  const c = record.client || {}
  const a = record.assessment
  const n = nameOf(c)
  if (!a) return '<p>No assessment generated.</p>'

  const dirs = (a.directions || []).map((d) => {
    const pal = (d.palette || []).map((p) => `
      <div class="sw">
        <div class="chip" style="background:${esc(p.hex)}"></div>
        <strong>${esc(p.name)}</strong>
        <code>${esc(p.hex)}</code>
        <span>${esc(p.role)}</span>
      </div>`).join('')
    return `
      <section class="dir">
        <p class="kicker">Direction 0${d.index} · ${esc(d.territory)}</p>
        <h2>${esc(d.name)}</h2>
        <p class="lede">${esc(d.concept)}</p>
        <p><strong>Market signal.</strong> ${esc(d.signal)}</p>
        <p><strong>Positioning.</strong> ${esc(d.positioning)}</p>
        <p><strong>Hero.</strong> ${esc(d.messaging?.hero)}</p>
        <p><strong>Taglines.</strong> ${(d.taglines || []).map(esc).join(' · ')}</p>
        <p><strong>Voice.</strong> ${esc(d.voice)}</p>
        <p><strong>Logo.</strong> ${esc(d.logo?.type)} — ${esc(d.logo?.logic)}</p>
        <div class="pal">${pal}</div>
        <p><strong>Risk.</strong> ${esc(d.risk)}</p>
      </section>`
  }).join('')

  const tableRows = (a.comparisonCriteria || []).map((cr) => {
    const cells = (a.scores || []).map((s) => `<td>${s[cr.key]}</td>`).join('')
    return `<tr><th>${esc(cr.label)}</th>${cells}</tr>`
  }).join('')

  const road = (a.roadmap || []).map((ph) => `
    <h3>${esc(ph.phase)} — ${esc(ph.title)}</h3>
    <ul>${(ph.items || []).map((it) => `<li><strong>${esc(it.task)}</strong> · ${esc(it.owner)} · ${esc(it.priority)}</li>`).join('')}</ul>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Empyré Studio — Brand Elevation Assessment — ${esc(n)}</title>
<style>
  :root { --ink:#161412; --paper:#f6f1e8; --gold:#8a6a42; --mute:#6a645c; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); font-family: Georgia, 'Times New Roman', serif; }
  .page { max-width: 860px; margin: 0 auto; padding: 56px 40px 96px; }
  .wordmark { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 22px; letter-spacing: .28em; font-weight: 500; margin-bottom: 28px; }
  .wordmark span { display: block; font-size: 11px; letter-spacing: .4em; margin-top: 6px; font-weight: 400; }
  .kicker { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
  h1 { font-weight: 500; font-size: 42px; line-height: 1.1; margin: 8px 0 12px; }
  h2 { font-weight: 500; font-size: 28px; margin: 36px 0 10px; }
  h3 { font-size: 18px; margin: 22px 0 8px; }
  p { line-height: 1.6; font-size: 16px; }
  .lede { font-size: 18px; color: #3a3834; }
  hr { border:0; border-top:1px solid #ddd6c8; margin: 32px 0; }
  .banner { border: 1px solid #ddd6c8; padding: 18px 20px; background: #efe8dc; }
  table { width:100%; border-collapse: collapse; font-size: 13px; font-family: ui-sans-serif, system-ui, sans-serif; }
  th, td { border-bottom: 1px solid #ddd6c8; padding: 8px 6px; text-align:left; }
  .pal { display:flex; flex-wrap:wrap; gap:8px; margin: 12px 0 16px; }
  .sw { width: 120px; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; }
  .chip { height: 48px; border: 1px solid #ddd6c8; }
  .foot { margin-top: 48px; font-size: 12px; color: var(--mute); font-family: ui-sans-serif, system-ui, sans-serif; }
  .hyp { font-size: 12px; color: var(--gold); font-family: ui-sans-serif, system-ui, sans-serif; }
  ul { line-height: 1.55; }
  @media print { body { background:white; } .page { padding: 0; } }
</style>
</head>
<body>
  <div class="page">
    <div class="wordmark">EMPYRÉ <span>STUDIO</span></div>
    <p class="kicker">Brand Elevation Assessment · Confidential until approved</p>
    <h1>${esc(n)}</h1>
    <p class="lede">${esc(a.diagnosis?.headline)}</p>
    <p class="hyp">Confidence: ${esc(a.diagnosis?.confidence)} · Draft for creative-director review · Not finished creative work</p>
    <div class="banner">
      <p class="kicker">Recommended engagement</p>
      <h2 style="margin-top:6px">${esc(a.tier?.name)}</h2>
      <p>${esc(a.tier?.line)}</p>
      <p>${esc(a.tier?.why)}</p>
    </div>

    <h2>1. Executive Diagnosis</h2>
    <p><strong>Perceived position.</strong> ${esc(a.diagnosis?.perceived)}</p>
    <p><strong>Business problem.</strong> ${esc(a.diagnosis?.businessProblem)}</p>
    <p><strong>Strongest asset.</strong> ${esc(a.diagnosis?.asset)}</p>
    <p><strong>Gap.</strong> ${esc(a.diagnosis?.gap)}</p>
    <p><strong>Desired future.</strong> ${esc(a.diagnosis?.future)}</p>

    <h2>2. Brand Clarity Map</h2>
    <p><strong>Essence.</strong> ${esc(a.clarity?.essence)}</p>
    <p><strong>Positioning.</strong> ${esc(a.clarity?.positioning)}</p>
    <p><strong>Promise.</strong> ${esc(a.clarity?.promise)}</p>
    <p><strong>White space.</strong> ${esc(a.clarity?.whitespace)}</p>

    <h2>3. Three Elevation Directions</h2>
    ${dirs}

    <h2>Comparison</h2>
    <table>
      <thead><tr><th>Criterion</th>${(a.scores || []).map((s) => `<th>${esc(s.name)}</th>`).join('')}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>

    <h2>Recommended direction</h2>
    <p><strong>${esc(a.recommended?.statement)}</strong></p>
    <p>${esc(a.recommended?.why)}</p>
    <p>${esc(a.recommended?.retain)}</p>
    <p>${esc(a.recommended?.exclude)}</p>

    <h2>Website + UX</h2>
    <p>${esc(a.web?.hero)}</p>
    <p>${esc(a.web?.nav)}</p>
    <p>${esc(a.web?.cta)}</p>

    <h2>SEO + Content</h2>
    <p>${esc(a.seo?.disclaimer)}</p>
    <ul>${(a.seo?.themes || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>

    <h2>Marketing + Launch</h2>
    <p><strong>Channels.</strong> ${(a.marketing?.channels || []).map(esc).join(', ')}</p>
    <p><strong>Pillars.</strong> ${(a.marketing?.pillars || []).map(esc).join(', ')}</p>

    <h2>90-Day Roadmap</h2>
    ${road}

    <h2>Closing</h2>
    <p>${esc(a.closing)}</p>

    <hr/>
    <p class="foot">
      Empyré Studio · The standard, made visible.<br/>
      Unverified conclusions are strategic hypotheses and require research, client input, analytics, or testing.<br/>
      Empyré does not claim trademark availability for any name, mark, or tagline.<br/>
      No testimonials, rankings, volumes, or performance metrics were invented.
    </p>
  </div>
</body>
</html>`
}

export function downloadText(record, kind) {
  const n = slug(nameOf(record.client))
  const map = {
    markdown: { name: `${n}-elevation.md`, body: buildMarkdown(record), mime: 'text/markdown' },
    markdownInternal: { name: `${n}-elevation-internal.md`, body: buildMarkdown(record, { internal: true }), mime: 'text/markdown' },
    proposal: { name: `${n}-proposal-summary.txt`, body: buildProposalSummary(record), mime: 'text/plain' },
    email: { name: `${n}-client-email.txt`, body: buildClientEmail(record), mime: 'text/plain' },
    brief: { name: `${n}-internal-brief.txt`, body: buildInternalBrief(record), mime: 'text/plain' },
    roadmap: { name: `${n}-90-day-roadmap.md`, body: buildRoadmapMarkdown(record), mime: 'text/markdown' },
    html: { name: `${n}-elevation-report.html`, body: buildHtmlReport(record), mime: 'text/html' },
    json: { name: `${n}-assessment.json`, body: JSON.stringify(record, null, 2), mime: 'application/json' },
  }
  const f = map[kind]
  if (!f) return
  download(f.name, f.body, f.mime)
}

export function printHtml(record) {
  const html = buildHtmlReport(record)
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 400)
}

export { TIERS }
