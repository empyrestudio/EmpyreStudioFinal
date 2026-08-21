import { useState } from 'react'
import { useOs, nameOfClient } from '../lib/OsContext.jsx'
import { PROCESS, PROJECT_STATUS, HEALTH, PROJECT_TYPES, TASK_STATUS, TASK_PRIORITY, DELIV_STATUS, APPROVAL_STATUS } from '../lib/os-constants.js'
import { TIER_LIST, SIGNATURE } from '../lib/constants.js'
import { blankProject, blankTask, blankDeliverable, blankApproval, defaultDeliverablesFor } from '../lib/os.js'
import { Field, Input, Area, Select, Badge } from '../components/ui.jsx'
import { fmtDate } from '../lib/utils.js'

export function ProjectsView({ openId, setOpenId }) {
  const { os, patch, drop } = useOs()
  const p = os.projects.find((x) => x.id === openId)
  const clientOpts = os.clients.map((c) => ({ id: c.id, label: nameOfClient(c) }))
  const set = (k) => (v) => patch('projects', { ...p, [k]: v })
  return (
    <div className="page">
      <div className="kicker">Delivery</div>
      <h1 className="display">Projects</h1>
      <p className="lede">Discovery → Excavation → Creation → Refinement → Elevation.</p>
      {!p && (
        <>
          <button className="btn primary" onClick={() => { const n = blankProject(); patch('projects', n); setOpenId(n.id) }}>Start project</button>
          <div className="library" style={{ marginTop: 16 }}>
            {os.projects.filter((x) => x.status !== 'Archived').map((x) => (
              <article className="card" key={x.id}>
                <div>
                  <h3>{x.name || 'Untitled project'}</h3>
                  <div className="meta">
                    <Badge tone={x.health === 'At risk' ? 'danger' : x.health === 'On track' ? 'ok' : 'gold'}>{x.health}</Badge>
                    <span>{x.status}</span>
                    <span>{PROCESS.find((s) => s.id === x.processStage)?.label}</span>
                    <span>{x.progress || 0}%</span>
                  </div>
                </div>
                <button className="btn small" onClick={() => setOpenId(x.id)}>Open</button>
              </article>
            ))}
            {!os.projects.length && <div className="block"><p>No active projects. Every strong brand begins with a clear next move.</p></div>}
          </div>
        </>
      )}
      {p && (
        <div>
          <button className="btn ghost small" onClick={() => setOpenId(null)}>Back</button>
          <div className="process-rail" aria-label="Empyré process">
            {PROCESS.map((s) => (
              <button
                key={s.id}
                className={p.processStage === s.id ? 'on' : ''}
                onClick={() => patch('projects', { ...p, processStage: s.id })}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="grid-form" style={{ marginTop: 16 }}>
            <Field label="Project name" className="span-2"><Input value={p.name} onChange={set('name')} /></Field>
            <Field label="Client"><Select value={p.clientId} onChange={set('clientId')} options={clientOpts} /></Field>
            <Field label="Type"><Select value={p.type} onChange={set('type')} options={PROJECT_TYPES} /></Field>
            <Field label="Service tier"><Select value={p.tier} onChange={set('tier')} options={TIER_LIST.map((t) => ({ id: t.id, label: t.name }))} /></Field>
            <Field label="Status"><Select value={p.status} onChange={set('status')} options={PROJECT_STATUS} /></Field>
            <Field label="Process stage"><Select value={p.processStage} onChange={set('processStage')} options={PROCESS} /></Field>
            <Field label="Health override"><Select value={p.healthOverride} onChange={set('healthOverride')} options={['', ...HEALTH]} /></Field>
            <Field label="Owner"><Input value={p.owner} onChange={set('owner')} /></Field>
            <Field label="Start"><Input type="date" value={p.startDate} onChange={set('startDate')} /></Field>
            <Field label="Target delivery"><Input type="date" value={p.targetDate} onChange={set('targetDate')} /></Field>
            <Field label="Launch date"><Input type="date" value={p.launchDate} onChange={set('launchDate')} /></Field>
            <Field label="Progress %"><Input value={p.progress} onChange={set('progress')} /></Field>
            <Field label="Budget (internal)"><Input value={p.budget} onChange={set('budget')} /></Field>
            <Field label="Invoice / deposit (internal)"><Input value={p.invoiceStatus} onChange={set('invoiceStatus')} /></Field>
            <Field label="Scope" className="span-2"><Area value={p.scope} onChange={set('scope')} /></Field>
            <Field label="Objectives" className="span-2"><Area value={p.objectives} onChange={set('objectives')} /></Field>
            <Field label="Risks"><Area value={p.risks} onChange={set('risks')} /></Field>
            <Field label="Blockers"><Area value={p.blockers} onChange={set('blockers')} /></Field>
            <Field label="Health override reason" className="span-2"><Input value={p.healthReason} onChange={set('healthReason')} /></Field>
          </div>
          <div className="chip-row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => {
              defaultDeliverablesFor(p.tier || 'identity', p.clientId, p.id).forEach((d) => patch('deliverables', d))
            }}>Load tier deliverables</button>
            <button className="btn danger" onClick={() => { if (confirm('Archive project?')) patch('projects', { ...p, status: 'Archived' }) }}>Archive</button>
            <button className="btn danger" onClick={() => { if (confirm('Delete project permanently?')) { drop('projects', p.id); setOpenId(null) } }}>Delete</button>
          </div>
          <h4 style={{ marginTop: 24 }}>Empyré Signature</h4>
          <div className="sig-list">
            {SIGNATURE.map((s) => (
              <div className="sig-item" key={s.n}><strong>{s.name}</strong><p>{s.body}</p></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function TasksView({ filter }) {
  const { os, patch, drop } = useOs()
  const [tab, setTab] = useState(filter || 'all')
  const today = new Date().toISOString().slice(0, 10)
  let list = os.tasks
  if (tab === 'today') list = list.filter((t) => t.due === today)
  if (tab === 'overdue') list = list.filter((t) => t.due && t.due < today && t.status !== 'Completed')
  if (tab === 'week') list = list.filter((t) => t.due && t.due >= today && t.due <= add(today, 7))
  const clients = os.clients.map((c) => ({ id: c.id, label: nameOfClient(c) }))
  const projects = os.projects.map((p) => ({ id: p.id, label: p.name || 'Project' }))
  return (
    <div className="page">
      <div className="kicker">Delivery</div>
      <h1 className="display">Tasks</h1>
      <div className="chip-row">
        {['all', 'today', 'overdue', 'week'].map((t) => (
          <button key={t} className={`btn small ${tab === t ? 'primary' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
        <button className="btn primary small" onClick={() => patch('tasks', blankTask({ due: today }))}>Add task</button>
      </div>
      <div className="table-wrap">
        <table className="roadmap">
          <thead><tr><th>Task</th><th>Client</th><th>Project</th><th>Priority</th><th>Status</th><th>Due</th><th></th></tr></thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td><input className="inline-input" value={t.title} onChange={(e) => patch('tasks', { ...t, title: e.target.value })} placeholder="Task title" /></td>
                <td><select className="select" value={t.clientId} onChange={(e) => patch('tasks', { ...t, clientId: e.target.value })}><option value="">—</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></td>
                <td><select className="select" value={t.projectId} onChange={(e) => patch('tasks', { ...t, projectId: e.target.value })}><option value="">—</option>{projects.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></td>
                <td><select className="select" value={t.priority} onChange={(e) => patch('tasks', { ...t, priority: e.target.value })}>{TASK_PRIORITY.map((x) => <option key={x}>{x}</option>)}</select></td>
                <td><select className="select" value={t.status} onChange={(e) => patch('tasks', { ...t, status: e.target.value })}>{TASK_STATUS.map((x) => <option key={x}>{x}</option>)}</select></td>
                <td><input className="inline-input" type="date" value={t.due} onChange={(e) => patch('tasks', { ...t, due: e.target.value })} /></td>
                <td><button className="btn small danger" onClick={() => drop('tasks', t.id)}>Del</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="lede">No tasks due today. The system is clear. Make space for the work that matters.</p>}
      </div>
    </div>
  )
}

function add(iso, n) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function DeliverablesView() {
  const { os, patch, drop } = useOs()
  const projects = os.projects.map((p) => ({ id: p.id, label: p.name || 'Project' }))
  return (
    <div className="page">
      <div className="kicker">Delivery</div>
      <h1 className="display">Deliverables</h1>
      <button className="btn primary" onClick={() => patch('deliverables', blankDeliverable())}>Add deliverable</button>
      <div className="library" style={{ marginTop: 16 }}>
        {os.deliverables.map((d) => (
          <article className="card" key={d.id}>
            <div style={{ width: '100%' }}>
              <input className="inline-input" value={d.name} onChange={(e) => patch('deliverables', { ...d, name: e.target.value })} placeholder="Deliverable name" />
              <div className="meta" style={{ marginTop: 8 }}>
                <select className="select" style={{ width: 180 }} value={d.status} onChange={(e) => patch('deliverables', { ...d, status: e.target.value })}>{DELIV_STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                <select className="select" style={{ width: 180 }} value={d.projectId} onChange={(e) => patch('deliverables', { ...d, projectId: e.target.value })}><option value="">Project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
                <input className="inline-input" style={{ width: 140 }} type="date" value={d.deliveryDate} onChange={(e) => patch('deliverables', { ...d, deliveryDate: e.target.value })} />
                <Badge>{d.version}</Badge>
                <button className="btn small danger" onClick={() => drop('deliverables', d.id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!os.deliverables.length && <div className="block"><p>No deliverables tracked. Load them from a project’s service tier.</p></div>}
      </div>
    </div>
  )
}

export function ApprovalsView() {
  const { os, patch, drop } = useOs()
  return (
    <div className="page">
      <div className="kicker">Delivery</div>
      <h1 className="display">Approvals</h1>
      <button className="btn primary" onClick={() => patch('approvals', blankApproval())}>Request approval</button>
      <div className="library" style={{ marginTop: 16 }}>
        {os.approvals.map((a) => (
          <article className="card" key={a.id}>
            <div style={{ width: '100%' }}>
              <input className="inline-input" value={a.item} onChange={(e) => patch('approvals', { ...a, item: e.target.value })} placeholder="Item for review" />
              <div className="meta" style={{ marginTop: 8 }}>
                <select className="select" style={{ width: 200 }} value={a.status} onChange={(e) => patch('approvals', { ...a, status: e.target.value })}>{APPROVAL_STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                <input className="inline-input" style={{ width: 160 }} type="date" value={a.deadline} onChange={(e) => patch('approvals', { ...a, deadline: e.target.value })} />
                <button className="btn small danger" onClick={() => drop('approvals', a.id)}>Delete</button>
              </div>
              <textarea className="inline-input" style={{ marginTop: 8 }} rows={2} value={a.feedback} onChange={(e) => patch('approvals', { ...a, feedback: e.target.value })} placeholder="Feedback" />
            </div>
          </article>
        ))}
        {!os.approvals.length && <div className="block"><p>No approval requests. Strategy does not ship without a decision.</p></div>}
      </div>
    </div>
  )
}
