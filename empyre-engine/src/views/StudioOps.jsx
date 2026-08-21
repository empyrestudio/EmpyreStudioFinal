import { useEffect, useMemo, useState } from 'react'
import { useOs, nameOfClient } from '../lib/OsContext.jsx'
import { MEETING_TYPES, COMM_TYPES, COMMS_TEMPLATES, FILE_CATS, NOTE_CATS } from '../lib/os-constants.js'
import { blankMeeting, blankComm, blankNote } from '../lib/os.js'
import { Field, Input, Area, Select } from '../components/ui.jsx'
import { fmtDate } from '../lib/utils.js'

export function MeetingsView() {
  const { os, patch, drop } = useOs()
  const [open, setOpen] = useState(null)
  const m = os.meetings.find((x) => x.id === open)
  const clients = os.clients.map((c) => ({ id: c.id, label: nameOfClient(c) }))
  const set = (k) => (v) => patch('meetings', { ...m, [k]: v })
  return (
    <div className="page">
      <div className="kicker">Studio</div>
      <h1 className="display">Meetings + Notes</h1>
      <button className="btn primary" onClick={() => { const n = blankMeeting(); patch('meetings', n); setOpen(n.id) }}>Add meeting</button>
      {!m && (
        <div className="library" style={{ marginTop: 16 }}>
          {os.meetings.map((x) => (
            <article className="card" key={x.id}>
              <div>
                <h3>{x.title || x.type}</h3>
                <div className="meta"><span>{x.type}</span><span>{x.when ? fmtDate(x.when) : '—'}</span></div>
              </div>
              <button className="btn small" onClick={() => setOpen(x.id)}>Open</button>
            </article>
          ))}
          {!os.meetings.length && <div className="block"><p>No meetings logged. The conversation is part of the system.</p></div>}
        </div>
      )}
      {m && (
        <div style={{ marginTop: 16 }}>
          <button className="btn ghost small" onClick={() => setOpen(null)}>Back</button>
          <div className="grid-form">
            <Field label="Title" className="span-2"><Input value={m.title} onChange={set('title')} /></Field>
            <Field label="Type"><Select value={m.type} onChange={set('type')} options={MEETING_TYPES} /></Field>
            <Field label="Client"><Select value={m.clientId} onChange={set('clientId')} options={clients} /></Field>
            <Field label="When"><Input type="datetime-local" value={m.when} onChange={set('when')} /></Field>
            <Field label="Attendees"><Input value={m.attendees} onChange={set('attendees')} /></Field>
            <Field label="Agenda" className="span-2"><Area value={m.agenda} onChange={set('agenda')} /></Field>
            <Field label="Notes" className="span-2"><Area value={m.notes} onChange={set('notes')} /></Field>
            <Field label="Decisions"><Area value={m.decisions} onChange={set('decisions')} /></Field>
            <Field label="Action items"><Area value={m.actions} onChange={set('actions')} /></Field>
            <Field label="Open questions"><Area value={m.questions} onChange={set('questions')} /></Field>
            <Field label="Follow-up date"><Input type="date" value={m.followUp} onChange={set('followUp')} /></Field>
          </div>
          <div className="block" style={{ marginTop: 16 }}>
            <h4>After this meeting</h4>
            <ul>
              <li>Turn action items into tasks.</li>
              <li>Record decisions on the client timeline.</li>
              <li>Draft a follow-up from Communication templates.</li>
              <li>Note blockers on the project.</li>
            </ul>
          </div>
          <button className="btn danger" style={{ marginTop: 12 }} onClick={() => { drop('meetings', m.id); setOpen(null) }}>Delete</button>
        </div>
      )}
    </div>
  )
}

export function CommsView() {
  const { os, patch, drop } = useOs()
  const clients = os.clients.map((c) => ({ id: c.id, label: nameOfClient(c) }))
  return (
    <div className="page">
      <div className="kicker">Studio</div>
      <h1 className="display">Communication log</h1>
      <div className="chip-row">
        <button className="btn primary" onClick={() => patch('comms', blankComm())}>Log communication</button>
      </div>
      <h4 style={{ marginTop: 18 }}>Templates</h4>
      <div className="library">
        {COMMS_TEMPLATES.map((t) => (
          <article className="card" key={t.id}>
            <div>
              <h3 style={{ fontSize: 22 }}>{t.name}</h3>
              <p style={{ color: 'var(--mist)', fontWeight: 300 }}>{t.body}</p>
            </div>
            <button className="btn small" onClick={() => { navigator.clipboard?.writeText(t.body); patch('comms', { ...blankComm(), subject: t.name, summary: t.body, type: 'Email' }) }}>Use</button>
          </article>
        ))}
      </div>
      <h4 style={{ marginTop: 24 }}>Log</h4>
      {os.comms.map((c) => (
        <div className="block" key={c.id} style={{ marginBottom: 10 }}>
          <div className="grid-form">
            <Field label="Date"><Input type="date" value={c.date} onChange={(v) => patch('comms', { ...c, date: v })} /></Field>
            <Field label="Type"><Select value={c.type} onChange={(v) => patch('comms', { ...c, type: v })} options={COMM_TYPES} /></Field>
            <Field label="Direction"><Select value={c.direction} onChange={(v) => patch('comms', { ...c, direction: v })} options={['Incoming', 'Outgoing', 'Internal']} /></Field>
            <Field label="Client"><Select value={c.clientId} onChange={(v) => patch('comms', { ...c, clientId: v })} options={clients} /></Field>
            <Field label="Subject" className="span-2"><Input value={c.subject} onChange={(v) => patch('comms', { ...c, subject: v })} /></Field>
            <Field label="Summary" className="span-2"><Area value={c.summary} onChange={(v) => patch('comms', { ...c, summary: v })} /></Field>
          </div>
          <button className="btn small danger" onClick={() => drop('comms', c.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export function FilesView() {
  const { os, patch, drop } = useOs()
  const onFiles = async (files) => {
    for (const f of Array.from(files).slice(0, 8)) {
      if (f.size > 2.5 * 1024 * 1024) continue
      const dataUrl = await readFile(f)
      patch('files', {
        id: crypto.randomUUID?.() || String(Date.now()),
        createdAt: new Date().toISOString(),
        name: f.name, type: f.type, dataUrl, category: 'Other',
        internalOnly: true, clientFacing: false, version: '1', notes: '',
      })
    }
  }
  return (
    <div className="page">
      <div className="kicker">Studio</div>
      <h1 className="display">Files + Assets</h1>
      <p className="lede">Internal by default. Nothing here enters a client PDF unless you choose it.</p>
      <div className="drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files) }}>
        Drop files (2.5MB each) or
        <label className="btn small" style={{ marginLeft: 8 }}>Upload<input type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} /></label>
      </div>
      <div className="library" style={{ marginTop: 16 }}>
        {os.files.map((f) => (
          <article className="card" key={f.id}>
            <div>
              <h3 style={{ fontSize: 22 }}>{f.name}</h3>
              <div className="meta">
                <select className="select" style={{ width: 140 }} value={f.category} onChange={(e) => patch('files', { ...f, category: e.target.value })}>{FILE_CATS.map((c) => <option key={c}>{c}</option>)}</select>
                <label className="meta"><input type="checkbox" checked={!!f.internalOnly} onChange={(e) => patch('files', { ...f, internalOnly: e.target.checked })} /> Internal only</label>
              </div>
              {f.dataUrl?.startsWith('data:image') && <img className="asset-thumb" src={f.dataUrl} alt="" />}
            </div>
            <button className="btn small danger" onClick={() => drop('files', f.id)}>Delete</button>
          </article>
        ))}
        {!os.files.length && <div className="block"><p>No files yet. Collect before you invent.</p></div>}
      </div>
    </div>
  )
}

function readFile(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file) })
}

export function CalendarView() {
  const { os } = useOs()
  const items = useMemo(() => {
    const out = []
    os.tasks.forEach((t) => t.due && out.push({ date: t.due, label: `Task · ${t.title}`, tone: 'gold' }))
    os.meetings.forEach((m) => m.when && out.push({ date: m.when.slice(0, 10), label: `Meeting · ${m.title || m.type}`, tone: 'ok' }))
    os.followups.forEach((f) => f.due && out.push({ date: f.due, label: `Follow-up · ${f.title}`, tone: 'warn' }))
    os.projects.forEach((p) => p.targetDate && out.push({ date: p.targetDate, label: `Delivery · ${p.name}`, tone: '' }))
    os.leads.forEach((l) => l.nextFollowUp && out.push({ date: l.nextFollowUp, label: `Lead · ${l.businessName}`, tone: '' }))
    return out.sort((a, b) => a.date.localeCompare(b.date))
  }, [os])
  return (
    <div className="page">
      <div className="kicker">Studio</div>
      <h1 className="display">Calendar + Timeline</h1>
      <ul className="timeline">
        {items.map((it, i) => <li key={i}><span>{it.date}</span> {it.label}</li>)}
        {!items.length && <li>No dated work yet.</li>}
      </ul>
    </div>
  )
}

function InquiryIntegration() {
  const { os, setSettings, ingestPending } = useOs()
  const s = os.settings || {}
  const [status, setStatus] = useState(null)
  const [testMsg, setTestMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = async () => {
    try {
      const r = await fetch('/api/inquiries/status')
      setStatus(await r.json())
    } catch {
      setStatus({ ok: false, connected: false })
    }
  }
  useMemo(() => { refresh() }, [])
  const test = async () => {
    setBusy(true)
    setTestMsg('')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Alex Rivera',
          businessName: 'Vale Atelier (TEST)',
          email: 'alex.rivera.test@example.invalid',
          phone: '',
          website: 'https://example.invalid',
          industry: 'Professional Services',
          location: 'Savannah',
          service: 'Identity Transformation',
          projectType: 'Identity Transformation',
          budget: '$15k–$30k',
          timeline: '8–12 weeks',
          challenge: 'The brand no longer matches the work.',
          message: 'TEST SUBMISSION — not a real inquiry. Please ignore if seen in production.',
          consent: true,
          formName: 'Website inquiry',
          landingPage: 'https://empyrestudio.com/contact',
          utm_source: 'test',
        }),
      })
      const body = await res.json()
      if (body.ok) {
        const sync = await ingestPending()
        setTestMsg(`Test received. CRM sync ${sync.ok ? 'ok' : 'pending'} (${sync.count} new). Visitor would only see a thank-you.`)
        refresh()
      } else setTestMsg('Test did not complete.')
    } catch {
      setTestMsg('CRM sync failed. Submission should remain in the form fallback store.')
    }
    setBusy(false)
  }
  return (
    <section style={{ marginTop: 36 }}>
      <h2 className="display" style={{ fontSize: 28 }}>Inquiry integration</h2>
      <p className="lede">Website form → server → CRM Pipeline · New Inquiry. The public form never receives CRM data or credentials.</p>
      <div className="grid-form">
        <Field label="Connection status"><p>{status?.connected ? 'Connected' : 'Unreachable'}</p></Field>
        <Field label="Pending on server"><p>{status?.pending ?? '—'}</p></Field>
        <Field label="Last successful sync"><p>{s.inquiryLastOk || status?.last || '—'}</p></Field>
        <Field label="Last failed sync"><p>{s.inquiryLastFail || status?.lastFail || '—'}</p></Field>
        <Field label="Form name(s)" className="span-2"><Input value={s.inquiryForm || ''} onChange={(v) => setSettings({ inquiryForm: v })} /></Field>
        <Field label="Default lead stage"><Input value={s.inquiryDefaultStage || 'inquiry'} onChange={(v) => setSettings({ inquiryDefaultStage: v })} /></Field>
        <Field label="Default lead owner"><Input value={s.inquiryOwner || ''} onChange={(v) => setSettings({ inquiryOwner: v })} /></Field>
        <Field label="Follow-up (business days)"><Input value={String(s.inquiryFollowupDays ?? 1)} onChange={(v) => setSettings({ inquiryFollowupDays: Number(v) || 1 })} /></Field>
        <Field label="Notify in Attention Center">
          <Select value={s.inquiryNotify === false ? 'no' : 'yes'} onChange={(v) => setSettings({ inquiryNotify: v === 'yes' })} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} />
        </Field>
        <Field label="Ingest key (internal)" hint="Production only. Never put this on the public website. Environment: EMPYRE_INGEST_KEY"><Input value={s.ingestKey || ''} onChange={(v) => setSettings({ ingestKey: v })} /></Field>
      </div>
      <p className="lede" style={{ marginTop: 12 }}>Duplicate rules: email, then website domain, then business name. Open leads are updated, not copied. Existing clients get a request, not a second client record. Raw payload is internal only.</p>
      <div className="chip-row">
        <button className="btn" onClick={() => ingestPending()}>Sync now</button>
        <button className="btn primary" disabled={busy} onClick={test}>Send test submission</button>
      </div>
      {testMsg && <p className="lede" style={{ marginTop: 10 }}>{testMsg}</p>}
    </section>
  )
}

export function SettingsView() {
  const { os, setSettings, resetAll, flash } = useOs()
  const s = os.settings || {}
  return (
    <div className="page">
      <div className="kicker">Studio</div>
      <h1 className="display">Settings</h1>
      <p className="lede">Single-user Version 1. Structure is ready for roles later. {flash}</p>
      <div className="grid-form">
        <Field label="Studio name"><Input value={s.studioName} onChange={(v) => setSettings({ studioName: v })} /></Field>
        <Field label="Owner / creative director"><Input value={s.ownerName} onChange={(v) => setSettings({ ownerName: v })} /></Field>
        <Field label="Workspace role">
          <Select value={s.role || 'admin'} onChange={(v) => setSettings({ role: v })} options={[
            { id: 'admin', label: 'Empyré Admin' },
            { id: 'strategist', label: 'Empyré Strategist / Designer' },
            { id: 'client', label: 'Client Viewer' },
          ]} />
        </Field>
        <Field label="Confidentiality label" className="span-2"><Input value={s.confidentiality} onChange={(v) => setSettings({ confidentiality: v })} /></Field>
      </div>
      <InquiryIntegration />
      <div className="banner warn" style={{ marginTop: 24 }}>
        <h4>Privacy</h4>
        <p>Data lives in this browser only. Internal notes never travel with client-facing exports. No payment details. Archive or delete client records when the relationship ends.</p>
      </div>
      <button className="btn danger" style={{ marginTop: 18 }} onClick={() => { if (confirm('Erase all studio data in this browser?')) resetAll() }}>Erase local studio data</button>
    </div>
  )
}

export function NotesDrawer({ recordType, recordId }) {
  const { os, patch, drop } = useOs()
  const notes = os.notes.filter((n) => n.recordType === recordType && n.recordId === recordId)
  return (
    <div className="block" style={{ marginTop: 16 }}>
      <h4>Internal notes — never client-facing</h4>
      {notes.map((n) => (
        <div key={n.id} style={{ marginBottom: 10 }}>
          <Select value={n.category} onChange={(v) => patch('notes', { ...n, category: v })} options={NOTE_CATS} />
          <Area value={n.body} onChange={(v) => patch('notes', { ...n, body: v })} />
          <button className="btn small danger" onClick={() => drop('notes', n.id)}>Delete note</button>
        </div>
      ))}
      <button className="btn small" onClick={() => patch('notes', blankNote(recordType, recordId))}>Add internal note</button>
    </div>
  )
}
