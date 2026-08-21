import { uid, nowIso, filled } from './utils.js'
import { storeGet, storeSet } from './store.js'
import { HEALTH } from './os-constants.js'
import { EMPTY_CLIENT } from './constants.js'

export const OS_KEY = 'empyre.os.v2'
export const LEGACY_KEY = 'empyre.elevation.v1'

export const EMPTY_OS = {
  leads: [],
  clients: [],
  assessments: [],
  projects: [],
  tasks: [],
  deliverables: [],
  meetings: [],
  comms: [],
  files: [],
  moodboards: [],
  proposals: [],
  approvals: [],
  followups: [],
  notes: [],
  indexes: [],
  notifications: [],
  settings: {
    studioName: 'Empyré Studio',
    ownerName: 'SaMiaya',
    capacity: 'Available',
    confidentiality: 'Confidential — Empyré Studio internal',
    inquiryForm: 'Website inquiry — empyrestudio.com',
    inquiryDefaultStage: 'inquiry',
    inquiryOwner: '',
    inquiryFollowupDays: 1,
    inquiryNotify: true,
    inquiryLastOk: '',
    inquiryLastFail: '',
    ingestKey: '',
    ingestedInquiryIds: [],
  },
}

export function blankLead() {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    leadName: '', businessName: '', contactName: '', email: '', phone: '',
    website: '', socials: '', location: '', industry: '',
    referralSource: '', inquirySource: '', inquiryDate: '', owner: 'Empyré',
    desiredService: '', recommendedTier: '', budget: '', timeline: '',
    urgency: '', status: 'inquiry', estimatedValue: '', probability: '',
    nextFollowUp: '', lastContact: '', notes: '', tags: '',
    retention: 'Active', internalNotes: '',
  }
}

export function blankClient() {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    ...EMPTY_CLIENT,
    legalName: '', contactName: '', email: '', phone: '',
    address: '', teamSize: '', clientSince: '', referralSource: '',
    preferredComm: '', timezone: '', billingNotes: '',
    logoStatus: '', approvalProcess: '', decisionMakers: '',
    relationshipHealth: 'Stable', commFrequency: '', lastTouch: '',
    nextFollowUp: '', workingStyle: '', stakeholders: '',
    riskFlags: '', futureServices: '', retainerPotential: '',
    referralPotential: '', retention: 'Active',
    additionalContacts: '', events: [],
  }
}

export function blankProject(clientId = '') {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    name: '', clientId, type: 'Identity Transformation', tier: 'identity',
    owner: 'Empyré', startDate: '', targetDate: '', launchDate: '',
    status: 'Not started', health: 'On track', processStage: 'discovery',
    progress: 0, budget: '', invoiceStatus: '', scope: '', objectives: '',
    success: '', stakeholders: '', approvalOwner: '',
    clientStatus: '', internalStatus: '', risks: '', blockers: '',
    healthOverride: '', healthReason: '', retention: 'Active',
  }
}

export function blankTask(extra = {}) {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    title: '', description: '', clientId: '', projectId: '',
    tier: '', processStage: '', deliverableId: '',
    owner: 'Empyré', assignee: '', priority: 'Medium',
    status: 'Not started', due: '', start: '',
    estimate: '', actual: '', deps: '', blockers: '', tags: '',
    internalNote: '', clientVisible: false, recurring: false,
    reminder: '', completedAt: '', ...extra,
  }
}

export function blankDeliverable(extra = {}) {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    name: '', projectId: '', clientId: '', stage: '',
    status: 'Planned', priority: 'High', owner: 'Empyré',
    approver: '', version: '0.1', reviewDue: '', deliveryDate: '',
    internalNotes: '', clientNotes: '', revisionCount: 0,
    approvalStatus: 'Not requested', deps: '', scopeStatus: 'In scope',
    clientVisible: false, signatureComponent: '', ...extra,
  }
}

export function blankMeeting() {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    title: '', clientId: '', projectId: '', attendees: '',
    when: '', type: 'Check-in', agenda: '', notes: '',
    decisions: '', actions: '', questions: '', risks: '',
    feedback: '', followUp: '', recording: '',
    internalOnly: true, clientSummary: false,
  }
}

export function blankComm() {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    date: nowIso().slice(0, 10), clientId: '', leadId: '', contact: '',
    type: 'Email', subject: '', summary: '', direction: 'Outgoing',
    projectId: '', taskId: '', deliverableId: '', followUp: '',
    outcome: '', internalOnly: false,
  }
}

export function blankProposal() {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    clientId: '', leadId: '', assessmentId: '', projectId: '',
    tier: '', deliverables: '', scope: '', timeline: '', milestones: '',
    assumptions: '', exclusions: '', addons: '', futurePhase: '',
    retainer: '', notes: '', pricingNotes: '', clientScope: '',
    status: 'Draft',
  }
}

export function blankApproval() {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    item: '', summary: '', clientId: '', projectId: '',
    sent: '', deadline: '', decisionMaker: '',
    status: 'Not requested', feedback: '', revision: '',
    response: '', approvedAt: '', proof: '',
  }
}

export function blankFollowup() {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    title: '', kind: 'New lead follow-up', clientId: '', leadId: '',
    due: '', status: 'Not started', notes: '',
  }
}

export function blankNote(recordType, recordId) {
  return {
    id: uid(), createdAt: nowIso(), updatedAt: nowIso(),
    recordType, recordId, category: 'Strategy', body: '',
  }
}

export function loadOs() {
  try {
    const raw = storeGet(OS_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      const settings = { ...EMPTY_OS.settings, ...(data.settings || {}) }
      if (!settings.ownerName || settings.ownerName === 'Samia') settings.ownerName = 'SaMiaya'
      return { ...EMPTY_OS, ...data, settings, indexes: data.indexes || [], notifications: data.notifications || [] }
    }
  } catch { /* ignore */ }
  const os = { ...EMPTY_OS }
  try {
    const legacy = storeGet(LEGACY_KEY)
    if (legacy) {
      const data = JSON.parse(legacy)
      if (Array.isArray(data.assessments)) os.assessments = data.assessments
    }
  } catch { /* ignore */ }
  return os
}

export function saveOs(os) {
  storeSet(OS_KEY, JSON.stringify({ ...os, savedAt: nowIso() }))
}

export function upsert(list, record) {
  const i = list.findIndex((x) => x.id === record.id)
  const next = { ...record, updatedAt: nowIso() }
  if (i >= 0) {
    const copy = list.slice()
    copy[i] = next
    return copy
  }
  return [next, ...list]
}

export function removeId(list, id) {
  return list.filter((x) => x.id !== id)
}

export function nameOfClient(c) {
  return (c?.businessName || c?.leadName || c?.contactName || 'Untitled').trim() || 'Untitled'
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function isOverdue(date, status) {
  if (!date) return false
  if (['Completed', 'Cancelled', 'Approved', 'Delivered', 'Archived'].includes(status)) return false
  return date < todayStr()
}

export function daysSince(iso) {
  if (!iso) return 999
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 999
  return Math.floor((Date.now() - t) / 86400000)
}

export function calcHealth(project, tasks = []) {
  if (project.healthOverride) return project.healthOverride
  if (['Completed', 'Archived'].includes(project.status)) return project.status === 'Completed' ? 'Completed' : 'Archived'
  if (project.status === 'On hold') return 'Paused'
  const pts = tasks.filter((t) => t.projectId === project.id)
  const overdue = pts.filter((t) => isOverdue(t.due, t.status))
  const dueSoon = pts.filter((t) => t.due && t.due <= addDays(todayStr(), 3) && t.status !== 'Completed')
  const waitingClient = pts.some((t) => t.status === 'Waiting on client')
  const waitingTeam = pts.some((t) => t.status === 'Waiting on team')
  const inactive = daysSince(project.updatedAt) >= 7
  if (overdue.length >= 2 || project.blockers) return 'At risk'
  if (waitingClient) return 'Waiting on client'
  if (waitingTeam) return 'Waiting on Empyré'
  if (overdue.length || dueSoon.length || inactive) return 'Needs attention'
  return 'On track'
}

export function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function capacityFrom(projects) {
  const active = projects.filter((p) => !['Completed', 'Archived', 'On hold'].includes(p.status)).length
  if (active >= 8) return 'At capacity'
  if (active >= 5) return 'Near capacity'
  return 'Available'
}

export function evidenceScore(client = {}) {
  const checks = [
    ['businessName', 6], ['primaryOffer', 8], ['businessModel', 5],
    ['primaryAudience', 8], ['desiredAction', 5], ['location', 4],
    ['strengths', 5], ['challenges', 6], ['competitors', 6],
    ['differentiators', 7], ['goals', 6], ['conversionGoal', 6],
    ['timeline', 4], ['budget', 4], ['customerLanguage', 7],
    ['analytics', 6], ['website', 5], ['assets', 6],
  ]
  let score = 0
  const missing = []
  checks.forEach(([k, w]) => {
    const v = client[k]
    const ok = k === 'assets' ? Array.isArray(v) && v.length > 0 : filled(v)
    if (ok) score += w
    else missing.push(k)
  })
  score = Math.min(100, score)
  const band = score >= 80 ? 'Strong evidence base'
    : score >= 60 ? 'Good working basis; validate key assumptions'
    : score >= 40 ? 'Directional only; research needed before final identity work'
    : 'Discovery-first; recommend Brand Clarity Sprint before definitive recommendations'
  return { score, band, missing }
}

export function defaultDeliverablesFor(tierId, clientId, projectId) {
  const map = {
    sprint: ['Discovery intake', 'Competitor review', 'Audience profile', 'Positioning', 'Voice and tone', 'Visual direction brief', 'Brand Clarity Map', 'Strategic debrief'],
    identity: ['Brand strategy', 'Logo exploration', 'Primary logo', 'Secondary marks', 'Logo variations', 'Color palette', 'Typography', 'Graphic language', 'Messaging framework', 'Tagline options', 'Voice and tone', 'Brand Bible', 'Identity Guidelines', 'Verbal Playbook', 'Asset Suite', 'Brand Briefing'],
    launch: ['Launch strategy', 'Messaging rollout', 'Website creative direction', 'Social content templates', 'Announcement assets', 'Presentation deck', 'Email signature', 'Launch Toolkit', 'Launch debrief'],
    steward: ['Monthly strategy session', 'Brand review', 'Content calendar', 'Campaign direction', 'Asset creation', 'Template updates', 'Quarterly brand review'],
  }
  return (map[tierId] || map.identity).map((name) => blankDeliverable({ name, clientId, projectId, status: 'Planned' }))
}

export function logEvent(client, title) {
  const events = Array.isArray(client.events) ? client.events : []
  return { ...client, events: [{ id: uid(), at: nowIso(), title }, ...events].slice(0, 80) }
}
