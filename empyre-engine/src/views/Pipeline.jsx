import { useEffect, useMemo, useRef, useState } from 'react'
import { useOs } from '../lib/OsContext.jsx'
import { PIPELINE } from '../lib/os-constants.js'
import { TIER_LIST, INDUSTRIES } from '../lib/constants.js'
import { blankLead, blankClient, blankFollowup, blankTask, logEvent, todayStr, daysSince } from '../lib/os.js'
import { Badge, Select } from '../components/ui.jsx'
import { fmtDate, nowIso } from '../lib/utils.js'

const STAGES = PIPELINE
const ACTIVE = STAGES.filter((s) => !['lost', 'archived'].includes(s.id))
const VIEWS = ['board', 'list', 'table', 'timeline']
const SAVED = [
  { id: 'active', label: 'All active leads' },
  { id: 'follow', label: 'Needs follow-up' },
  { id: 'proposal', label: 'Proposal sent' },
  { id: 'value', label: 'High-value opportunities' },
  { id: 'discovery', label: 'Discovery this week' },
  { id: 'waiting', label: 'Waiting on client' },
  { id: 'won', label: 'Won' },
  { id: 'nurture', label: 'Nurture' },
  { id: 'lost', label: 'Lost / archived' },
]

function nm(l) {
  return (l.businessName || l.leadName || l.contactName || 'Untitled lead').trim()
}
function initials(l) {
  const n = (l.owner || 'Empyré').trim()
  return n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
function followOf(l, today) {
  if (!l.nextFollowUp) return { id: 'none', label: 'No follow-up scheduled', tone: '' }
  if (l.nextFollowUp < today) return { id: 'overdue', label: 'Overdue', tone: 'danger' }
  if (l.nextFollowUp === today) return { id: 'today', label: 'Due today', tone: 'gold' }
  return { id: 'upcoming', label: 'Upcoming', tone: 'ok' }
}
function nextAction(l) {
  if (l.nextAction) return l.nextAction
  const map = {
    inquiry: 'Follow up within one business day',
    qualified: 'Complete client intake',
    'discovery-scheduled': 'Prepare discovery agenda',
    'discovery-complete': 'Create assessment and proposal task',
    'proposal-prep': 'Finish proposal for internal review',
    'proposal-sent': 'Schedule a follow-up',
    'follow-up': 'Make contact; log the outcome',
    'verbal-yes': 'Issue contract / deposit request',
    contract: 'Confirm contract and deposit',
    won: 'Create client, project, and kickoff',
    nurture: 'Set a recurring check-in',
    lost: 'Record the reason, then archive',
    archived: '—',
  }
  return map[l.status] || 'Review the relationship'
}
function suggestAfterMove(status) {
  return nextAction({ status })
}

export function PipelineView({ onOpenLead, go }) {
  const { os, patch, setSettings } = useOs()
  const today = todayStr()
  const pref = os.settings?.pipelineMode || 'board'
  const [mode, setMode] = useState(pref)
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({})
  const [saved, setSaved] = useState('active')
  const [drawer, setDrawer] = useState(null)
  const [menu, setMenu] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [mobileStage, setMobileStage] = useState('inquiry')
  const [selected, setSelected] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [suggest, setSuggest] = useState(null)
  const drawerRef = useRef(null)

  const setModePersist = (m) => {
    setMode(m)
    setSettings({ pipelineMode: m })
  }

  const leads = os.leads || []
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (saved === 'active' && ['lost', 'archived'].includes(l.status)) return false
      if (saved === 'lost' && !['lost', 'archived'].includes(l.status) && l.retention !== 'Archived') return false
      if (saved === 'follow' && !(l.nextFollowUp && l.nextFollowUp <= today)) return false
      if (saved === 'proposal' && l.status !== 'proposal-sent') return false
      if (saved === 'value' && !(Number(String(l.estimatedValue).replace(/[^0-9.]/g, '')) >= 15000 || (l.budget || '').includes('$30k') || (l.budget || '').includes('$60k'))) return false
      if (saved === 'discovery' && !['discovery-scheduled', 'discovery-complete'].includes(l.status)) return false
      if (saved === 'waiting' && !['proposal-sent', 'contract', 'follow-up'].includes(l.status)) return false
      if (saved === 'won' && l.status !== 'won') return false
      if (saved === 'nurture' && l.status !== 'nurture') return false
      if (q) {
        const blob = `${l.businessName} ${l.leadName} ${l.contactName} ${l.industry} ${l.email}`.toLowerCase()
        if (!blob.includes(q.toLowerCase())) return false
      }
      if (filters.stage && l.status !== filters.stage) return false
      if (filters.tier && l.recommendedTier !== filters.tier && l.desiredService !== filters.tier) return false
      if (filters.owner && l.owner !== filters.owner) return false
      if (filters.priority && (l.priority || 'Medium') !== filters.priority) return false
      if (filters.health && (l.health || 'Stable') !== filters.health) return false
      if (filters.industry && l.industry !== filters.industry) return false
      if (filters.source && l.referralSource !== filters.source && l.inquirySource !== filters.source) return false
      return true
    })
  }, [leads, q, filters, saved, today])

  const active = leads.filter((l) => !['lost', 'archived'].includes(l.status) && l.retention !== 'Archived')
  const followDue = active.filter((l) => l.nextFollowUp && l.nextFollowUp <= today)
  const proposals = active.filter((l) => l.status === 'proposal-sent')
  const contracts = active.filter((l) => l.status === 'contract')
  const wonMonth = leads.filter((l) => l.status === 'won' && (l.updatedAt || '').slice(0, 7) === today.slice(0, 7))
  const idle = active.filter((l) => daysSince(l.lastContact || l.updatedAt) >= 7)
  const high = active.filter((l) => (l.priority || '') === 'Critical' || l.priority === 'High')

  const attention = []
  followDue.filter((l) => l.nextFollowUp < today).forEach((l) => attention.push({ lead: l, issue: 'Follow-up overdue', due: l.nextFollowUp, action: 'Log contact', tone: 'ember' }))
  proposals.forEach((l) => attention.push({ lead: l, issue: 'Proposal awaiting response', due: l.nextFollowUp, action: 'Follow up', tone: 'amber' }))
  contracts.forEach((l) => attention.push({ lead: l, issue: 'Contract / deposit pending', due: l.nextFollowUp, action: 'Check status', tone: 'wait' }))
  idle.forEach((l) => attention.push({ lead: l, issue: 'Inactive 7+ days', due: '', action: 'Re-open the thread', tone: 'wait' }))
  high.filter((l) => !l.nextFollowUp).forEach((l) => attention.push({ lead: l, issue: 'High priority · no follow-up', due: '', action: 'Schedule follow-up', tone: 'ember' }))

  const move = (l, status) => {
    const label = STAGES.find((s) => s.id === status)?.label || status
    const events = [{ at: nowIso(), title: `Stage → ${label}`, by: os.settings?.ownerName || 'Empyré' }, ...(l.events || [])]
    patch('leads', { ...l, status, events, nextAction: suggestAfterMove(status) })
    setSuggest({ lead: { ...l, status }, text: suggestAfterMove(status) })
    setMenu(null)
  }

  const convert = (l) => {
    const c = {
      ...blankClient(),
      businessName: l.businessName,
      email: l.email,
      phone: l.phone,
      website: l.website,
      industry: l.industry,
      contactName: l.contactName,
      location: l.location,
      socials: l.socials,
      referralSource: l.referralSource,
      clientSince: todayStr(),
    }
    patch('clients', logEvent(c, 'Converted from lead'))
    move({ ...l, status: l.status }, 'won')
    patch('leads', { ...l, status: 'won', events: [{ at: nowIso(), title: 'Converted to client' }, ...(l.events || [])] })
    if (go) go('clients')
  }

  const addFollow = (l) => {
    patch('followups', { ...blankFollowup(), leadId: l.id, title: `Follow up: ${nm(l)}`, due: todayStr() })
    patch('leads', { ...l, nextFollowUp: l.nextFollowUp || todayStr(), lastContact: todayStr() })
  }

  useEffect(() => {
    if (!drawer) return
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawer(null)
    }
    window.addEventListener('keydown', onKey)
    drawerRef.current?.querySelector('button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer])

  const newLead = () => {
    const l = blankLead()
    patch('leads', l)
    setDrawer(l.id)
  }

  const bulkMove = (status) => {
    Object.keys(selected).filter((id) => selected[id]).forEach((id) => {
      const l = leads.find((x) => x.id === id)
      if (l) move(l, status)
    })
    setSelected({})
  }

  const openFull = (id) => {
    if (onOpenLead) onOpenLead(id)
  }

  return (
    <div className="page pipe-page" style={{ maxWidth: 'none' }}>
      <section className="pipe-head glass-3">
        <div>
          <p className="kicker">CRM</p>
          <h1 className="display">CRM Pipeline</h1>
          <p className="lede">Track each relationship from first inquiry to elevation.</p>
        </div>
        <div className="pipe-metrics" aria-label="Pipeline summary">
          <span><b>{active.length}</b> active</span>
          <span><b>{followDue.length}</b> follow-up</span>
          <span><b>{proposals.length}</b> proposals waiting</span>
          <span><b>{contracts.length}</b> contract / deposit</span>
          <span><b>{wonMonth.length}</b> won this month</span>
        </div>
        <div className="chip-row">
          <button className="btn primary" onClick={newLead}>New Lead</button>
          <button className="btn" onClick={() => go && go('intake')}>Create assessment</button>
          <button className="btn" onClick={() => setShowFilters((v) => !v)}>Filter</button>
          <label className="btn">
            Import lead
            <input type="file" accept=".json,.csv,text/plain" hidden onChange={() => alert('Paste or map a lead in the New Lead form. CSV import can be added in Version 2.')} />
          </label>
        </div>
      </section>

      {attention.length > 0 && (
        <section className="attn-strip" aria-label="Attention required">
          <h2 className="attn-title">Attention required</h2>
          <div className="attn-row">
            {attention.slice(0, 8).map((a, i) => (
              <article className={`attn-item tone-${a.tone}`} key={i}>
                <button type="button" className="attn-name" onClick={() => setDrawer(a.lead.id)}>{nm(a.lead)}</button>
                <span className="attn-issue">{a.issue}</span>
                <span className="attn-due">{a.due ? fmtDate(a.due) : '—'}</span>
                <button type="button" className="btn small" onClick={() => { setDrawer(a.lead.id) }}>{a.action}</button>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="pipe-toolbar glass-1">
        <input className="search" placeholder="Search leads" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
        <div className="seg" role="tablist" aria-label="Pipeline view">
          {VIEWS.map((v) => (
            <button key={v} role="tab" aria-selected={mode === v} className={mode === v ? 'on' : ''} onClick={() => setModePersist(v)}>{v}</button>
          ))}
        </div>
        <select className="select" style={{ width: 200 }} value={saved} onChange={(e) => setSaved(e.target.value)} aria-label="Saved view">
          {SAVED.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {showFilters && (
        <div className="pipe-filters glass-2">
          <Select value={filters.stage || ''} onChange={(v) => setFilters({ ...filters, stage: v })} options={STAGES} placeholder="Stage" />
          <Select value={filters.tier || ''} onChange={(v) => setFilters({ ...filters, tier: v })} options={TIER_LIST.map((t) => t.name)} placeholder="Tier" />
          <Select value={filters.priority || ''} onChange={(v) => setFilters({ ...filters, priority: v })} options={['Critical', 'High', 'Medium', 'Low']} placeholder="Priority" />
          <Select value={filters.health || ''} onChange={(v) => setFilters({ ...filters, health: v })} options={['Strong', 'Stable', 'Needs attention', 'At risk']} placeholder="Health" />
          <Select value={filters.industry || ''} onChange={(v) => setFilters({ ...filters, industry: v })} options={INDUSTRIES} placeholder="Industry" />
          <button className="btn small" onClick={() => setFilters({})}>Clear filters</button>
        </div>
      )}

      <aside className="pipe-signals glass-2" aria-label="Pipeline signals">
        <h3>Pipeline signals</h3>
        <ul>
          <li>Follow-up recommended · {followDue.length}</li>
          <li>Inactive lead · {idle.length}</li>
          <li>Proposal awaiting response · {proposals.length}</li>
          <li>High-priority opportunities · {high.length}</li>
          <li>Needs human review · do not invent close probability</li>
        </ul>
      </aside>

      {mode === 'board' && (
        <Board
          filtered={filtered}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileStage={mobileStage}
          setMobileStage={setMobileStage}
          onOpen={setDrawer}
          onMenu={setMenu}
          menu={menu}
          move={move}
          newLead={newLead}
        />
      )}
      {(mode === 'list' || mode === 'table') && (
        <LeadTable
          dense={mode === 'list'}
          rows={filtered}
          selected={selected}
          setSelected={setSelected}
          onOpen={setDrawer}
          move={move}
          bulkMove={bulkMove}
        />
      )}
      {mode === 'timeline' && <Timeline rows={filtered} onOpen={setDrawer} />}

      {menu && (
        <CardMenu
          lead={leads.find((l) => l.id === menu)}
          onClose={() => setMenu(null)}
          move={move}
          convert={convert}
          addFollow={addFollow}
          openFull={openFull}
          go={go}
          patch={patch}
        />
      )}

      {drawer && (
        <Drawer
          refEl={drawerRef}
          lead={leads.find((l) => l.id === drawer)}
          os={os}
          onClose={() => setDrawer(null)}
          move={move}
          convert={convert}
          addFollow={addFollow}
          openFull={openFull}
          go={go}
          patch={patch}
        />
      )}

      {suggest && (
        <div className="banner glass-2" style={{ marginTop: 16 }}>
          <h4>Suggested next step</h4>
          <p>{suggest.text} — editable and dismissible. No message is sent.</p>
          <div className="chip-row">
            <button className="btn small" onClick={() => { patch('tasks', blankTask({ title: suggest.text, clientId: '', tags: 'pipeline' })); addFollow(suggest.lead); setSuggest(null) }}>Create task</button>
            <button className="btn small ghost" onClick={() => setSuggest(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Board({ filtered, collapsed, setCollapsed, mobileStage, setMobileStage, onOpen, onMenu, move, newLead }) {
  const onDrop = (e, status) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/lead-id')
    const l = filtered.find((x) => x.id === id)
    if (l && l.status !== status) move(l, status)
  }
  return (
    <>
      <div className="pipe-mobile">
        <label>
          Stage
          <select className="select" value={mobileStage} onChange={(e) => setMobileStage(e.target.value)}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <div className="pipe-board" role="list">
        {STAGES.map((col) => {
          const items = filtered.filter((l) => l.status === col.id)
          const hideDesktop = collapsed[col.id]
          return (
            <section
              key={col.id}
              className={`pipe-col ${hideDesktop ? 'is-collapsed' : ''} ${col.id === mobileStage ? 'is-mobile-on' : ''}`}
              aria-label={col.label}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.id)}
              data-stage={col.id}
            >
              <header className="pipe-col-head">
                <h3>{col.label}</h3>
                <span>{items.length}</span>
                <button type="button" className="btn ghost small" aria-label={`Add lead to ${col.label}`} onClick={newLead}>+</button>
                <button type="button" className="btn ghost small" aria-expanded={!hideDesktop} onClick={() => setCollapsed({ ...collapsed, [col.id]: !hideDesktop })}>{hideDesktop ? 'Open' : 'Hide'}</button>
              </header>
              {!hideDesktop && items.map((l) => (
                <LeadCard key={l.id} lead={l} onOpen={onOpen} onMenu={onMenu} />
              ))}
            </section>
          )
        })}
      </div>
    </>
  )
}

function LeadCard({ lead, onOpen, onMenu }) {
  const today = todayStr()
  const fol = followOf(lead, today)
  const pri = lead.priority || 'Medium'
  const health = lead.health || 'Stable'
  return (
    <article
      className="lead-card"
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/lead-id', lead.id); e.dataTransfer.effectAllowed = 'move' }}
    >
      <button type="button" className="lead-main" onClick={() => onOpen(lead.id)} aria-label={`Open preview for ${nm(lead)}`}>
        <strong>{nm(lead)}</strong>
        <span className="lead-next">{nextAction(lead)}</span>
        <span className={`follow-tag ${fol.id}`}>{fol.label}{lead.nextFollowUp ? ` · ${fmtDate(lead.nextFollowUp)}` : ''}</span>
        <span className="lead-meta">
          {(lead.recommendedTier || lead.desiredService || 'Tier unset')}
          {lead.estimatedValue ? ` · ${lead.estimatedValue}` : ''}
        </span>
        <span className="lead-sub">
          {lead.contactName || 'No contact'} · {lead.industry || '—'}
        </span>
        <span className="lead-tags">
          <span className="chip">{pri} priority</span>
          <span className="chip">{health}</span>
          <span className="avatar" aria-hidden="true">{initials(lead)}</span>
        </span>
      </button>
      <button type="button" className="btn ghost small lead-more" aria-haspopup="menu" aria-label={`Actions for ${nm(lead)}`} onClick={() => onMenu(lead.id)}>···</button>
    </article>
  )
}

function CardMenu({ lead, onClose, move, convert, addFollow, openFull, go, patch }) {
  if (!lead) return null
  return (
    <div className="menu-back" onClick={onClose}>
      <div className="card-menu glass-3" role="menu" onClick={(e) => e.stopPropagation()}>
        <p className="kicker">{nm(lead)}</p>
        <button type="button" onClick={() => { openFull(lead.id); onClose() }}>Open lead</button>
        <button type="button" onClick={() => { go && go('comms'); onClose() }}>Log communication</button>
        <button type="button" onClick={() => { addFollow(lead); onClose() }}>Add follow-up</button>
        <button type="button" onClick={() => { patch('tasks', blankTask({ title: `Pipeline: ${nm(lead)}` })); onClose() }}>Add task</button>
        <button type="button" onClick={() => { go && go('intake'); onClose() }}>Start assessment</button>
        <button type="button" onClick={() => { go && go('proposals'); onClose() }}>Create proposal</button>
        <button type="button" onClick={() => { convert(lead); onClose() }}>Convert to client</button>
        <label>
          Move stage
          <select className="select" value={lead.status} onChange={(e) => move(lead, e.target.value)}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => { move(lead, 'won'); onClose() }}>Mark as won</button>
        <button type="button" onClick={() => { move(lead, 'lost'); onClose() }}>Mark as lost</button>
        <button type="button" onClick={() => { move(lead, 'archived'); onClose() }}>Archive</button>
        <button type="button" className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function Drawer({ refEl, lead, os, onClose, move, convert, addFollow, openFull, go, patch }) {
  if (!lead) return null
  const today = todayStr()
  const relatedTasks = (os.tasks || []).filter((t) => t.title?.includes(nm(lead)))
  const relatedComms = (os.comms || []).filter((c) => c.leadId === lead.id || c.subject?.includes(nm(lead))).slice(0, 4)
  return (
    <div className="drawer-back" onClick={onClose}>
      <aside
        className="lead-drawer glass-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-drawer-title"
        ref={refEl}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="btn ghost small" onClick={onClose}>Close</button>
        <p className="kicker">{STAGES.find((s) => s.id === lead.status)?.label}</p>
        <h2 id="lead-drawer-title" className="display">{nm(lead)}</h2>
        <p className="lede">{lead.contactName} · {lead.email || 'No email'} · {lead.industry || '—'}</p>
        <div className="meta">
          <Badge>{lead.priority || 'Medium'} priority</Badge>
          <Badge tone="gold">{followOf(lead, today).label}</Badge>
        </div>
        <dl className="kv">
          <dt>Website</dt><dd>{lead.website || '—'}</dd>
          <dt>Tier</dt><dd>{lead.recommendedTier || lead.desiredService || '—'}</dd>
          <dt>Budget (internal)</dt><dd>{lead.budget || lead.estimatedValue || '—'}</dd>
          <dt>Timeline</dt><dd>{lead.timeline || lead.urgency || '—'}</dd>
          <dt>Next action</dt><dd>{nextAction(lead)}</dd>
          <dt>Follow-up</dt><dd>{lead.nextFollowUp ? fmtDate(lead.nextFollowUp) : 'None scheduled'}</dd>
          <dt>Last contact</dt><dd>{lead.lastContact ? fmtDate(lead.lastContact) : '—'}</dd>
        </dl>
        {lead.notes && <p>{lead.notes}</p>}
        <h4>Recent communication</h4>
        <ul>{relatedComms.map((c) => <li key={c.id}>{c.subject || c.type}</li>)}{!relatedComms.length && <li>None logged.</li>}</ul>
        <h4>Tasks</h4>
        <ul>{relatedTasks.map((t) => <li key={t.id}>{t.title}</li>)}{!relatedTasks.length && <li>None yet.</li>}</ul>
        <label>
          Move stage
          <select className="select" value={lead.status} onChange={(e) => move(lead, e.target.value)}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <div className="chip-row" style={{ marginTop: 14 }}>
          <button className="btn small primary" onClick={() => openFull(lead.id)}>Open full profile</button>
          <button className="btn small" onClick={() => addFollow(lead)}>Log follow-up</button>
          <button className="btn small" onClick={() => patch('tasks', blankTask({ title: `Follow: ${nm(lead)}` }))}>Create task</button>
          <button className="btn small" onClick={() => convert(lead)}>Convert to client</button>
          {go && <button className="btn small" onClick={() => go('intake')}>Start assessment</button>}
        </div>
      </aside>
    </div>
  )
}

function LeadTable({ dense, rows, selected, setSelected, onOpen, move, bulkMove }) {
  const today = todayStr()
  const allOn = rows.length && rows.every((r) => selected[r.id])
  return (
    <div className="table-wrap pipe-table">
      <div className="chip-row">
        <button className="btn small" disabled={!Object.values(selected).some(Boolean)} onClick={() => bulkMove('follow-up')}>Bulk: follow-up</button>
        <button className="btn small" disabled={!Object.values(selected).some(Boolean)} onClick={() => bulkMove('nurture')}>Bulk: nurture</button>
        <button className="btn small" disabled={!Object.values(selected).some(Boolean)} onClick={() => bulkMove('archived')}>Bulk: archive</button>
      </div>
      <table className="roadmap">
        <thead>
          <tr>
            <th><input type="checkbox" checked={!!allOn} onChange={(e) => {
              const next = {}
              if (e.target.checked) rows.forEach((r) => { next[r.id] = true })
              setSelected(next)
            }} aria-label="Select all" /></th>
            <th>Lead</th>
            <th>Stage</th>
            <th>Tier</th>
            <th>Priority</th>
            <th>Owner</th>
            <th>Next action</th>
            <th>Follow-up</th>
            {!dense && <th>Last contact</th>}
            <th>Value</th>
            {!dense && <th>Days in stage</th>}
            {!dense && <th>Source</th>}
            {!dense && <th>Industry</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id}>
              <td><input type="checkbox" checked={!!selected[l.id]} onChange={(e) => setSelected({ ...selected, [l.id]: e.target.checked })} aria-label={`Select ${nm(l)}`} /></td>
              <td><button type="button" className="linkish" onClick={() => onOpen(l.id)}>{nm(l)}</button></td>
              <td>
                <select className="select" value={l.status} onChange={(e) => move(l, e.target.value)} aria-label={`Stage for ${nm(l)}`}>
                  {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </td>
              <td>{l.recommendedTier || l.desiredService || '—'}</td>
              <td>{l.priority || 'Medium'}</td>
              <td>{l.owner || 'Empyré'}</td>
              <td>{nextAction(l)}</td>
              <td>{followOf(l, today).label}</td>
              {!dense && <td>{l.lastContact ? fmtDate(l.lastContact) : '—'}</td>}
              <td>{l.estimatedValue || '—'}</td>
              {!dense && <td>{daysSince(l.updatedAt)}</td>}
              {!dense && <td>{l.referralSource || l.inquirySource || '—'}</td>}
              {!dense && <td>{l.industry || '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="lede">No leads in this view. Begin with the inquiry, not the logo.</p>}
    </div>
  )
}

function Timeline({ rows, onOpen }) {
  const items = rows.flatMap((l) => {
    const out = []
    if (l.inquiryDate || l.createdAt) out.push({ date: (l.inquiryDate || l.createdAt || '').slice(0, 10), label: `${nm(l)} · inquiry`, id: l.id })
    if (l.nextFollowUp) out.push({ date: l.nextFollowUp, label: `${nm(l)} · follow-up`, id: l.id })
    if (l.lastContact) out.push({ date: l.lastContact, label: `${nm(l)} · last contact`, id: l.id })
    return out
  }).filter((x) => x.date).sort((a, b) => a.date.localeCompare(b.date))
  return (
    <ul className="timeline">
      {items.map((it, i) => (
        <li key={i}><span>{it.date}</span><button type="button" className="linkish" onClick={() => onOpen(it.id)}>{it.label}</button></li>
      ))}
      {!items.length && <li>No dated pipeline events yet.</li>}
    </ul>
  )
}
