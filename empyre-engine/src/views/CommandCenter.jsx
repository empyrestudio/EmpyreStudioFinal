import { useMemo, useState } from 'react'
import { useOs, nameOfClient } from '../lib/OsContext.jsx'
import { PIPELINE, REL_HEALTH, RETENTION } from '../lib/os-constants.js'
import { INDUSTRIES, TIER_LIST, BUDGETS, TIMELINES } from '../lib/constants.js'
import { blankLead, blankClient, blankProject, blankFollowup, logEvent, todayStr } from '../lib/os.js'
import { Field, Input, Area, Select, Badge } from '../components/ui.jsx'
import { fmtDate } from '../lib/utils.js'
import { AtmospherePhoto, LogoLockup } from '../assets/Brand.jsx'

function greeting(name) {
  const h = new Date().getHours()
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${part}, ${name}.`
}

export function DashboardView({ go }) {
  const { os, metrics } = useOs()
  const name = os.settings?.ownerName || 'SaMiaya'
  const empty = !metrics.leadCount && !metrics.clientCount && !os.assessments.length
  if (empty) {
    return (
      <div className="page" style={{ maxWidth: 'none', paddingTop: 20 }}>
        <div className="hero-empty">
          <AtmospherePhoto variant="hero" className="atmosphere" />
          <div className="copy glass-3">
            <LogoLockup className="empty-lockup" />
            <div className="kicker">Empyré Elevation Engine</div>
            <h1 className="display">No active elevation assessments.</h1>
            <p className="lede">Begin with a client’s business reality. End with a brand built to rise.</p>
            <div className="chip-row" style={{ justifyContent: 'center' }}>
              <button className="btn primary" onClick={() => go('intake')}>Create Brand Assessment</button>
              <button className="btn" onClick={() => go('leads')}>Add Client</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="page command-page">
      <section className="command-hero">
        <AtmospherePhoto variant="hero" />
        <div className="command-panel glass-3">
          <p className="kicker">Studio command</p>
          <h1 className="display">{greeting(name)}</h1>
          <p className="lede">Capacity: {metrics.capacity}. {metrics.overdueTasks ? `${metrics.overdueTasks} overdue.` : 'The board is clear enough to work.'}</p>
          <div className="chip-row">
            <button className="btn primary" onClick={() => go('intake')}>Create Brand Assessment</button>
            <button className="btn" onClick={() => go('index')}>New Brand Diagnostic</button>
            <button className="btn" onClick={() => go('clients')}>Add Client</button>
          </div>
        </div>
      </section>
      <div className="stat-grid">
        <Stat label="Active leads" value={metrics.leadCount} onClick={() => go('leads')} />
        <Stat label="Active clients" value={metrics.clientCount} onClick={() => go('clients')} />
        <Stat label="On track" value={metrics.onTrack} />
        <Stat label="Needs attention" value={metrics.attention} warn={metrics.attention > 0} />
        <Stat label="Waiting on client" value={metrics.waitingClient} />
        <Stat label="Overdue tasks" value={metrics.overdueTasks} warn={metrics.overdueTasks > 0} />
        <Stat label="Pending approvals" value={metrics.pendingApprovals} />
        <Stat label="Capacity" value={metrics.capacity} />
      </div>
      <h2 className="display section-title">Attention center</h2>
      <div className="grid-2">
        <Attention title="Overdue tasks" items={metrics.overdueList.map((t) => t.title)} empty="No tasks due today. The system is clear. Make space for the work that matters." />
        <Attention title="Stale projects (7 days)" items={metrics.staleProjects.map((p) => p.name)} empty="No silent projects." />
        <Attention title="Follow-ups due" items={metrics.needFollow.map((x) => x.businessName || x.title || x.leadName)} empty="No follow-ups due." />
        <Attention title="Incomplete assessments" items={metrics.incompleteIntake.map((a) => a.client?.businessName || 'Untitled')} empty="No draft assessments." />
        <Attention
          title="Website inquiries"
          items={(metrics.websiteInquiries || []).map((n) => n.title)}
          empty="No new website inquiries."
        />
      </div>
      <h2 className="display section-title">Today / this week</h2>
      <div className="chip-row">
        {[
          ['Create new lead', 'leads'],
          ['Start project', 'projects'],
          ['Add task', 'tasks'],
          ['Add meeting note', 'meetings'],
          ['Generate client report', 'assessments'],
          ['Log follow-up', 'comms'],
        ].map(([l, v]) => <button key={l} className="btn small" onClick={() => go(v)}>{l}</button>)}
      </div>
    </div>
  )
}

function Stat({ label, value, warn, onClick }) {
  return (
    <button className={`stat ${warn ? 'warn' : ''}`} onClick={onClick} type="button">
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  )
}
function Attention({ title, items, empty }) {
  return (
    <div className="block">
      <h4>{title}</h4>
      {items.length ? <ul>{items.slice(0, 6).map((x, i) => <li key={i}>{x || '—'}</li>)}</ul> : <p>{empty}</p>}
    </div>
  )
}

export { PipelineView } from './Pipeline.jsx'

export function LeadsView({ openId, setOpenId, go }) {
  const { os, patch, drop } = useOs()
  const [q, setQ] = useState('')
  const lead = os.leads.find((l) => l.id === openId)
  const list = os.leads.filter((l) => JSON.stringify(l).toLowerCase().includes(q.toLowerCase()))
  const set = (k) => (v) => patch('leads', { ...lead, [k]: v })
  return (
    <div className="page">
      <div className="kicker">CRM</div>
      <h1 className="display">Leads</h1>
      <div className="toolbar">
        <input className="search" placeholder="Search leads" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn primary" onClick={() => { const l = blankLead(); patch('leads', l); setOpenId(l.id) }}>New lead</button>
      </div>
      {!lead && (
        <div className="library">
          {list.map((l) => (
            <article className="card" key={l.id}>
              <div>
                <h3>{l.businessName || l.leadName || 'Untitled lead'}</h3>
                <div className="meta">
                  <Badge tone="gold">{PIPELINE.find((p) => p.id === l.status)?.label || l.status}</Badge>
                  {l.industry && <span>{l.industry}</span>}
                  <span>{fmtDate(l.updatedAt)}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn small" onClick={() => setOpenId(l.id)}>Open</button>
              </div>
            </article>
          ))}
          {!list.length && <div className="block"><p>No active leads. Begin with the inquiry, not the logo.</p></div>}
        </div>
      )}
      {lead && (
        <div>
          <button className="btn ghost small" onClick={() => setOpenId(null)}>Back to list</button>
          <h2 className="display" style={{ margin: '12px 0' }}>{lead.businessName || 'Lead'}</h2>
          <div className="grid-form">
            <Field label="Lead / opportunity name"><Input value={lead.leadName} onChange={set('leadName')} /></Field>
            <Field label="Business name"><Input value={lead.businessName} onChange={set('businessName')} /></Field>
            <Field label="Contact name"><Input value={lead.contactName} onChange={set('contactName')} /></Field>
            <Field label="Email"><Input value={lead.email} onChange={set('email')} /></Field>
            <Field label="Phone"><Input value={lead.phone} onChange={set('phone')} /></Field>
            <Field label="Website"><Input value={lead.website} onChange={set('website')} /></Field>
            <Field label="Industry"><Select value={lead.industry} onChange={set('industry')} options={INDUSTRIES} /></Field>
            <Field label="Pipeline stage"><Select value={lead.status} onChange={set('status')} options={PIPELINE} /></Field>
            <Field label="Desired service"><Select value={lead.desiredService} onChange={set('desiredService')} options={TIER_LIST.map((t) => t.name)} /></Field>
            <Field label="Budget range"><Select value={lead.budget} onChange={set('budget')} options={BUDGETS} /></Field>
            <Field label="Timeline"><Select value={lead.timeline} onChange={set('timeline')} options={TIMELINES} /></Field>
            <Field label="Estimated value (internal)"><Input value={lead.estimatedValue} onChange={set('estimatedValue')} /></Field>
            <Field label="Next follow-up"><Input type="date" value={lead.nextFollowUp} onChange={set('nextFollowUp')} /></Field>
            <Field label="Last contact"><Input type="date" value={lead.lastContact} onChange={set('lastContact')} /></Field>
            <Field label="Referral source"><Input value={lead.referralSource} onChange={set('referralSource')} /></Field>
            <Field label="Notes" className="span-2"><Area value={lead.notes} onChange={set('notes')} /></Field>
            <Field label="Internal notes" className="span-2"><Area value={lead.internalNotes} onChange={set('internalNotes')} /></Field>
          </div>
          <div className="chip-row" style={{ marginTop: 18 }}>
            <button className="btn" onClick={() => {
              const c = { ...blankClient(), businessName: lead.businessName, email: lead.email, phone: lead.phone, website: lead.website, industry: lead.industry, contactName: lead.contactName, location: lead.location, socials: lead.socials, referralSource: lead.referralSource, clientSince: todayStr() }
              patch('clients', logEvent(c, 'Converted from lead'))
              patch('leads', { ...lead, status: 'won' })
              go('clients')
            }}>Convert to client</button>
            <button className="btn" onClick={() => go('intake')}>Start intake</button>
            <button className="btn" onClick={() => { patch('followups', { ...blankFollowup(), leadId: lead.id, title: `Follow up: ${lead.businessName}`, due: todayStr() }) }}>Log follow-up</button>
            <button className="btn danger" onClick={() => { if (confirm('Archive this lead?')) { patch('leads', { ...lead, retention: 'Archived', status: 'archived' }); setOpenId(null) } }}>Archive</button>
            <button className="btn danger" onClick={() => { if (confirm('Permanently delete this lead?')) { drop('leads', lead.id); setOpenId(null) } }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ClientsView({ openId, setOpenId, go }) {
  const { os, patch, drop } = useOs()
  const [q, setQ] = useState('')
  const client = os.clients.find((c) => c.id === openId)
  const list = os.clients.filter((c) => JSON.stringify(c).toLowerCase().includes(q.toLowerCase()) && c.retention !== 'Scheduled for deletion')
  const set = (k) => (v) => patch('clients', { ...client, [k]: v })
  return (
    <div className="page">
      <div className="kicker">CRM</div>
      <h1 className="display">Clients</h1>
      <div className="toolbar">
        <input className="search" placeholder="Search clients" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn primary" onClick={() => { const c = blankClient(); patch('clients', c); setOpenId(c.id) }}>New client</button>
      </div>
      {!client && (
        <div className="library">
          {list.map((c) => (
            <article className="card" key={c.id}>
              <div>
                <h3>{nameOfClient(c)}</h3>
                <div className="meta">
                  <Badge>{c.retention || 'Active'}</Badge>
                  {c.relationshipHealth && <Badge tone={c.relationshipHealth === 'At risk' ? 'danger' : 'gold'}>{c.relationshipHealth}</Badge>}
                  {c.industry && <span>{c.industry}</span>}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn small" onClick={() => setOpenId(c.id)}>Open</button>
              </div>
            </article>
          ))}
          {!list.length && <div className="block"><p>No clients yet. Convert a lead or create a record.</p></div>}
        </div>
      )}
      {client && (
        <div>
          <button className="btn ghost small" onClick={() => setOpenId(null)}>Back to list</button>
          <header className="dossier glass-2">
            <div>
              <p className="kicker">{client.industry || 'Client dossier'}</p>
              <h2 className="display">{nameOfClient(client)}</h2>
              <div className="meta">
                <Badge>{client.retention || 'Active'}</Badge>
                {client.relationshipHealth && <Badge tone={client.relationshipHealth === 'At risk' ? 'danger' : 'ok'}>{client.relationshipHealth}</Badge>}
                <span>Last contact {client.lastTouch || '—'}</span>
              </div>
            </div>
            <div className="chip-row">
              <button className="btn small" onClick={() => go('intake')}>Start assessment</button>
              <button className="btn small" onClick={() => go('index')}>Standard Index</button>
              <button className="btn small" onClick={() => go('comms')}>Log communication</button>
              <button className="btn small" onClick={() => go('tasks')}>Add task</button>
            </div>
          </header>
          <div className="grid-form">
            <Field label="Business name"><Input value={client.businessName} onChange={set('businessName')} /></Field>
            <Field label="Legal name"><Input value={client.legalName} onChange={set('legalName')} /></Field>
            <Field label="Primary contact"><Input value={client.contactName} onChange={set('contactName')} /></Field>
            <Field label="Email"><Input value={client.email} onChange={set('email')} /></Field>
            <Field label="Phone"><Input value={client.phone} onChange={set('phone')} /></Field>
            <Field label="Website"><Input value={client.website} onChange={set('website')} /></Field>
            <Field label="Industry"><Select value={client.industry} onChange={set('industry')} options={INDUSTRIES} /></Field>
            <Field label="Relationship health"><Select value={client.relationshipHealth} onChange={set('relationshipHealth')} options={REL_HEALTH} /></Field>
            <Field label="Retention"><Select value={client.retention} onChange={set('retention')} options={RETENTION} /></Field>
            <Field label="Preferred communication"><Input value={client.preferredComm} onChange={set('preferredComm')} /></Field>
            <Field label="Next follow-up"><Input type="date" value={client.nextFollowUp} onChange={set('nextFollowUp')} /></Field>
            <Field label="Decision makers"><Input value={client.decisionMakers} onChange={set('decisionMakers')} /></Field>
            <Field label="Risk flags" className="span-2"><Area value={client.riskFlags} onChange={set('riskFlags')} /></Field>
            <Field label="Billing notes (internal)" className="span-2"><Area value={client.billingNotes} onChange={set('billingNotes')} /></Field>
          </div>
          <h4 style={{ marginTop: 24 }}>Timeline</h4>
          <ul className="timeline">
            {(client.events || []).map((e) => <li key={e.id}><span>{fmtDate(e.at)}</span> {e.title}</li>)}
            {!client.events?.length && <li>No events yet.</li>}
          </ul>
          <div className="chip-row" style={{ marginTop: 18 }}>
            <button className="btn" onClick={() => go('intake')}>Start intake / assessment</button>
            <button className="btn" onClick={() => { const p = blankProject(client.id); p.name = `${nameOfClient(client)} — Identity`; patch('projects', p); go('projects') }}>Start project</button>
            <button className="btn danger" onClick={() => { if (confirm('Archive this client?')) patch('clients', { ...client, retention: 'Archived' }) }}>Archive</button>
            <button className="btn danger" onClick={() => { if (confirm('Permanently delete this client and detach related work? This cannot be undone.')) { drop('clients', client.id); setOpenId(null) } }}>Delete permanently</button>
          </div>
        </div>
      )}
    </div>
  )
}
