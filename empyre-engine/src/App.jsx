import { useState } from 'react'
import Layout from './components/Layout.jsx'
import LockScreen from './views/LockScreen.jsx'
import Intake from './views/Intake.jsx'
import Assessment from './views/Assessment.jsx'
import StudioStandard from './views/StudioStandard.jsx'
import { OsProvider, useOs, nameOfClient } from './lib/OsContext.jsx'
import { DashboardView, PipelineView, LeadsView, ClientsView } from './views/CommandCenter.jsx'
import { ProjectsView, TasksView, DeliverablesView, ApprovalsView } from './views/DeliveryViews.jsx'
import { MeetingsView, CommsView, FilesView, CalendarView, SettingsView } from './views/StudioOps.jsx'
import { DirectionsView, MoodBoardsView, ProposalsView } from './views/CreativeViews.jsx'
import StandardIndexView from './views/StandardIndex.jsx'
import { isAuthed, lock } from './lib/auth.js'
import { generateAssessment } from './lib/engine.js'
import { enrichAssessment } from './lib/engine-plus.js'
import { completeness } from './lib/utils.js'
import { EMPTY_CLIENT, EMPTY_NOTES } from './lib/constants.js'
import { uid, nowIso } from './lib/utils.js'
import { downloadPdf } from './lib/pdf.js'

function blankAssessment(client = {}) {
  return {
    id: uid(),
    status: 'draft',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    client: { ...EMPTY_CLIENT, ...client },
    assessment: null,
    internalNotes: { ...EMPTY_NOTES },
    humanReviewed: false,
    exportHistory: [],
    isDemo: false,
    clientId: client.id || '',
  }
}

function Shell() {
  const { os, patch, flash } = useOs()
  const [authed, setAuthed] = useState(() => isAuthed())
  const [view, setView] = useState('dashboard')
  const [menu, setMenu] = useState(false)
  const [step, setStep] = useState(1)
  const [tab, setTab] = useState('diagnosis')
  const [activeId, setActiveId] = useState(null)
  const [leadId, setLeadId] = useState(null)
  const [clientId, setClientId] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [generating, setGenerating] = useState(false)

  const active = os.assessments.find((a) => a.id === activeId) || null

  const go = (v) => { setView(v); setMenu(false) }

  const startIntake = (fromClient) => {
    const rec = blankAssessment(fromClient || {})
    patch('assessments', rec)
    setActiveId(rec.id)
    setStep(1)
    go('intake')
  }

  const persistActive = (partial) => {
    if (!active) return
    patch('assessments', { ...active, ...partial })
  }

  const runGenerate = () => {
    if (!active) return
    if (active.assessment && !window.confirm('Regenerate? Manual edits on the current draft will be replaced. Intake is kept.')) return
    setGenerating(true)
    setTimeout(() => {
      const raw = generateAssessment(active.client)
      const assessment = enrichAssessment(raw, active.client)
      persistActive({ assessment, status: 'review', humanReviewed: false })
      setTab('diagnosis')
      go('workspace')
      setGenerating(false)
    }, 400)
  }

  if (!authed) return <LockScreen onUnlock={() => setAuthed(true)} />

  const crumb = (
    <>
      <strong>Empyré</strong> · {view}
    </>
  )

  const actions = (
    <>
      {flash && <span className="save-pill">{flash}</span>}
      {view === 'workspace' && active && (
        <>
          <button className="btn small" onClick={() => go('intake')}>Edit intake</button>
          <button className="btn small" onClick={runGenerate}>Regenerate</button>
          <button className="btn small" onClick={() => {
            if (!active.humanReviewed && !confirm('Not reviewed. Export PDF as internal draft?')) return
            downloadPdf(active)
          }}>PDF</button>
        </>
      )}
    </>
  )

  return (
    <Layout
      view={view === 'workspace' ? 'assessments' : view === 'intake' ? 'intake' : view}
      setView={(v) => {
        if (v === 'intake') startIntake()
        else go(v)
      }}
      top={{ crumb, actions }}
      onMenu={{ open: menu, toggle: () => setMenu((m) => !m) }}
      onLock={() => { lock(); setAuthed(false) }}
      flash={flash}
    >
      {generating && (
        <div className="modal-back">
          <div className="modal" style={{ textAlign: 'center' }}>
            <p className="kicker">Elevation Engine</p>
            <h2 className="display">Reading the business. Drafting the standard.</h2>
            <p>A first draft, not finished work. Human review required before the client sees it.</p>
          </div>
        </div>
      )}

      {view === 'dashboard' && <DashboardView go={go} />}
      {view === 'pipeline' && <PipelineView onOpenLead={(id) => { setLeadId(id); go('leads') }} go={go} />}
      {view === 'leads' && <LeadsView openId={leadId} setOpenId={setLeadId} go={go} />}
      {view === 'clients' && <ClientsView openId={clientId} setOpenId={setClientId} go={(v) => { if (v === 'intake') startIntake(os.clients.find((c) => c.id === clientId)); else go(v) }} />}
      {view === 'assessments' && (
        <AssessmentsList
          items={os.assessments}
          onNew={() => startIntake()}
          onOpen={(id) => {
            setActiveId(id)
            const rec = os.assessments.find((a) => a.id === id)
            if (rec?.assessment) { setTab('diagnosis'); go('workspace') }
            else { setStep(1); go('intake') }
          }}
        />
      )}
      {view === 'intake' && active && (
        <Intake
          record={active}
          step={step}
          setStep={setStep}
          onChange={(client) => {
            const { score } = completeness(client)
            persistActive({
              client,
              status: active.assessment ? (active.humanReviewed ? 'client-ready' : 'review') : score >= 40 ? 'discovery' : 'draft',
            })
          }}
          onGenerate={runGenerate}
          saved={flash || 'Saved in this browser'}
        />
      )}
      {view === 'workspace' && active && (
        <Assessment
          record={active}
          tab={tab}
          setTab={setTab}
          onPatchAssessment={(assessment) => persistActive({ assessment })}
          onPatchNotes={(internalNotes) => persistActive({ internalNotes })}
          onPatchMeta={(meta) => persistActive(meta)}
          onRegenerate={runGenerate}
          onExportLog={(kind) => persistActive({ exportHistory: [{ kind, at: nowIso() }, ...(active.exportHistory || [])] })}
        />
      )}
      {view === 'index' && <StandardIndexView />}
      {view === 'directions' && <DirectionsView />}
      {view === 'moodboards' && <MoodBoardsView />}
      {view === 'proposals' && <ProposalsView />}
      {view === 'projects' && <ProjectsView openId={projectId} setOpenId={setProjectId} />}
      {view === 'tasks' && <TasksView />}
      {view === 'deliverables' && <DeliverablesView />}
      {view === 'approvals' && <ApprovalsView />}
      {view === 'meetings' && <MeetingsView />}
      {view === 'comms' && <CommsView />}
      {view === 'files' && <FilesView />}
      {view === 'calendar' && <CalendarView />}
      {view === 'standard' && <StudioStandard />}
      {view === 'settings' && <SettingsView />}
    </Layout>
  )
}

function AssessmentsList({ items, onNew, onOpen }) {
  return (
    <div className="page">
      <div className="kicker">Strategy</div>
      <h1 className="display">Brand assessments</h1>
      <p className="lede">Diagnose, direct, recommend. Human review before any client PDF.</p>
      <button className="btn primary" onClick={onNew}>Create Brand Assessment</button>
      <div className="library" style={{ marginTop: 16 }}>
        {items.map((it) => (
          <article className="card" key={it.id}>
            <div>
              <h3>{nameOfClient(it.client)}</h3>
              <div className="meta">
                <span className="badge gold">{it.assessment?.tier?.name || 'Intake'}</span>
                {it.humanReviewed && <span className="badge ok">CD reviewed</span>}
                {it.assessment?.evidence && <span>Evidence {it.assessment.evidence.score}</span>}
              </div>
            </div>
            <button className="btn small" onClick={() => onOpen(it.id)}>Open</button>
          </article>
        ))}
        {!items.length && (
          <div className="block">
            <p>No active elevation assessments. Begin with a client’s business reality. End with a brand built to rise.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <OsProvider>
      <Shell />
    </OsProvider>
  )
}
