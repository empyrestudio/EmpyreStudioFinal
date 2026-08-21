import { nameOf } from './utils.js'

function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, (ch) => (ch === 'é' ? 'e' : ch === '–' || ch === '—' ? '-' : "'"))
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
  return lines.slice(0, 42)
}

function pageStream(title, blocks, clientName, pageNo, total) {
  let y = 730
  const ops = []
  const put = (text, size, yPos) => {
    ops.push(`BT /F1 ${size} Tf 54 ${yPos} Td (${esc(text)}) Tj ET`)
  }
  put('EMPYRE STUDIO  |  Brand Elevation Assessment', 9, 760)
  const titleLines = wrap(title, 40)
  titleLines.forEach((ln) => {
    put(ln, 16, y)
    y -= 20
  })
  y -= 8
  ;(blocks || []).filter(Boolean).forEach((b) => {
    wrap(String(b), 86).forEach((ln) => {
      if (y < 56) return
      put(ln, 11, y)
      y -= 14
    })
    y -= 6
  })
  put(`Prepared by Empyre Studio  |  ${clientName}  |  ${pageNo}/${total}`, 8, 32)
  return ops.join('\n')
}

export function buildPdfBlob(record) {
  const c = record.client || {}
  const a = record.assessment || {}
  const n = nameOf(c)
  const sections = []
  const push = (title, blocks) => sections.push({ title, blocks: (blocks || []).filter(Boolean) })

  push('Cover', [
    'Brand Elevation Assessment', n, a.tier?.name, a.diagnosis?.headline,
    `Generated ${new Date().toLocaleDateString('en-US')}`,
    'The standard, made visible.',
    'Confidential until approved by Empyre Studio.',
  ])
  push('1. Executive diagnosis', [a.diagnosis?.perceived, a.diagnosis?.businessProblem, a.diagnosis?.asset, a.diagnosis?.gap, a.diagnosis?.future, `Confidence: ${a.diagnosis?.confidence || '-'}`])
  push('2. Evidence and assumptions', [
    a.evidence ? `Evidence completeness: ${a.evidence.score}/100. ${a.evidence.band}` : 'Evidence score pending.',
    'Unverified conclusions are strategic hypotheses.',
    'No testimonials, rankings, or metrics were invented.',
    a.logo?.disclaimer,
  ])
  push('3. Brand Clarity Map', [a.clarity?.essence, a.clarity?.positioning, a.clarity?.promise, a.clarity?.whitespace])
  push('4. Recommended Empyre tier', [a.tier?.name, a.tier?.line, a.tier?.why, ...(a.tier?.deliverables || [])])
  ;(a.directions || []).forEach((d) => {
    push(`Direction 0${d.index} - ${d.territory}`, [d.name, d.concept, d.positioning, d.messaging?.hero, d.voice, `Risk: ${d.risk}`])
  })
  push('Mood boards', (a.moodboards || []).map((m) => `${m.title}. ${m.feeling}`))
  push('Logo assessment', [a.logo?.verdict, a.logo?.rationale, a.logo?.disclaimer])
  push('Recommended direction', [a.recommended?.statement, a.recommended?.why, a.recommended?.retain, a.recommended?.exclude])
  push('Website, UX, SEO', [a.web?.hero, a.web?.cta, a.seo?.disclaimer, ...(a.seo?.themes || [])])
  push('Marketing and launch', ['Channels: ' + (a.marketing?.channels || []).join(', '), 'Pillars: ' + (a.marketing?.pillars || []).join(', ')])
  push('90-day roadmap', (a.roadmap || []).map((ph) => `${ph.phase}: ${ph.title}`))
  push('Next step', [a.proposal?.nextStep, a.closing, 'The standard, made visible.'])

  const streams = sections.map((s, i) => pageStream(s.title, s.blocks, n, i + 1, sections.length))
  const nPages = streams.length
  const objs = []
  const pushObj = (s) => {
    objs.push(s)
    return objs.length
  }

  const fontId = pushObj('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>')
  const contentIds = streams.map((st) => pushObj(`<< /Length ${st.length} >>\nstream\n${st}\nendstream`))
  const pagesIdPlaceholder = 0
  const pageIds = contentIds.map((cid) =>
    pushObj(`<< /Type /Page /Parent PAGES 0 R /MediaBox [0 0 612 792] /Contents ${cid} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`)
  )
  const pagesId = pushObj(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${nPages} >>`)
  const catalogId = pushObj(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
  objs[pageIds[0] - 1] = objs[pageIds[0] - 1] // keep
  for (let i = 0; i < pageIds.length; i++) {
    objs[pageIds[i] - 1] = objs[pageIds[i] - 1].replace('PAGES', String(pagesId))
  }

  let pdf = '%PDF-1.4\n'
  const offs = [0]
  objs.forEach((body, i) => {
    offs[i + 1] = pdf.length
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objs.length; i++) pdf += `${String(offs[i]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer << /Size ${objs.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export function downloadPdf(record) {
  const blob = buildPdfBlob(record)
  const n = (nameOf(record.client || {}) || 'Client').replace(/[^A-Za-z0-9]+/g, '-')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${n}-Empyre-Brand-Elevation-Assessment.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1500)
}
