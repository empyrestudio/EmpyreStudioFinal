import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  EMPTY_OS, loadOs, saveOs, upsert, removeId, calcHealth, capacityFrom, todayStr, isOverdue, daysSince,
} from './os.js'
import { ingestWebsiteInquiry } from './inquiry-ingest.js'

const Ctx = createContext(null)

export function OsProvider({ children }) {
  const [os, setOs] = useState(() => loadOs())
  const [flash, setFlash] = useState('')

  const apply = useCallback((updater) => {
    setOs((prev) => {
      const draft = updater(prev)
      const withHealth = {
        ...draft,
        settings: { ...draft.settings, capacity: capacityFrom(draft.projects || []) },
        projects: (draft.projects || []).map((p) => ({ ...p, health: calcHealth(p, draft.tasks || []) })),
      }
      saveOs(withHealth)
      setFlash('Saved')
      setTimeout(() => setFlash(''), 900)
      return withHealth
    })
  }, [])

  const patch = useCallback((key, record) => {
    apply((prev) => ({ ...prev, [key]: upsert(prev[key] || [], record) }))
  }, [apply])

  const drop = useCallback((key, id) => {
    apply((prev) => ({ ...prev, [key]: removeId(prev[key] || [], id) }))
  }, [apply])

  const setSettings = useCallback((settings) => {
    apply((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }))
  }, [apply])

  const resetAll = useCallback(() => apply(() => ({ ...EMPTY_OS })), [apply])

  const ingestPending = useCallback(async () => {
    try {
      const headers = { Accept: 'application/json' }
      const key = loadOs().settings?.ingestKey
      if (key) headers['X-Empyre-Ingest-Key'] = key
      const res = await fetch('/api/inquiries/pending', { headers })
      if (!res.ok) {
        apply((prev) => ({
          ...prev,
          settings: { ...prev.settings, inquiryLastFail: new Date().toISOString() },
        }))
        return { ok: false, count: 0 }
      }
      const data = await res.json()
      const list = data.inquiries || []
      if (!list.length) return { ok: true, count: 0 }
      const ids = []
      apply((prev) => {
        const seen = new Set(prev.settings?.ingestedInquiryIds || [])
        let next = prev
        list.forEach((inq) => {
          if (seen.has(inq.id)) return
          const result = ingestWebsiteInquiry(next, inq, {
            owner: prev.settings?.inquiryOwner || prev.settings?.ownerName,
            defaultStage: prev.settings?.inquiryDefaultStage || 'inquiry',
            followupDays: prev.settings?.inquiryFollowupDays || 1,
          })
          next = result.os
          seen.add(inq.id)
          ids.push(inq.id)
        })
        next.settings = {
          ...next.settings,
          inquiryLastOk: new Date().toISOString(),
          ingestedInquiryIds: [...seen].slice(-400),
        }
        return next
      })
      await fetch('/api/inquiries/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Empyre-Ingest-Key': key } : {}) },
        body: JSON.stringify({ ids }),
      })
      return { ok: true, count: list.length }
    } catch {
      apply((prev) => ({
        ...prev,
        settings: { ...prev.settings, inquiryLastFail: new Date().toISOString() },
      }))
      return { ok: false, count: 0 }
    }
  }, [apply])

  useEffect(() => {
    ingestPending()
    const t = setInterval(ingestPending, 20000)
    return () => clearInterval(t)
  }, [ingestPending])

  const metrics = useMemo(() => derive(os), [os])

  return (
    <Ctx.Provider value={{ os, patch, drop, apply, setSettings, resetAll, flash, metrics, ingestPending }}>
      {children}
    </Ctx.Provider>
  )
}

export function useOs() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useOs')
  return v
}

export function nameOfClient(c) {
  return (c?.businessName || c?.leadName || c?.contactName || 'Untitled').trim() || 'Untitled'
}

function derive(os) {
  const leads = os.leads.filter((l) => l.retention !== 'Archived' && l.status !== 'archived' && l.status !== 'lost')
  const clients = os.clients.filter((c) => c.retention !== 'Archived')
  const projects = os.projects.filter((p) => p.status !== 'Archived')
  const tasks = os.tasks
  const today = todayStr()
  const overdueTasks = tasks.filter((t) => isOverdue(t.due, t.status))
  const needFollow = [
    ...os.leads.filter((l) => l.nextFollowUp && l.nextFollowUp <= today && l.status !== 'won' && l.status !== 'lost'),
    ...os.followups.filter((f) => f.due && f.due <= today && f.status !== 'Completed'),
  ]
  return {
    leads, clients, projects,
    leadCount: leads.length,
    clientCount: clients.length,
    projectCount: projects.length,
    onTrack: projects.filter((p) => p.health === 'On track').length,
    attention: projects.filter((p) => ['Needs attention', 'At risk'].includes(p.health)).length,
    waitingClient: projects.filter((p) => p.health === 'Waiting on client').length,
    overdueTasks: overdueTasks.length,
    dueToday: tasks.filter((t) => t.due === today && t.status !== 'Completed').length,
    pendingApprovals: os.approvals.filter((a) => ['Sent', 'Viewed', 'Feedback received'].includes(a.status)).length,
    staleProjects: projects.filter((p) => daysSince(p.updatedAt) >= 7 && !['Completed', 'On hold'].includes(p.status)),
    needFollow,
    meetingsSoon: os.meetings.filter((m) => m.when && m.when.slice(0, 10) >= today).slice(0, 5),
    incompleteIntake: os.assessments.filter((a) => a.status === 'draft' || a.status === 'discovery'),
    overdueList: overdueTasks,
    capacity: os.settings?.capacity || capacityFrom(projects),
  }
}
