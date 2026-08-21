import { useMemo, useState } from 'react'
import { useOs, nameOfClient } from '../lib/OsContext.jsx'
import { Field, Input, Area, Select, Badge } from '../components/ui.jsx'
import {
  PILLARS, EVIDENCE_STATUS, TOUCH_STATES, TOUCHPOINTS, INTERVENTIONS,
  DIAG_TYPES, PROJ_STAGES,
  statusFor, weighted, totalFrom, blankIndex, addHistory, runReader, sampleIndex,
} from '../lib/index-engine.js'
import { uid, nowIso } from '../lib/utils.js'
import { downloadIndexPdf } from '../lib/index-pdf.js'

const TABS = [
  { id: 'baseline', label: 'Baseline' },
  { id: 'plan', label: 'Elevation Plan' },
  { id: 'after', label: 'After' },
  { id: 'compare', label: 'Comparisons' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'reader', label: 'Standard Reader' },
  { id: 'history', label: 'History' },
  { id: 'export', label: 'Reports' },
]

export default function StandardIndexView({ startFrom }) {
  const { os, patch, drop } = useOs()
  const role = os.settings?.role || 'admin'
  const clientView = role === 'client'
  const canPublish = role === 'admin'
  const canEdit = role !== 'client'
  const [openId, setOpenId] = useState(null)
  const [step, setStep] = useState(0)
  const [tab, setTab] = useState('baseline')
  const rec = os.indexes?.find((x) => x.id === openId)
  const clients = os.clients.map((c) => ({ id: c.id, label: nameOfClient(c) }))
  const projects = os.projects.map((p) => ({ id: p.id, label: p.name || 'Project' }))
  const assessments = os.assessments.map((a) => ({ id: a.id, label: nameOfClient(a.client) }))

  const save = (next) => patch('indexes', next)
  const set = (k) => (v) => rec && canEdit && !rec.locked && save({ ...rec, [k]: v })

  const create = (prefill) => {
    const n = blankIndex(prefill || {})
    if (startFrom?.client) {
      const c = startFrom.client
      Object.assign(n, {
        clientId: c.id, brandName: c.businessName, industry: c.industry, website: c.website,
        location: c.location, contactName: c.contactName, contactEmail: c.email,
        offer: c.primaryOffer, audience: c.primaryAudience, desiredPerception: c.desiredPerception,
      })
    }
    save(n)
    setOpenId(n.id)
    setStep(1)
    setTab('baseline')
  }

  const list = os.indexes || []

  if (!rec) {
    return (
      <div className="page">
        <div className="kicker">The Standard Index</div>
        <h1 className="display">Brand Elevation Diagnostic</h1>
        <p className="lede">See the distance between where your brand appears today and the standard it is built to hold.</p>
        {canEdit && (
          <div className="chip-row">
            <button className="btn primary" onClick={() => create()}>New Brand Diagnostic</button>
            {!list.some((x) => x.isSample) && (
              <button className="btn" onClick={() => { const s = sampleIndex(); save(s); setOpenId(s.id) }}>Load demonstration</button>
            )}
          </div>
        )}
        <div className="library" style={{ marginTop: 16 }}>
          {list.map((x) => (
            <article className="card glass-2" key={x.id}>
              <div>
                <h3>{x.brandName || 'Untitled diagnostic'}</h3>
                <div className="meta">
                  <Badge tone="gold">{x.diagnosticType}</Badge>
                  <Badge>{x.reportStatus}</Badge>
                  {x.isSample && <Badge tone="warn">SAMPLE — fictional</Badge>}
                  {x.locked && <Badge>Locked</Badge>}
                  <span>Before {totalFrom(x.pillarsBefore)}</span>
                  {x.afterEnabled && <span>After {totalFrom(x.pillarsAfter)}</span>}
                </div>
              </div>
              <button className="btn small" onClick={() => { setOpenId(x.id); setStep(0); setTab('baseline') }}>Open</button>
            </article>
          ))}
          {!list.length && (
            <div className="block glass-2">
              <p>No diagnostics yet. A baseline is how the standard becomes visible — before the work, and after it.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step >= 1 && step <= 5 && canEdit && !rec.locked) {
    return (
      <Wizard rec={rec} step={step} setStep={setStep} set={set} save={save} clients={clients} projects={projects} assessments={assessments} os={os} onDone={() => setStep(0)} onBack={() => { setOpenId(null); setStep(0) }} />
    )
  }

  const before = totalFrom(rec.pillarsBefore)
  const after = totalFrom(rec.pillarsAfter)
  const beforeSt = statusFor(before)
  const afterSt = statusFor(after)

  return (
    <div className="page index-page">
      <button className="btn ghost small" onClick={() => { setOpenId(null); setStep(0) }}>All diagnostics</button>
      {rec.isSample && <div className="banner warn" style={{ marginTop: 12 }}><p>SAMPLE PROJECT — FOR DEMONSTRATION ONLY. Fictional restaurant. Not a real client.</p></div>}
      <header className="dossier glass-2" style={{ marginTop: 12 }}>
        <div>
          <p className="kicker">Empyré Standard Index</p>
          <h1 className="display" style={{ fontSize: 36 }}>{rec.brandName || 'Diagnostic'}</h1>
          <p className="lede">{rec.diagnosticType} · {rec.projectType} · {rec.reportStatus}</p>
        </div>
        <div className="score-pair">
          <ScoreDial score={before} label="Before" status={beforeSt.label} />
          {rec.afterEnabled && <ScoreDial score={after} label="After" status={afterSt.label} />}
        </div>
      </header>
      <div className="chip-row">
        {TABS.filter((t) => !(clientView && ['reader', 'history'].includes(t.id))).map((t) => (
          <button key={t.id} className={`btn small ${tab === t.id ? 'primary' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
        {canEdit && !rec.locked && <button className="btn small" onClick={() => setStep(1)}>Edit profile</button>}
      </div>
      {tab === 'baseline' && <Baseline rec={rec} set={set} canEdit={canEdit && !rec.locked} clientView={clientView} />}
      {tab === 'plan' && <Plan rec={rec} set={set} save={save} canEdit={canEdit && !rec.locked} os={os} clientView={clientView} />}
      {tab === 'after' && <After rec={rec} set={set} canEdit={canEdit && !rec.locked} clientView={clientView} before={before} after={after} />}
      {tab === 'compare' && <Compare rec={rec} save={save} canEdit={canEdit && !rec.locked} clientView={clientView} />}
      {tab === 'evidence' && <Evidence rec={rec} save={save} canEdit={canEdit && !rec.locked} clientView={clientView} />}
      {tab === 'reader' && canEdit && <Reader rec={rec} save={save} />}
      {tab === 'history' && canEdit && <History rec={rec} />}
      {tab === 'export' && <Export rec={rec} save={save} canPublish={canPublish} clientView={clientView} />}
    </div>
  )
}

function ScoreDial({ score, label, status }) {
  return (
    <div className="score-dial glass-3" role="img" aria-label={`${label} Standard Index ${score} of 100, ${status}`}>
      <span className="score-k">{label}</span>
      <strong>{score}</strong>
      <span>/ 100</span>
      <em>{status}</em>
    </div>
  )
}

function PillarTable({ pillars, onChange, canEdit, clientView }) {
  const total = totalFrom(pillars)
  return (
    <div className="table-wrap">
      <table className="roadmap">
        <thead><tr><th>Pillar</th><th>Raw 1–10</th><th>Weight</th><th>Weighted</th>{!clientView && <th>Evidence</th>}</tr></thead>
        <tbody>
          {PILLARS.map((p) => {
            const row = pillars[p.id] || { raw: 1 }
            return (
              <tr key={p.id}>
                <th>{p.name}</th>
                <td>
                  {canEdit ? (
                    <input className="inline-input" type="number" min="1" max="10" value={row.raw}
                      onChange={(e) => onChange(p.id, { ...row, raw: Number(e.target.value), override: e.target.value, overrideReason: row.overrideReason || 'Manual adjustment' })} />
                  ) : row.raw}
                </td>
                <td>{p.weight}</td>
                <td className="num">{weighted(row.raw, p.weight)}</td>
                {!clientView && <td>{row.status || 'Expert inference'}</td>}
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="lede" style={{ marginTop: 8 }}>Total {total} / 100 · {statusFor(total).label}. Expert brand-system assessment, not a performance prediction.</p>
      {!clientView && <p className="hint">Formula: each raw score (1–10) × (pillar weight ÷ 10), summed. Internal view only.</p>}
    </div>
  )
}

function Wizard({ rec, step, setStep, set, save, clients, projects, assessments, os, onDone, onBack }) {
  return (
    <div className="page">
      <button className="btn ghost small" onClick={onBack}>Cancel</button>
      <p className="kicker">New Brand Diagnostic · Step 0{step} of 05</p>
      <h1 className="display">The Standard Index</h1>
      {step === 1 && (
        <div className="grid-form">
          <Field label="Connect client"><Select value={rec.clientId} onChange={(v) => {
            const c = os.clients.find((x) => x.id === v)
            save({ ...rec, clientId: v, brandName: rec.brandName || c?.businessName || '', industry: rec.industry || c?.industry || '', website: rec.website || c?.website || '' })
          }} options={clients} /></Field>
          <Field label="Brand name"><Input value={rec.brandName} onChange={set('brandName')} /></Field>
          <Field label="Industry"><Input value={rec.industry} onChange={set('industry')} /></Field>
          <Field label="Website URL"><Input value={rec.website} onChange={set('website')} /></Field>
          <Field label="Location / service area"><Input value={rec.location} onChange={set('location')} /></Field>
          <Field label="Project status"><Select value={rec.projectStatus} onChange={set('projectStatus')} options={PROJ_STAGES} /></Field>
          <Field label="Project type"><Select value={rec.projectType} onChange={set('projectType')} options={['Brand Clarity Sprint', 'Identity Transformation', 'Signature Launch Suite', 'Brand Stewardship', 'Custom']} /></Field>
          <Field label="Diagnostic type"><Select value={rec.diagnosticType} onChange={set('diagnosticType')} options={DIAG_TYPES} /></Field>
          <Field label="Diagnostic date"><Input type="date" value={rec.diagnosticDate} onChange={set('diagnosticDate')} /></Field>
          <Field label="Primary contact"><Input value={rec.contactName} onChange={set('contactName')} /></Field>
          <Field label="Contact email"><Input value={rec.contactEmail} onChange={set('contactEmail')} /></Field>
          <Field label="Connect project"><Select value={rec.projectId} onChange={set('projectId')} options={projects} /></Field>
          <Field label="Connect assessment"><Select value={rec.assessmentId} onChange={set('assessmentId')} options={assessments} /></Field>
        </div>
      )}
      {step === 2 && (
        <div className="grid-form">
          <Field label="What does the business sell?" className="span-2"><Area value={rec.offer} onChange={set('offer')} /></Field>
          <Field label="Ideal customer"><Area value={rec.audience} onChange={set('audience')} /></Field>
          <Field label="Problem solved"><Area value={rec.problem} onChange={set('problem')} /></Field>
          <Field label="Differentiation"><Area value={rec.differentiation} onChange={set('differentiation')} /></Field>
          <Field label="Primary conversion goal"><Input value={rec.conversion} onChange={set('conversion')} /></Field>
          <Field label="Desired market perception"><Area value={rec.desiredPerception} onChange={set('desiredPerception')} /></Field>
          <Field label="Competitors"><Area value={rec.competitors} onChange={set('competitors')} /></Field>
          <Field label="Obstacles"><Area value={rec.obstacles} onChange={set('obstacles')} /></Field>
        </div>
      )}
      {step === 3 && (
        <div className="grid-form">
          <Field label="Desired brand attributes" className="span-2"><Area value={rec.attributes} onChange={set('attributes')} /></Field>
          <Field label="Attributes to avoid" className="span-2"><Area value={rec.avoid} onChange={set('avoid')} /></Field>
          <Field label="Desired voice / tone"><Area value={rec.voice} onChange={set('voice')} /></Field>
          <Field label="Desired emotional response"><Area value={rec.emotion} onChange={set('emotion')} /></Field>
          <Field label="Brand promise"><Area value={rec.promise} onChange={set('promise')} /></Field>
          <Field label="Existing tagline"><Input value={rec.taglineNow} onChange={set('taglineNow')} /></Field>
          <Field label="Guidelines available?"><Select value={rec.hasGuidelines} onChange={set('hasGuidelines')} options={['Yes', 'No']} /></Field>
          <Field label="Assets available?"><Select value={rec.hasAssets} onChange={set('hasAssets')} options={['Yes', 'No']} /></Field>
          <Field label="Existing logo status"><Input value={rec.logoStatus} onChange={set('logoStatus')} /></Field>
          <Field label="Existing website status"><Input value={rec.websiteStatus} onChange={set('websiteStatus')} /></Field>
        </div>
      )}
      {step === 4 && (
        <div>
          <p className="lede">Link files from the library later, or add evidence titles now. Do not invent screenshots.</p>
          <button className="btn" onClick={() => save({ ...rec, evidence: [{ id: uid(), title: '', type: 'Website screenshot', source: '', date: nowIso().slice(0, 10), by: 'Empyré', touch: 'Website', pillar: 'digital', status: 'Observed', clientVisible: true, caption: '', annotation: '', confidence: 'Medium', verify: '', internalOnly: false }, ...(rec.evidence || [])] })}>Add evidence row</button>
          {(rec.evidence || []).map((e) => (
            <div className="block" key={e.id} style={{ marginTop: 10 }}>
              <div className="grid-form">
                <Field label="Title"><Input value={e.title} onChange={(v) => save({ ...rec, evidence: rec.evidence.map((x) => x.id === e.id ? { ...x, title: v } : x) })} /></Field>
                <Field label="Type"><Input value={e.type} onChange={(v) => save({ ...rec, evidence: rec.evidence.map((x) => x.id === e.id ? { ...x, type: v } : x) })} /></Field>
                <Field label="Status"><Select value={e.status} onChange={(v) => save({ ...rec, evidence: rec.evidence.map((x) => x.id === e.id ? { ...x, status: v } : x) })} options={EVIDENCE_STATUS} /></Field>
                <Field label="Caption" className="span-2"><Input value={e.caption} onChange={(v) => save({ ...rec, evidence: rec.evidence.map((x) => x.id === e.id ? { ...x, caption: v } : x) })} /></Field>
              </div>
            </div>
          ))}
        </div>
      )}
      {step === 5 && (
        <div>
          <p className="lede">Select interventions. Connected project deliverables are suggested when present.</p>
          <div className="word-list">
            {INTERVENTIONS.map((name) => {
              const on = (rec.interventions || []).includes(name)
              return (
                <button key={name} className={`word ${on ? '' : 'avoid'}`} type="button"
                  onClick={() => {
                    const next = on ? rec.interventions.filter((x) => x !== name) : [...(rec.interventions || []), name]
                    save({ ...rec, interventions: next })
                  }}>{name}</button>
              )
            })}
          </div>
        </div>
      )}
      <div className="form-actions">
        <button className="btn" onClick={() => setStep(Math.max(1, step - 1))}>Back</button>
        {step < 5 && <button className="btn primary" onClick={() => setStep(step + 1)}>Continue</button>}
        {step === 5 && <button className="btn primary" onClick={onDone}>Open diagnostic</button>}
      </div>
    </div>
  )
}

function Baseline({ rec, set, canEdit, clientView }) {
  return (
    <div className="section" style={{ marginTop: 18 }}>
      <div className="banner glass-2">
        <p>Empyré Studio’s structured expert assessment, based on provided evidence, observable touchpoints, strategic alignment, and documented project outcomes. Not a guarantee of revenue, rankings, or sentiment.</p>
      </div>
      <h3 className="display">Perception gap</h3>
      <div className="grid-2">
        <div className="block glass-2"><h4>Desired</h4>{canEdit ? <Area value={rec.perceptionDesired} onChange={set('perceptionDesired')} /> : <p>{rec.perceptionDesired}</p>}</div>
        <div className="block glass-2"><h4>Observed</h4>{canEdit ? <Area value={rec.perceptionObserved} onChange={set('perceptionObserved')} /> : <p>{rec.perceptionObserved}</p>}</div>
      </div>
      <div className="block glass-2"><h4>Gap</h4>{canEdit ? <Area value={rec.perceptionGap} onChange={set('perceptionGap')} /> : <p>{rec.perceptionGap}</p>}</div>
      <h3 className="display">Before score</h3>
      <PillarTable pillars={rec.pillarsBefore} canEdit={canEdit} clientView={clientView}
        onChange={(id, row) => set('pillarsBefore')({ ...rec.pillarsBefore, [id]: row })} />
      <h3 className="display">Strengths to keep</h3>
      {(rec.strengths || []).map((s) => (
        <div className="block" key={s.id}><strong>{s.title}</strong><p>{s.evidence} — {s.why}</p></div>
      ))}
      <h3 className="display">Critical gaps</h3>
      {(rec.gaps || []).map((g) => (
        <div className="block" key={g.id}>
          <div className="meta"><Badge tone={g.severity === 'Critical' ? 'danger' : 'gold'}>{g.severity}</Badge><span>{g.category}</span></div>
          <p>{g.finding}</p>
          <p className="lede">{g.evidence} · {g.consequence}</p>
        </div>
      ))}
      <h3 className="display">Touchpoint inventory</h3>
      <div className="touch-grid">
        {TOUCHPOINTS.map((t) => (
          <div className="block" key={t}>
            <h4>{t}</h4>
            {canEdit ? (
              <Select value={rec.touchpoints?.[t]?.state || 'Not assessed'} options={TOUCH_STATES}
                onChange={(v) => set('touchpoints')({ ...rec.touchpoints, [t]: { ...(rec.touchpoints?.[t] || {}), state: v } })} />
            ) : <p>{rec.touchpoints?.[t]?.state || 'Not assessed'}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function Plan({ rec, os, clientView }) {
  const dels = os.deliverables.filter((d) => !rec.projectId || d.projectId === rec.projectId)
  return (
    <div className="section" style={{ marginTop: 18 }}>
      <p className="lede">CURRENT REALITY → EMPYRÉ INTERVENTION → ELEVATED OUTCOME</p>
      {(rec.interventions || []).map((name) => (
        <div className="block glass-2" key={name} style={{ marginBottom: 10 }}>
          <h4>{name}</h4>
          <p>Intervention in the {rec.projectType} engagement. Cause and effect should be evidenced, not assumed.</p>
        </div>
      ))}
      {!clientView && (
        <>
          <h3 className="display">Connected deliverables</h3>
          {dels.map((d) => <div className="meta" key={d.id}><Badge>{d.status}</Badge> {d.name}</div>)}
          {!dels.length && <p className="lede">No deliverables linked yet. Load them from the project.</p>}
        </>
      )}
    </div>
  )
}

function After({ rec, set, canEdit, clientView, before, after }) {
  if (!rec.afterEnabled && canEdit) {
    return (
      <div className="block" style={{ marginTop: 18 }}>
        <p>After reading is off until there is changed evidence — new identity, site, guidelines, or launch.</p>
        <button className="btn" onClick={() => set('afterEnabled')(true)}>Enable post-elevation reading</button>
      </div>
    )
  }
  if (!rec.afterEnabled) return <p className="lede">Post-elevation reading is not published yet.</p>
  const move = after - before
  return (
    <div className="section" style={{ marginTop: 18 }}>
      <p className="lede">Movement: {move > 0 ? '+' : ''}{move} points. Every change must be explained by changed evidence, never automatic.</p>
      <PillarTable pillars={rec.pillarsAfter} canEdit={canEdit} clientView={clientView}
        onChange={(id, row) => set('pillarsAfter')({ ...rec.pillarsAfter, [id]: row })} />
      <div className="block glass-2">
        <h4>Brand standard achieved</h4>
        {canEdit ? <Area value={rec.afterNarrative} onChange={set('afterNarrative')} /> : <p>{rec.afterNarrative}</p>}
      </div>
      <div className="block">
        <h4>Remaining opportunities</h4>
        {canEdit ? <Area value={rec.remaining} onChange={set('remaining')} /> : <p>{rec.remaining}</p>}
      </div>
      <div className="block glass-2">
        <h4>Client-ready closing</h4>
        {canEdit ? <Area value={rec.closing} onChange={set('closing')} /> : <p>{rec.closing}</p>}
      </div>
    </div>
  )
}

function Compare({ rec, save, canEdit, clientView }) {
  const rows = (rec.comparisons || []).filter((c) => !clientView || c.clientVisible)
  return (
    <div style={{ marginTop: 18 }}>
      <p className="lede">Before vs after · Website A vs B · Current vs desired · Category conventions. No unsupported rankings.</p>
      {canEdit && <button className="btn" onClick={() => save({ ...rec, comparisons: [{ id: uid(), mode: 'before-after', touch: 'Website', beforeNote: '', afterNote: '', pillar: 'digital', clientVisible: true, reason: '' }, ...rows] })}>Add comparison</button>}
      {rows.map((c) => (
        <div className="grid-2" key={c.id} style={{ marginTop: 12 }}>
          <div className="block"><h4>Before · {c.touch}</h4>{canEdit ? <Area value={c.beforeNote} onChange={(v) => save({ ...rec, comparisons: rec.comparisons.map((x) => x.id === c.id ? { ...x, beforeNote: v } : x) })} /> : <p>{c.beforeNote}</p>}</div>
          <div className="block"><h4>After</h4>{canEdit ? <Area value={c.afterNote} onChange={(v) => save({ ...rec, comparisons: rec.comparisons.map((x) => x.id === c.id ? { ...x, afterNote: v } : x) })} /> : <p>{c.afterNote}</p>}</div>
        </div>
      ))}
    </div>
  )
}

function Evidence({ rec, save, canEdit, clientView }) {
  const rows = (rec.evidence || []).filter((e) => !clientView || (e.clientVisible && !e.internalOnly))
  return (
    <div style={{ marginTop: 18 }}>
      {rows.map((e) => (
        <div className="block" key={e.id}>
          <div className="meta"><Badge>{e.status}</Badge><span>{e.type}</span><span>{e.touch}</span></div>
          <h4>{e.title || 'Untitled evidence'}</h4>
          <p>{e.caption}</p>
          <p className="lede">{e.annotation}</p>
        </div>
      ))}
      {canEdit && <button className="btn" onClick={() => save({ ...rec, evidence: [{ id: uid(), title: 'New evidence', type: 'Note', source: '', date: nowIso().slice(0, 10), by: 'Empyré', touch: 'Brand assets', pillar: 'strategic', status: 'Client-reported', clientVisible: false, caption: '', annotation: '', confidence: 'Low', verify: '', internalOnly: true }, ...(rec.evidence || [])] })}>Add evidence</button>}
      {!rows.length && <p className="lede">No client-visible evidence yet. Do not invent files.</p>}
    </div>
  )
}

function Reader({ rec, save }) {
  const [out, setOut] = useState(null)
  return (
    <div style={{ marginTop: 18 }}>
      <p className="lede">The Standard Reader drafts from this record. It asks when confidence would be low. It does not replace Empyré.</p>
      <button className="btn primary" onClick={() => setOut(runReader(rec))}>Ask the Standard Reader</button>
      {out && (
        <div className="section" style={{ marginTop: 16 }}>
          {out.missing.length > 0 && <div className="banner warn"><h4>Missing for a higher-confidence reading</h4><p>{out.missing.join('; ')}</p></div>}
          <p>Suggested next phase: {out.nextTier}. {out.note}</p>
          {out.findings.map((f) => (
            <div className="block glass-2" key={f.id}>
              <h4>{f.finding}</h4>
              <p>{f.implication}</p>
              <p className="lede">{f.action} · {f.confidence} · {f.status}</p>
            </div>
          ))}
          <button className="btn" onClick={() => save(addHistory({
            ...rec,
            strengths: out.strengths,
            gaps: out.gaps,
            perceptionDesired: out.perception.desired,
            perceptionObserved: out.perception.observed,
            perceptionGap: out.perception.gap,
            readerNotes: out.findings,
          }, 'Standard Reader draft applied — requires Empyré review'))}>Apply draft (still editable)</button>
        </div>
      )}
    </div>
  )
}

function History({ rec }) {
  return (
    <ul className="timeline" style={{ marginTop: 18 }}>
      {(rec.history || []).map((h) => <li key={h.id}><span>{h.at?.slice(0, 10)}</span>{h.user}: {h.summary}</li>)}
    </ul>
  )
}

function Export({ rec, save, canPublish, clientView }) {
  return (
    <div className="export-grid" style={{ marginTop: 18 }}>
      <button className="export-card glass-2" onClick={() => downloadIndexPdf(rec, 'exec')}>
        <h3>Executive Brand Reading</h3>
        <p>Concise client-facing PDF. No internal notes.</p>
      </button>
      <button className="export-card glass-2" onClick={() => downloadIndexPdf(rec, 'full')}>
        <h3>Before-and-After Report</h3>
        <p>Baseline, plan, after, movement. Client-facing.</p>
      </button>
      {!clientView && (
        <button className="export-card glass-2" onClick={() => downloadIndexPdf(rec, 'internal')}>
          <h3>Internal working report</h3>
          <p>Risks, upsell, unverified assumptions. Never for the portal.</p>
        </button>
      )}
      {canPublish && (
        <button className="export-card" onClick={() => {
          if (!confirm('Mark reviewed and approved by Empyré Studio?')) return
          save(addHistory({ ...rec, reviewed: true, reportStatus: 'Client-ready', locked: true }, 'Report locked for client'))
        }}>
          <h3>Lock client report</h3>
          <p>Requires human review. Locks scores and narrative.</p>
        </button>
      )}
    </div>
  )
}
