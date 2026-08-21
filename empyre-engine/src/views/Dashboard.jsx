import { useMemo, useState } from 'react'
import { STATUSES, TIER_LIST, STAGE_LABEL } from '../lib/constants.js'
import { fmtDate, nameOf } from '../lib/utils.js'
import { StatusBadge } from '../components/ui.jsx'
import Atmosphere from '../assets/Atmosphere.jsx'

export default function Dashboard({ items, onNew, onOpen, onDuplicate, onArchive, onDelete, onDemo }) {
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('')
  const [status, setStatus] = useState('')

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const name = nameOf(it.client).toLowerCase()
      if (q && !name.includes(q.toLowerCase()) && !(it.client?.industry || '').toLowerCase().includes(q.toLowerCase())) return false
      if (status && it.status !== status) return false
      if (tier && it.assessment?.tier?.id !== tier) return false
      return true
    })
  }, [items, q, tier, status])

  if (!items.length) {
    return (
      <div className="page" style={{ maxWidth: 'none', paddingTop: 28 }}>
        <div className="hero-empty">
          <Atmosphere className="atmosphere" />
          <div className="veil" />
          <div className="copy">
            <div className="kicker">Empyré Elevation Engine</div>
            <h1 className="display">No active elevation assessments.</h1>
            <p className="lede" style={{ color: '#d5dce4' }}>
              Begin with a client’s business reality. End with a brand built to rise.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn primary" onClick={onNew}>Create Brand Assessment</button>
              <button className="btn" onClick={onDemo}>View example assessment</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="kicker">Library</div>
      <h1 className="display">Elevation assessments</h1>
      <p className="lede">
        Client-agnostic working files. No live client is selected until you open or create one.
      </p>

      <div className="toolbar">
        <input className="search" placeholder="Search by brand or industry" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" style={{ width: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select className="select" style={{ width: 240 }} value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">All recommended tiers</option>
          {TIER_LIST.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button className="btn primary" onClick={onNew}>New Assessment</button>
        <button className="btn ghost" onClick={onDemo}>Load demo</button>
      </div>

      <div className="library">
        {filtered.map((it) => (
          <article className="card" key={it.id}>
            <div>
              <h3>{nameOf(it.client)}</h3>
              <div className="meta">
                <StatusBadge status={it.status} />
                {it.isDemo && <span className="badge warn">Demo</span>}
                {it.assessment?.tier?.name && <span className="badge gold">{it.assessment.tier.name}</span>}
                {it.humanReviewed && <span className="badge ok">CD reviewed</span>}
                {it.client?.industry && <span>{it.client.industry}</span>}
                {it.client?.stage && <span>{STAGE_LABEL[it.client.stage] || it.client.stage}</span>}
                <span>Edited {fmtDate(it.updatedAt)}</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn small" onClick={() => onOpen(it.id)}>Open</button>
              <button className="btn small ghost" onClick={() => onDuplicate(it.id)}>Duplicate</button>
              {it.status !== 'archived' && (
                <button className="btn small ghost" onClick={() => onArchive(it.id)}>Archive</button>
              )}
              <button className="btn small danger" onClick={() => onDelete(it.id)}>Delete</button>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="block">
            <p>No assessments match these filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
