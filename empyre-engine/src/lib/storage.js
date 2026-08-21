import { uid, nowIso } from './utils.js'
import { EMPTY_CLIENT, EMPTY_NOTES } from './constants.js'
import { storeGet, storeSet } from './store.js'

const KEY = 'empyre.elevation.v1'

function read() {
  try {
    const raw = storeGet(KEY)
    if (!raw) return { assessments: [] }
    const data = JSON.parse(raw)
    return { assessments: Array.isArray(data.assessments) ? data.assessments : [] }
  } catch {
    return { assessments: [] }
  }
}

function write(state) {
  storeSet(KEY, JSON.stringify(state))
}

export function listAssessments() {
  return read().assessments.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

export function getAssessment(id) {
  return read().assessments.find((a) => a.id === id) || null
}

export function saveAssessment(record) {
  const state = read()
  const i = state.assessments.findIndex((a) => a.id === record.id)
  const next = { ...record, updatedAt: nowIso() }
  if (i >= 0) state.assessments[i] = next
  else state.assessments.unshift(next)
  write(state)
  return next
}

export function deleteAssessment(id) {
  const state = read()
  state.assessments = state.assessments.filter((a) => a.id !== id)
  write(state)
}

export function createAssessment(partial = {}) {
  const record = {
    id: uid(),
    status: 'draft',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    client: { ...EMPTY_CLIENT, ...(partial.client || {}) },
    assessment: null,
    internalNotes: { ...EMPTY_NOTES },
    humanReviewed: false,
    exportHistory: [],
    isDemo: false,
    ...partial,
  }
  return saveAssessment(record)
}

export function duplicateAssessment(id, { includeAssessment = false, includeNotes = false } = {}) {
  const src = getAssessment(id)
  if (!src) return null
  const copy = {
    id: uid(),
    status: 'draft',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    client: {
      ...JSON.parse(JSON.stringify(src.client || EMPTY_CLIENT)),
      businessName: src.client?.businessName ? `${src.client.businessName} (copy)` : '',
    },
    assessment: includeAssessment && src.assessment ? JSON.parse(JSON.stringify(src.assessment)) : null,
    internalNotes: includeNotes ? JSON.parse(JSON.stringify(src.internalNotes || EMPTY_NOTES)) : { ...EMPTY_NOTES },
    humanReviewed: false,
    exportHistory: [],
    isDemo: false,
  }
  if (copy.assessment && !includeNotes) {
    copy.status = 'review'
  }
  return saveAssessment(copy)
}

export function exportAllJson() {
  return JSON.stringify(read(), null, 2)
}

export function importAllJson(json, { merge = true } = {}) {
  const incoming = typeof json === 'string' ? JSON.parse(json) : json
  const list = incoming.assessments || incoming
  if (!Array.isArray(list)) throw new Error('Invalid archive')
  const state = merge ? read() : { assessments: [] }
  const ids = new Set(state.assessments.map((a) => a.id))
  list.forEach((item) => {
    if (!item || !item.id) return
    if (ids.has(item.id)) item = { ...item, id: uid() }
    state.assessments.unshift(item)
  })
  write(state)
}

export function logExport(id, kind) {
  const rec = getAssessment(id)
  if (!rec) return
  rec.exportHistory = rec.exportHistory || []
  rec.exportHistory.unshift({ kind, at: nowIso() })
  saveAssessment(rec)
}
