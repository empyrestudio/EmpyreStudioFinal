import { useState } from 'react'
import { useOs, nameOfClient } from '../lib/OsContext.jsx'
import { PROPOSAL_STATUS } from '../lib/os-constants.js'
import { TIER_LIST as TIERS } from '../lib/constants.js'
import { blankProposal } from '../lib/os.js'
import { Field, Input, Area, Select, Badge } from '../components/ui.jsx'
import { downloadPdf } from '../lib/pdf.js'

export function DirectionsView() {
  const { os } = useOs()
  const dirs = os.assessments.flatMap((a) => (a.assessment?.directions || []).map((d) => ({ ...d, client: a.client, rec: a.assessment?.recommended })))
  return (
    <div className="page">
      <div className="kicker">Strategy</div>
      <h1 className="display">Brand directions</h1>
      {!dirs.length && <div className="block"><p>Direction begins before design. Generate an assessment first.</p></div>}
      {dirs.map((d) => (
        <div className="block" key={d.id + nameOfClient(d.client)} style={{ marginBottom: 12 }}>
          <h4>{d.territory} · {nameOfClient(d.client)}</h4>
          <h3>{d.name}</h3>
          <p>{d.concept}</p>
          <p style={{ marginTop: 8 }}>{d.signal}</p>
        </div>
      ))}
    </div>
  )
}

export function MoodBoardsView() {
  const { os, patch } = useOs()
  const boards = os.assessments.flatMap((a) => (a.assessment?.moodboards || []).map((b) => ({ ...b, aid: a.id, client: a.client })))
  const [active, setActive] = useState(boards[0]?.id)
  const b = boards.find((x) => x.id === active) || boards[0]
  const saveBoard = (next) => {
    const rec = os.assessments.find((a) => a.id === next.aid)
    if (!rec?.assessment) return
    const moodboards = rec.assessment.moodboards.map((m) => (m.id === next.id ? next : m))
    patch('assessments', { ...rec, assessment: { ...rec.assessment, moodboards } })
  }
  return (
    <div className="page">
      <div className="kicker">Strategy</div>
      <h1 className="display">Mood boards</h1>
      <p className="lede">A visual world for each direction. Not a collage. Not finished art.</p>
      {!boards.length && <div className="block"><p>No mood boards yet. Direction begins before design. Build a visual world with intention — generate an assessment.</p></div>}
      <div className="chip-row">
        {boards.map((x) => (
          <button key={x.id} className={`btn small ${b?.id === x.id ? 'primary' : ''}`} onClick={() => setActive(x.id)}>{x.title}</button>
        ))}
      </div>
      {b && (
        <div>
          <div className="banner" style={{ margin: '18px 0' }}>
            <h4>{b.title} · {nameOfClient(b.client)}</h4>
            <p>{b.artDirection}</p>
            <p style={{ marginTop: 8 }}><strong>Feeling.</strong> {b.feeling}</p>
            <p><strong>Avoid.</strong> {b.avoid}</p>
            <p><strong>CD note.</strong> {b.cdNote}</p>
          </div>
          <div className="mood-grid">
            {(b.tiles || []).map((t, i) => (
              <MoodTile key={t.id} tile={t} onLock={() => {
                const tiles = b.tiles.map((x, j) => j === i ? { ...x, locked: !x.locked } : x)
                saveBoard({ ...b, tiles })
              }} onRemove={() => saveBoard({ ...b, tiles: b.tiles.filter((_, j) => j !== i) })} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MoodTile({ tile, onLock, onRemove }) {
  const pal = tile.hex
  return (
    <figure className={`mood-tile kind-${tile.kind}`}>
      <div className="mood-face" style={pal ? { background: pal } : undefined}>
        {tile.kind === 'type' && <span className="mood-spec">{tile.specimen || 'Aa'}</span>}
        {tile.kind === 'mark' && <span className="mood-mark" />}
        {tile.kind === 'layout' && <span className="mood-gridlines" />}
        {tile.kind === 'ui' && <span className="mood-ui">Inquire</span>}
        {tile.kind === 'motion' && <span className="mood-motion" />}
      </div>
      <figcaption>
        <strong>{tile.title}</strong>
        <p>{tile.caption}</p>
        <div className="chip-row">
          <button type="button" className="btn small" onClick={onLock}>{tile.locked ? 'Unlock' : 'Lock'}</button>
          <button type="button" className="btn small danger" onClick={onRemove}>Remove</button>
        </div>
      </figcaption>
    </figure>
  )
}

export function ProposalsView() {
  const { os, patch, drop } = useOs()
  const [open, setOpen] = useState(null)
  const p = os.proposals.find((x) => x.id === open)
  const clients = os.clients.map((c) => ({ id: c.id, label: nameOfClient(c) }))
  const set = (k) => (v) => patch('proposals', { ...p, [k]: v })
  const rec = p && os.assessments.find((a) => a.id === p.assessmentId || a.clientId === p.clientId)
  return (
    <div className="page">
      <div className="kicker">Strategy</div>
      <h1 className="display">Proposals + Reports</h1>
      <p className="lede">Turn strategy into a document your client can carry forward.</p>
      <button className="btn primary" onClick={() => { const n = blankProposal(); patch('proposals', n); setOpen(n.id) }}>New proposal</button>
      {!p && (
        <div className="library" style={{ marginTop: 16 }}>
          {os.proposals.map((x) => (
            <article className="card" key={x.id}>
              <div>
                <h3>{x.tier || 'Proposal'}</h3>
                <div className="meta"><Badge>{x.status}</Badge></div>
              </div>
              <button className="btn small" onClick={() => setOpen(x.id)}>Open</button>
            </article>
          ))}
          {!os.proposals.length && <div className="block"><p>No reports generated. Turn strategy into a document your client can carry forward.</p></div>}
        </div>
      )}
      {p && (
        <div style={{ marginTop: 16 }}>
          <button className="btn ghost small" onClick={() => setOpen(null)}>Back</button>
          <div className="grid-form">
            <Field label="Client"><Select value={p.clientId} onChange={set('clientId')} options={clients} /></Field>
            <Field label="Status"><Select value={p.status} onChange={set('status')} options={PROPOSAL_STATUS} /></Field>
            <Field label="Recommended tier"><Select value={p.tier} onChange={set('tier')} options={TIERS.map((t) => t.name)} /></Field>
            <Field label="Timeline"><Input value={p.timeline} onChange={set('timeline')} /></Field>
            <Field label="Scope" className="span-2"><Area value={p.scope} onChange={set('scope')} /></Field>
            <Field label="Deliverables" className="span-2"><Area value={p.deliverables} onChange={set('deliverables')} /></Field>
            <Field label="Assumptions"><Area value={p.assumptions} onChange={set('assumptions')} /></Field>
            <Field label="Exclusions"><Area value={p.exclusions} onChange={set('exclusions')} /></Field>
            <Field label="Internal pricing notes" className="span-2"><Area value={p.pricingNotes} onChange={set('pricingNotes')} /></Field>
            <Field label="Client-facing scope" className="span-2"><Area value={p.clientScope} onChange={set('clientScope')} /></Field>
          </div>
          <div className="chip-row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => {
              const a = os.assessments.find((x) => x.clientId === p.clientId) || os.assessments[0]
              if (!a?.assessment) return alert('Generate a brand assessment first.')
              if (!a.humanReviewed) {
                if (!confirm('Not marked as reviewed by Empyré Studio. Export anyway as internal draft?')) return
              }
              downloadPdf(a)
            }}>Download client PDF</button>
            <button className="btn danger" onClick={() => { drop('proposals', p.id); setOpen(null) }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}
