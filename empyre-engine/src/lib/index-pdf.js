import { nameOf } from './utils.js'
import { PILLARS, statusFor, totalFrom, weighted } from './index-engine.js'

function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, (ch) => (ch === 'é' ? 'e' : '-'))
}

function wrap(text, width = 86) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ')
  const lines = []
  let cur = ''
  words.forEach((w) => {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > width) {
      if (cur) lines.push(cur)
      cur = w
    } else cur = next
  })
  if (cur) lines.push(cur)
  return lines.slice(0, 36)
}

function stream(title, blocks, brand, page, total) {
  let y = 730
  const ops = []
  const put = (text, size, yPos) => ops.push(`BT /F1 ${size} Tf 54 ${yPos} Td (${esc(text)}) Tj ET`)
  put('EMPYRE STUDIO  |  The Standard Index', 9, 760)
  wrap(title, 42).forEach((ln) => { put(ln, 16, y); y -= 20 })
  y -= 6
  ;(blocks || []).filter(Boolean).forEach((b) => {
    wrap(String(b), 86).forEach((ln) => {
      if (y < 56) return
      put(ln, 11, y)
      y -= 14
    })
    y -= 6
  })
  put(`Prepared by Empyre Studio  |  ${brand}  |  ${page}/${total}`, 8, 32)
  return ops.join('\n')
}

export function downloadIndexPdf(rec, kind = 'exec') {
  const brand = rec.brandName || 'Client'
  const before = totalFrom(rec.pillarsBefore)
  const after = totalFrom(rec.pillarsAfter)
  const sections = []
  const push = (title, blocks) => sections.push({ title, blocks })

  push('Cover', [
    kind === 'internal' ? 'Internal working report' : kind === 'full' ? 'Before-and-After Brand Elevation Report' : 'Executive Brand Reading',
    brand,
    rec.isSample ? 'SAMPLE PROJECT - FOR DEMONSTRATION ONLY' : '',
    rec.diagnosticType, rec.projectType,
    `Before ${before} / 100 - ${statusFor(before).label}`,
    rec.afterEnabled ? `After ${after} / 100 - ${statusFor(after).label}` : '',
    'Expert brand-system assessment. Not a guarantee of revenue, rankings, or sentiment.',
    'The standard, made visible.',
  ])
  push('Baseline', [
    rec.perceptionDesired && `Desired: ${rec.perceptionDesired}`,
    rec.perceptionObserved && `Observed: ${rec.perceptionObserved}`,
    rec.perceptionGap && `Gap: ${rec.perceptionGap}`,
    ...PILLARS.map((p) => `${p.name}: ${rec.pillarsBefore[p.id]?.raw || 1}/10 -> ${weighted(rec.pillarsBefore[p.id]?.raw, p.weight)} pts`),
  ])
  if (kind !== 'exec') {
    push('Elevation plan', (rec.interventions || []).map((i) => `CURRENT REALITY -> ${i} -> ELEVATED OUTCOME`))
    ;(rec.gaps || []).forEach((g) => push('Gap', [g.finding, g.evidence, g.response]))
  }
  if (kind === 'full' && rec.afterEnabled) {
    push('After', [
      rec.afterNarrative, rec.closing,
      ...PILLARS.map((p) => `${p.name}: ${rec.pillarsAfter[p.id]?.raw || 1}/10`),
    ])
  }
  if (kind === 'internal') {
    push('Internal', [rec.internalRisks, rec.upsell, 'Never share this PDF in the client portal.'])
  }
  push('Close', [rec.closing || 'Reviewed drafts only. Empyre Studio holds the standard.', 'Reviewed and approved by Empyre Studio — required before treating as final.'])

  const streams = sections.map((s, i) => stream(s.title, s.blocks, brand, i + 1, sections.length))
  const objs = []
  const add = (b) => { objs.push(b); return objs.length }
  const fontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>')
  const cids = streams.map((st) => add(`<< /Length ${st.length} >>\nstream\n${st}\nendstream`))
  const pageIds = cids.map((cid) => add(`<< /Type /Page /Parent PAGES 0 R /MediaBox [0 0 612 792] /Contents ${cid} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`))
  const pagesId = add(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`)
  const cat = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
  pageIds.forEach((id) => { objs[id - 1] = objs[id - 1].replace('PAGES', String(pagesId)) })
  let pdf = '%PDF-1.4\n'
  const offs = [0]
  objs.forEach((body, i) => { offs[i + 1] = pdf.length; pdf += `${i + 1} 0 obj\n${body}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objs.length; i++) pdf += `${String(offs[i]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer << /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${xref}\n%%EOF`
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }))
  const slug = brand.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40)
  a.download = `${slug}-Empyre-Standard-Index-${kind}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export { nameOf }
