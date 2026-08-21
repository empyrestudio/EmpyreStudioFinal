import { useState } from 'react'
import { ASSESS_TABS, OWNERS, PRIORITIES } from '../lib/constants.js'
import { Badge, Block, Editable, SourceTag, StatusBadge } from '../components/ui.jsx'
import { downloadText, printHtml } from '../lib/export.js'
import { downloadPdf } from '../lib/pdf.js'
import { nameOf } from '../lib/utils.js'

export default function Assessment({ record, tab, setTab, onPatchAssessment, onPatchNotes, onPatchMeta, onRegenerate, onExportLog }) {
  const a = record.assessment
  const c = record.client
  const [dir, setDir] = useState(0)

  if (!a) {
    return (
      <div className="page">
        <div className="kicker">{nameOf(c)}</div>
        <h1 className="display">Intake captured. Assessment not generated.</h1>
        <p className="lede">Run the engine to draft diagnosis, tier, three directions, and the 90-day plan. Everything remains editable.</p>
        <button className="btn primary" onClick={onRegenerate}>Generate assessment</button>
      </div>
    )
  }

  const d = a.directions?.[dir] || a.directions?.[0]

  const setDeep = (updater) => {
    const next = structuredClone(a)
    updater(next)
    onPatchAssessment(next)
  }

  const exportKind = (kind) => {
    if (!record.humanReviewed && kind !== 'brief' && kind !== 'markdownInternal' && kind !== 'json') {
      const go = window.confirm('This assessment is not marked as creative-director reviewed. Export anyway as an internal draft?')
      if (!go) return
    }
    if (kind === 'print') printHtml(record)
    else if (kind === 'pdf') downloadPdf(record)
    else downloadText(record, kind)
    onExportLog(kind)
  }

  return (
    <div>
      <div className="page" style={{ paddingBottom: 0 }}>
        <div className="kicker">Brand Elevation Assessment</div>
        <h1 className="display">{nameOf(c)}</h1>
        <div className="meta" style={{ margin: '12px 0 8px' }}>
          <StatusBadge status={record.status} />
          {record.isDemo && <Badge tone="warn">Demo — not a real client</Badge>}
          <Badge tone="gold">{a.tier?.name}</Badge>
          <Badge>Confidence {a.diagnosis?.confidence}</Badge>
          {record.humanReviewed ? <Badge tone="ok">CD reviewed</Badge> : <Badge tone="danger">Needs human review</Badge>}
          {c.industry && <span>{c.industry}</span>}
        </div>
        <p className="lede">{a.diagnosis?.headline}</p>
      </div>

      <div className="assess-shell">
      <div className="tabs assess-nav glass-1">
        {ASSESS_TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="page assess-canvas" style={{ paddingTop: 0 }}>
        {tab === 'diagnosis' && <Diagnosis a={a} setDeep={setDeep} />}
        {tab === 'clarity' && <Clarity a={a} setDeep={setDeep} />}
        {tab === 'tier' && <Tier a={a} setDeep={setDeep} />}
        {tab === 'directions' && (
          <Directions a={a} d={d} dir={dir} setDir={setDir} setDeep={setDeep} />
        )}
        {tab === 'web' && <Web a={a} setDeep={setDeep} />}
        {tab === 'seo' && <Seo a={a} setDeep={setDeep} />}
        {tab === 'marketing' && <Marketing a={a} setDeep={setDeep} />}
        {tab === 'roadmap' && <Roadmap a={a} setDeep={setDeep} />}
        {tab === 'proposal' && <Proposal a={a} setDeep={setDeep} />}
        {tab === 'notes' && <Notes record={record} onPatchNotes={onPatchNotes} onPatchMeta={onPatchMeta} />}
        {tab === 'export' && <Export record={record} exportKind={exportKind} onPatchMeta={onPatchMeta} />}
      </div>
      </div>
    </div>
  )
}

function Diagnosis({ a, setDeep }) {
  const dx = a.diagnosis
  return (
    <div className="section">
      {dx.missing?.length > 0 && (
        <div className="banner warn">
          <h4>Incomplete intake</h4>
          <p>Missing: {dx.missing.join(', ')}. Related conclusions are hypotheses until supplied.</p>
        </div>
      )}
      <div className="banner">
        <h4>Opening line</h4>
        <Editable multiline value={dx.headline} onChange={(v) => setDeep((n) => { n.diagnosis.headline = v })} />
      </div>
      <div className="grid-2">
        <Block kicker="Perceived position">
          <Editable multiline value={dx.perceived} onChange={(v) => setDeep((n) => { n.diagnosis.perceived = v })} />
        </Block>
        <Block kicker="Business problem behind the visual problem">
          <Editable multiline value={dx.businessProblem} onChange={(v) => setDeep((n) => { n.diagnosis.businessProblem = v })} />
        </Block>
        <Block kicker="Strongest current asset">
          <Editable multiline value={dx.asset} onChange={(v) => setDeep((n) => { n.diagnosis.asset = v })} />
        </Block>
        <Block kicker="Biggest gap">
          <Editable multiline value={dx.gap} onChange={(v) => setDeep((n) => { n.diagnosis.gap = v })} />
        </Block>
        <Block kicker="Desired future perception" className="span-2">
          <Editable multiline value={dx.future} onChange={(v) => setDeep((n) => { n.diagnosis.future = v })} />
        </Block>
      </div>
      <Block kicker="Why other tiers are not the first step">
        <ul>
          {(dx.others || []).map((o) => (
            <li key={o.name}><strong>{o.name}.</strong> {o.reason}</li>
          ))}
        </ul>
      </Block>
      <Block kicker="Confidence">
        <p>{dx.confidence}. Hypotheses are labelled throughout. This draft is not finished creative work.</p>
      </Block>
    </div>
  )
}

function Clarity({ a, setDeep }) {
  const cl = a.clarity
  const text = (obj, path) => (typeof obj === 'object' && obj?.text != null ? obj.text : obj)
  const setText = (key) => (v) => setDeep((n) => {
    if (n.clarity[key] && typeof n.clarity[key] === 'object') n.clarity[key].text = v
    else n.clarity[key] = v
  })
  return (
    <div className="section">
      <Block kicker="One-sentence essence">
        <Editable multiline value={cl.essence} onChange={(v) => setDeep((n) => { n.clarity.essence = v })} />
      </Block>
      <div className="grid-2">
        <Block kicker="Positioning statement">
          <Editable multiline value={cl.positioning} onChange={setText('positioning')} />
        </Block>
        <Block kicker="Brand promise">
          <Editable multiline value={cl.promise} onChange={(v) => setDeep((n) => { n.clarity.promise = v })} />
        </Block>
      </div>
      <Block kicker="Audience">
        <dl className="kv">
          <dt>Primary {cl.audience?.source && <SourceTag source={cl.audience.source} />}</dt>
          <dd><Editable multiline value={text(cl.audience)} onChange={setText('audience')} /></dd>
          <dt>Secondary</dt>
          <dd><Editable multiline value={text(cl.secondary)} onChange={setText('secondary')} /></dd>
          <dt>Motivation</dt>
          <dd><Editable multiline value={text(cl.motivation)} onChange={setText('motivation')} /></dd>
          <dt>Objections</dt>
          <dd><Editable multiline value={text(cl.objections)} onChange={setText('objections')} /></dd>
          <dt>Pain</dt>
          <dd><Editable multiline value={text(cl.pain)} onChange={setText('pain')} /></dd>
          <dt>Purchase triggers</dt>
          <dd><Editable multiline value={cl.triggers} onChange={(v) => setDeep((n) => { n.clarity.triggers = v })} /></dd>
        </dl>
      </Block>
      <div className="grid-2">
        <Block kicker="Category conventions">
          <Editable multiline value={cl.conventions} onChange={(v) => setDeep((n) => { n.clarity.conventions = v })} />
        </Block>
        <Block kicker="White-space opportunity">
          <Editable multiline value={cl.whitespace} onChange={(v) => setDeep((n) => { n.clarity.whitespace = v })} />
        </Block>
      </div>
      <Block kicker="Differentiators">
        <ul>
          {(cl.differentiators || []).map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </Block>
      <Block kicker="Brand pillars">
        <ul>{(cl.pillars || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
      </Block>
      <Block kicker="Personality sliders" extra={<p style={{ marginBottom: 12 }}>{cl.slidersNote}</p>}>
        <div className="sliders">
          {(cl.sliders || []).map((s, i) => (
            <div className="slider-row" key={s.left}>
              <span>{s.left}</span>
              <input type="range" min="0" max="100" value={s.value}
                onChange={(e) => setDeep((n) => { n.clarity.sliders[i].value = Number(e.target.value) })} />
              <span>{s.right}</span>
            </div>
          ))}
        </div>
      </Block>
      <div className="grid-2">
        <Block kicker="We are">
          <ul>{(cl.weAre || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
        </Block>
        <Block kicker="We are not">
          <ul>{(cl.weAreNot || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
        </Block>
      </div>
      <Block kicker="Voice principles">
        <ul>{(cl.voicePrinciples || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
      </Block>
      <Block kicker="Proof required to make positioning believable">
        <ul>{(cl.proofRequired || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
      </Block>
    </div>
  )
}

function Tier({ a }) {
  const t = a.tier
  return (
    <div className="section">
      <div className="tier-card rec">
        <div className="kicker">{t.code} · {t.category}</div>
        <h2 className="display">{t.name}</h2>
        <p>{t.line}</p>
        <p style={{ marginTop: 10 }}>{t.why}</p>
        {t.preferenceNote && <p style={{ marginTop: 10 }}><Badge tone="warn">Preference note</Badge> {t.preferenceNote}</p>}
      </div>
      <Block kicker="Key outcomes this tier is for">
        <p>{t.why}</p>
      </Block>
      <Block kicker="Deliverables included">
        <ul>{(t.deliverables || []).map((d) => <li key={d}>{d}</li>)}</ul>
      </Block>
      <Block kicker="Why other tiers are not the first step">
        <ul>
          {(t.whyOthers || []).map((o) => (
            <li key={o.name}><strong>{o.name}.</strong> {o.reason}</li>
          ))}
        </ul>
      </Block>
      <Block kicker="Future phase">
        <p>{t.futurePhase}</p>
      </Block>
    </div>
  )
}

function Directions({ a, d, dir, setDir, setDeep }) {
  if (!d) return null
  const rec = a.recommended
  return (
    <div className="section">
      <div className="dir-nav">
        {(a.directions || []).map((x, i) => (
          <button key={x.id} className={`btn ${dir === i ? 'primary' : ''}`} onClick={() => setDir(i)}>
            0{x.index} · {x.territory}
          </button>
        ))}
      </div>

      <div className="banner">
        <h4>{d.territory}</h4>
        <h2 className="display" style={{ fontSize: 36, margin: '6px 0 8px' }}>{d.name}</h2>
        <p>{d.concept}</p>
      </div>

      <div className="grid-2">
        <Block kicker="Market signal"><p>{d.signal}</p></Block>
        <Block kicker="Audience emotional response"><p>{d.emotion}</p></Block>
        <Block kicker="Ideal client fit"><p>{d.fit}</p></Block>
        <Block kicker="Risk / tradeoff"><p>{d.risk}</p></Block>
      </div>

      <Block kicker="Positioning variation">
        <Editable multiline value={d.positioning} onChange={(v) => setDeep((n) => { n.directions[dir].positioning = v })} />
      </Block>

      <Block kicker="Tagline options — not cleared for trademark">
        <ul>{(d.taglines || []).map((t) => <li key={t}>{t}</li>)}</ul>
        <p style={{ marginTop: 8 }}><Badge tone="hyp">Legal review required before use</Badge></p>
      </Block>

      <Block kicker="Messaging hierarchy">
        <dl className="kv">
          <dt>Hero</dt><dd>{d.messaging?.hero}</dd>
          <dt>Supporting</dt><dd>{d.messaging?.support}</dd>
          <dt>Proof</dt><dd>{d.messaging?.proof}</dd>
          <dt>CTA</dt><dd>{d.messaging?.cta}</dd>
        </dl>
      </Block>

      <div className="grid-2">
        <Block kicker="Voice and tone"><p>{d.voice}</p></Block>
        <Block kicker="Personality">
          <div className="sliders">
            {(d.personality || []).map((s) => (
              <div className="slider-row" key={s.left}>
                <span>{s.left}</span>
                <input type="range" min="0" max="100" value={s.value} readOnly />
                <span>{s.right}</span>
              </div>
            ))}
          </div>
        </Block>
      </div>

      <div className="grid-2">
        <Block kicker="Words to use">
          <div className="word-list">{(d.wordsUse || []).map((w) => <span className="word" key={w}>{w}</span>)}</div>
        </Block>
        <Block kicker="Words to avoid">
          <div className="word-list">{(d.wordsAvoid || []).map((w) => <span className="word avoid" key={w}>{w}</span>)}</div>
        </Block>
      </div>

      <Block kicker="Logo direction">
        <dl className="kv">
          <dt>Type</dt><dd>{d.logo?.type}</dd>
          <dt>Construction</dt><dd>{d.logo?.logic}</dd>
          <dt>Cues</dt><dd>{d.logo?.cues}</dd>
          <dt>Use</dt><dd>{d.logo?.uses}</dd>
          <dt>Avoid</dt><dd>{d.logo?.avoid}</dd>
        </dl>
        <p style={{ marginTop: 10 }}><Badge tone="hyp">Do not claim this mark is trademark-clear</Badge></p>
      </Block>

      <Block kicker="Color palette">
        <div className="palette">
          {(d.palette || []).map((p) => (
            <div className="swatch" key={p.hex}>
              <div className="chip" style={{ background: p.hex }} />
              <div className="info">
                <strong>{p.name}</strong>
                <code>{p.hex}</code>
                <p>{p.role}</p>
                <p>{p.rationale}</p>
                <p>{p.a11y}</p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block kicker="Typography — openly licensed examples">
        <dl className="kv">
          <dt>Display</dt><dd>{d.type?.display}</dd>
          <dt>Body</dt><dd>{d.type?.body}</dd>
          <dt>UI</dt><dd>{d.type?.ui}</dd>
          <dt>Hierarchy</dt><dd>{d.type?.hierarchy}</dd>
          <dt>Examples</dt><dd>{d.type?.examples}</dd>
        </dl>
      </Block>

      <Block kicker="Graphic language"><p>{d.graphic}</p></Block>
      <Block kicker="Photography / art direction">
        <dl className="kv">
          <dt>Subject</dt><dd>{d.photo?.subject}</dd>
          <dt>Lighting</dt><dd>{d.photo?.lighting}</dd>
          <dt>Composition</dt><dd>{d.photo?.composition}</dd>
          <dt>Avoid</dt><dd>{d.photo?.avoid}</dd>
        </dl>
      </Block>

      <Block kicker="Website creative direction">
        <p><strong>Hero.</strong> {d.website?.hero}</p>
        <p style={{ marginTop: 8 }}><strong>Nav.</strong> {d.website?.nav}</p>
        <p style={{ marginTop: 8 }}><strong>CTA.</strong> {d.website?.cta}</p>
      </Block>

      <Block kicker="Brand applications">
        <div className="word-list">{(d.applications || []).map((x) => <span className="word" key={x}>{x}</span>)}</div>
      </Block>
      <Block kicker="Empyré deliverables needed"><p>{d.deliverablesNeeded}</p></Block>

      <h2 className="display" style={{ marginTop: 12 }}>Direction comparison</h2>
      <div className="block" style={{ overflowX: 'auto' }}>
        <table className="compare">
          <thead>
            <tr>
              <th>Criterion</th>
              {(a.scores || []).map((s) => <th key={s.id}>{s.name}</th>)}
              <th>Best</th>
            </tr>
          </thead>
          <tbody>
            {(a.comparisonCriteria || []).map((cr) => {
              const vals = (a.scores || []).map((s) => s[cr.key])
              const bestVal = cr.key === 'risk' ? Math.min(...vals) : Math.max(...vals)
              const best = (a.scores || []).find((s) => s[cr.key] === bestVal)
              return (
                <tr key={cr.key}>
                  <th>{cr.label}</th>
                  {(a.scores || []).map((s) => (
                    <td className="num" key={s.id}>{s[cr.key]} / 10</td>
                  ))}
                  <td>{best?.territory}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 12, color: 'var(--mute)', fontSize: 12 }}>
          Scores are a structured first pass for internal ranking — not research, not a substitute for creative-director judgment.
        </p>
      </div>

      <div className="banner">
        <h4>Recommended direction</h4>
        <h3 className="display">{rec?.statement}</h3>
        <p>{rec?.why}</p>
        <p style={{ marginTop: 8 }}><strong>Makes the audience believe:</strong> {rec?.believe}</p>
        <p style={{ marginTop: 8 }}><strong>Helps the business achieve:</strong> {rec?.achieve}</p>
        <p style={{ marginTop: 8 }}><strong>Retain:</strong> {rec?.retain}</p>
        <p style={{ marginTop: 8 }}><strong>Exclude:</strong> {rec?.exclude}</p>
        <p style={{ marginTop: 8 }}><strong>Validate before identity lock:</strong></p>
        <ul>{(rec?.test || []).map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </div>
  )
}

function Web({ a, setDeep }) {
  const w = a.web
  return (
    <div className="section">
      <Block kicker="Hero recommendation"><Editable multiline value={w.hero} onChange={(v) => setDeep((n) => { n.web.hero = v })} /></Block>
      <Block kicker="Navigation"><Editable multiline value={w.nav} onChange={(v) => setDeep((n) => { n.web.nav = v })} /></Block>
      <Block kicker="Homepage hierarchy">
        <ul>{(w.hierarchy || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
      </Block>
      <div className="grid-2">
        <Block kicker="Offer / service pages"><p>{w.services}</p></Block>
        <Block kicker="CTA strategy"><p>{w.cta}</p></Block>
        <Block kicker="Proof"><p>{w.proof}</p></Block>
        <Block kicker="Portfolio / case study"><p>{w.portfolio}</p></Block>
        <Block kicker="Contact / inquiry flow"><p>{w.contact}</p></Block>
        <Block kicker="Mobile"><p>{w.mobile}</p></Block>
      </div>
      <Block kicker="Accessibility flags"><p>{w.a11y}</p></Block>
      <Block kicker="Conversion friction">
        <ul>{(w.friction || []).map((x) => <li key={x}>{x}</li>)}</ul>
      </Block>
      <Block kicker="Recommended page structure">
        <div className="word-list">{(w.pageStructure || []).map((x) => <span className="word" key={x}>{x}</span>)}</div>
      </Block>
    </div>
  )
}

function Seo({ a }) {
  const s = a.seo
  return (
    <div className="section">
      <div className="banner warn">
        <h4>SEO safeguard</h4>
        <p>{s.disclaimer}</p>
      </div>
      <Block kicker="Keyword themes">
        <ul>{(s.themes || []).map((t) => <li key={t}>{t}</li>)}</ul>
      </Block>
      <Block kicker="Site architecture">
        <ul>{(s.architecture || []).map((t) => <li key={t}>{t}</li>)}</ul>
      </Block>
      <Block kicker="Priority pages">
        <div className="word-list">{(s.priorityPages || []).map((t) => <span className="word" key={t}>{t}</span>)}</div>
      </Block>
      <div className="grid-2">
        <Block kicker="Suggested page titles">
          <ul>{(s.titles || []).map((t) => <li key={t}>{t}</li>)}</ul>
        </Block>
        <Block kicker="Suggested H1s">
          <ul>{(s.h1s || []).map((t) => <li key={t}>{t}</li>)}</ul>
        </Block>
      </div>
      <Block kicker="Meta description concept"><p>{s.metaConcept}</p></Block>
      <Block kicker="Internal linking"><p>{s.internal}</p></Block>
      <Block kicker="FAQ"><p>{s.faq}</p></Block>
      <Block kicker="Journal / resources / case studies"><p>{s.blog}</p></Block>
      <Block kicker="Structured data"><p>{s.schema}</p></Block>
      <Block kicker="Content gaps"><p>{s.gaps}</p></Block>
    </div>
  )
}

function Marketing({ a }) {
  const m = a.marketing
  return (
    <div className="section">
      <Block kicker="Best channels">
        <div className="word-list">{(m.channels || []).map((t) => <span className="word" key={t}>{t}</span>)}</div>
      </Block>
      <Block kicker="Content pillars">
        <div className="word-list">{(m.pillars || []).map((t) => <span className="word" key={t}>{t}</span>)}</div>
      </Block>
      <Block kicker="10 content ideas">
        <ul>{(m.ideas || []).map((t) => <li key={t}>{t}</li>)}</ul>
      </Block>
      <div className="grid-2">
        <Block kicker="Social visual approach"><p>{m.social}</p></Block>
        <Block kicker="Cadence"><p>{m.cadence}</p></Block>
        <Block kicker="Email nurture"><p>{m.email}</p></Block>
        <Block kicker="Referral"><p>{m.referral}</p></Block>
        <Block kicker="Partnerships"><p>{m.partners}</p></Block>
        <Block kicker="PR / events"><p>{m.pr}</p></Block>
      </div>
      <Block kicker="Launch">
        <dl className="kv">
          <dt>Pre-launch</dt><dd>{m.launch?.pre}</dd>
          <dt>Launch day</dt><dd>{m.launch?.day}</dd>
          <dt>First 30 days</dt><dd>{m.launch?.thirty}</dd>
        </dl>
      </Block>
      <Block kicker="Success metrics">
        <ul>{(m.metrics || []).map((t) => <li key={t}>{t}</li>)}</ul>
      </Block>
    </div>
  )
}

function Roadmap({ a, setDeep }) {
  return (
    <div className="section">
      {(a.roadmap || []).map((ph, pi) => (
        <Block key={ph.phase} kicker={ph.phase} title={ph.title}>
          <div style={{ overflowX: 'auto' }}>
            <table className="roadmap">
              <thead>
                <tr>
                  <th>Task</th><th>Owner</th><th>Priority</th><th>Dependencies</th><th>Impact</th><th>Status</th><th>Due</th>
                </tr>
              </thead>
              <tbody>
                {(ph.items || []).map((it, ii) => (
                  <tr key={it.task}>
                    <td>{it.task}</td>
                    <td>
                      <select className="select" value={it.owner} onChange={(e) => setDeep((n) => { n.roadmap[pi].items[ii].owner = e.target.value })}>
                        {OWNERS.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="select" value={it.priority} onChange={(e) => setDeep((n) => { n.roadmap[pi].items[ii].priority = e.target.value })}>
                        {PRIORITIES.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>{it.deps}</td>
                    <td>{it.impact}</td>
                    <td>
                      <select className="select" value={it.status} onChange={(e) => setDeep((n) => { n.roadmap[pi].items[ii].status = e.target.value })}>
                        {['Not started', 'In progress', 'Blocked', 'Done'].map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>
                      <input className="inline-input" type="date" value={it.due || ''} onChange={(e) => setDeep((n) => { n.roadmap[pi].items[ii].due = e.target.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      ))}
    </div>
  )
}

function Proposal({ a }) {
  const p = a.proposal
  return (
    <div className="section">
      <div className="banner">
        <h4>Proposal frame</h4>
        <h2 className="display">{p.recommended}</h2>
      </div>
      <Block kicker="Includes">
        <ul>{(p.includes || []).map((d) => <li key={d}>{d}</li>)}</ul>
      </Block>
      <Block kicker="Outcomes">
        <ul>{(p.outcomes || []).map((d) => <li key={d}>{d}</li>)}</ul>
      </Block>
      <Block kicker="Scope watch">
        <ul>{(p.scopeWatch || []).map((d) => <li key={d}>{d}</li>)}</ul>
      </Block>
      <Block kicker="Recommended next step"><p>{p.nextStep}</p></Block>
      <Block kicker="Client-ready closing">
        <p>{a.closing}</p>
      </Block>
      <div className="banner warn">
        <p>{a.flags?.trademark}</p>
        <p>{a.flags?.noInventedProof}</p>
      </div>
    </div>
  )
}

function Notes({ record, onPatchNotes, onPatchMeta }) {
  const n = record.internalNotes || {}
  const set = (k) => (e) => onPatchNotes({ ...n, [k]: e.target.value })
  return (
    <div className="section notes-panel">
      <div className="banner alert">
        <h4>Private to Empyré</h4>
        <p>These notes do not appear in client HTML, PDF, email, or markdown exports unless you explicitly export the internal brief.</p>
      </div>
      <Block kicker="Creative director notes"><textarea value={n.cdNotes} onChange={set('cdNotes')} /></Block>
      <Block kicker="Risks"><textarea value={n.risks} onChange={set('risks')} /></Block>
      <Block kicker="Questions for the client"><textarea value={n.questions} onChange={set('questions')} /></Block>
      <Block kicker="Proposal notes"><textarea value={n.proposalNotes} onChange={set('proposalNotes')} /></Block>
      <Block kicker="Scope concerns"><textarea value={n.scopeConcerns} onChange={set('scopeConcerns')} /></Block>
      <Block kicker="Pricing notes"><textarea value={n.pricingNotes} onChange={set('pricingNotes')} /></Block>
      <Block kicker="Follow-up tasks"><textarea value={n.followUp} onChange={set('followUp')} /></Block>
      <Block kicker="Human review">
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--chrome)' }}>
          <input
            type="checkbox"
            checked={!!record.humanReviewed}
            onChange={(e) => onPatchMeta({ humanReviewed: e.target.checked, status: e.target.checked ? 'client-ready' : 'review' })}
          />
          Mark as reviewed by a creative director — required before treating exports as client-ready.
        </label>
      </Block>
    </div>
  )
}

function Export({ record, exportKind, onPatchMeta }) {
  const blocked = !record.humanReviewed
  return (
    <div className="section">
      {blocked && (
        <div className="banner alert">
          <h4>Human review gate</h4>
          <p>Client-facing exports should not go out until a creative director has reviewed this draft. You may still download internal files.</p>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => onPatchMeta({ humanReviewed: true, status: 'client-ready' })}>
            Mark reviewed
          </button>
        </div>
      )}
      <div className="export-grid">
        <button className="export-card" onClick={() => exportKind('html')}>
          <h3>Branded HTML report</h3>
          <p>Light editorial report for client presentation after review.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('pdf')}>
          <h3>Client PDF</h3>
          <p>Downloads a real PDF: [Client]-Empyre-Brand-Elevation-Assessment.pdf. Internal notes excluded.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('print')}>
          <h3>Print / Save as PDF</h3>
          <p>Opens the branded HTML report for browser print-to-PDF.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('markdown')}>
          <h3>Markdown summary</h3>
          <p>Client-safe markdown. Internal notes excluded.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('proposal')}>
          <h3>Proposal summary</h3>
          <p>Copyable engagement frame: tier, why, deliverables.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('email')}>
          <h3>Client email</h3>
          <p>A short Empyré-voiced note to send with the assessment.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('brief')}>
          <h3>Internal creative brief</h3>
          <p>Private. Includes CD notes, risks, and open questions.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('roadmap')}>
          <h3>90-day roadmap</h3>
          <p>Markdown table of owners, priorities, and impact.</p>
        </button>
        <button className="export-card" onClick={() => exportKind('json')}>
          <h3>JSON archive</h3>
          <p>Full project record for backup or duplication.</p>
        </button>
      </div>
    </div>
  )
}
