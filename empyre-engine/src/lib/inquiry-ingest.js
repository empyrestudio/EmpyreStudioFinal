import { blankLead, blankComm, blankTask, blankFollowup, todayStr, addDays } from './os.js'
import { uid, nowIso } from './utils.js'

export function nextBusinessDay(from = new Date(), days = 1) {
  const d = new Date(from)
  let left = days
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) left -= 1
  }
  return d.toISOString().slice(0, 10)
}

function normEmail(s) {
  return String(s || '').trim().toLowerCase()
}
function normName(s) {
  return String(s || '').trim().toLowerCase()
}
function domainOf(url) {
  try {
    const u = String(url || '').trim()
    if (!u) return ''
    const href = u.includes('://') ? u : `https://${u}`
    return new URL(href).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function displayName(p) {
  return (p.businessName || p.fullName || p.contactName || 'Website inquiry').trim()
}

export function findDuplicate(os, payload) {
  const email = normEmail(payload.email)
  const domain = domainOf(payload.website)
  const biz = normName(payload.businessName)
  const openLead = (os.leads || []).find((l) => {
    if (['lost', 'archived'].includes(l.status) || l.retention === 'Archived') return false
    if (email && normEmail(l.email) === email) return true
    if (domain && domainOf(l.website) && domainOf(l.website) === domain) return true
    if (biz && normName(l.businessName) === biz) return true
    return false
  })
  const client = (os.clients || []).find((c) => {
    if (c.retention === 'Archived') return false
    if (email && normEmail(c.email) === email) return true
    if (domain && domainOf(c.website) && domainOf(c.website) === domain) return true
    if (biz && normName(c.businessName) === biz) return true
    return false
  })
  return { openLead, client }
}

function fillEmpty(target, updates) {
  const next = { ...target }
  Object.entries(updates).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    if (next[k] === undefined || next[k] === null || next[k] === '') next[k] = v
  })
  return next
}

export function ingestWebsiteInquiry(os, payload, opts = {}) {
  const owner = opts.owner || os.settings?.ownerName || 'Empyré'
  const stage = opts.defaultStage || 'inquiry'
  const followDays = Number(opts.followupDays) || 1
  const when = payload.submittedAt || nowIso()
  const due = nextBusinessDay(new Date(when), followDays)
  const name = displayName(payload)
  const { openLead, client } = findDuplicate(os, payload)
  const notice = {
    id: uid(),
    at: when,
    kind: 'website-inquiry',
    title: `New website inquiry from ${name}`,
    unread: true,
    leadId: '',
  }

  const commBase = {
    ...blankComm(),
    date: when.slice(0, 10),
    type: 'Website inquiry',
    direction: 'Incoming',
    subject: `New inquiry from ${name}`,
    summary: payload.message || payload.challenge || '',
    contact: payload.fullName || payload.contactName || '',
    outcome: `Source: ${payload.landingPage || payload.sourceUrl || 'empyrestudio.com'}`,
    internalOnly: false,
  }

  const event = {
    id: uid(),
    at: when,
    title: 'Website inquiry received',
    detail: `${payload.formName || 'Website inquiry'} · ${payload.serviceInterest || payload.projectType || '—'} · ${payload.landingPage || 'empyrestudio.com'}`,
  }

  const leadFields = {
    contactName: payload.fullName || payload.contactName || '',
    businessName: payload.businessName || '',
    email: payload.email || '',
    phone: payload.phone || '',
    website: payload.website || '',
    socials: payload.socials || payload.instagram || '',
    industry: payload.industry || '',
    location: payload.location || '',
    desiredService: payload.serviceInterest || payload.projectType || '',
    budget: payload.budget || '',
    timeline: payload.timeline || '',
    notes: payload.challenge || '',
    inquirySource: 'empyrestudio.com',
    referralSource: payload.referralSource || 'Website Inquiry',
    sourceUrl: payload.landingPage || payload.sourceUrl || 'https://empyrestudio.com',
    utmSource: payload.utmSource || '',
    utmMedium: payload.utmMedium || '',
    utmCampaign: payload.utmCampaign || '',
    utmTerm: payload.utmTerm || '',
    utmContent: payload.utmContent || '',
    formName: payload.formName || 'Website inquiry',
    consent: payload.consent === true || payload.consent === 'true' || payload.consent === 'on',
    spamStatus: payload.spamStatus || 'clear',
    rawInquiry: payload.raw || payload,
  }

  if (openLead) {
    const updated = fillEmpty({ ...openLead }, leadFields)
    updated.lastContact = when.slice(0, 10)
    updated.nextAction = 'Review new website inquiry'
    updated.events = [event, ...(openLead.events || [])].slice(0, 80)
    const comm = { ...commBase, leadId: openLead.id, clientId: openLead.clientId || client?.id || '' }
    const hasFollow = (os.tasks || []).some((t) => t.leadId === openLead.id && t.status !== 'Completed' && t.status !== 'Cancelled')
      || (os.followups || []).some((f) => f.leadId === openLead.id && f.status !== 'Completed')
    const tasks = [...(os.tasks || [])]
    const followups = [...(os.followups || [])]
    if (!hasFollow) {
      tasks.unshift(blankTask({
        title: `Respond to website inquiry — ${name}`,
        description: 'Review inquiry, qualify the lead, and send discovery-call response.',
        priority: 'High',
        due,
        status: 'Not started',
        leadId: openLead.id,
        owner,
        tags: 'website-inquiry',
      }))
      followups.unshift({ ...blankFollowup(), leadId: openLead.id, title: `Respond to website inquiry — ${name}`, due, kind: 'Website inquiry' })
    }
    notice.leadId = openLead.id
    return {
      action: 'updated',
      leadId: openLead.id,
      os: {
        ...os,
        leads: os.leads.map((l) => (l.id === openLead.id ? updated : l)),
        comms: [comm, ...(os.comms || [])],
        tasks,
        followups,
        notifications: [notice, ...(os.notifications || [])].slice(0, 80),
      },
    }
  }

  if (client) {
    const lead = {
      ...blankLead(),
      ...leadFields,
      status: stage,
      owner,
      health: 'Stable',
      priority: 'Medium',
      nextAction: 'Review new website inquiry (existing client)',
      nextFollowUp: due,
      lastContact: when.slice(0, 10),
      inquiryDate: when.slice(0, 10),
      events: [event],
      clientId: client.id,
    }
    const comm = { ...commBase, leadId: lead.id, clientId: client.id }
    const task = blankTask({
      title: `Respond to website inquiry — ${name}`,
      description: 'Existing client. Review inquiry, qualify, and respond.',
      priority: 'High',
      due,
      leadId: lead.id,
      owner,
      tags: 'website-inquiry',
    })
    const clients = os.clients.map((c) => (c.id === client.id
      ? { ...c, events: [event, ...(c.events || [])].slice(0, 80), lastTouch: when.slice(0, 10) }
      : c))
    notice.leadId = lead.id
    return {
      action: 'client-request',
      leadId: lead.id,
      os: {
        ...os,
        clients,
        leads: [lead, ...(os.leads || [])],
        comms: [comm, ...(os.comms || [])],
        tasks: [task, ...(os.tasks || [])],
        followups: [{ ...blankFollowup(), leadId: lead.id, title: task.title, due, kind: 'Website inquiry' }, ...(os.followups || [])],
        notifications: [notice, ...(os.notifications || [])].slice(0, 80),
      },
    }
  }

  const lead = {
    ...blankLead(),
    ...leadFields,
    leadName: payload.fullName || '',
    status: stage,
    owner,
    health: 'Stable',
    priority: 'Medium',
    nextAction: 'Review new website inquiry',
    nextFollowUp: due,
    lastContact: when.slice(0, 10),
    inquiryDate: when.slice(0, 10),
    events: [event],
  }
  const comm = { ...commBase, leadId: lead.id }
  const task = blankTask({
    title: `Respond to website inquiry — ${name}`,
    description: 'Review inquiry, qualify the lead, and send discovery-call response.',
    priority: 'High',
    due,
    leadId: lead.id,
    owner,
    tags: 'website-inquiry',
  })
  notice.leadId = lead.id
  return {
    action: 'created',
    leadId: lead.id,
    os: {
      ...os,
      leads: [lead, ...(os.leads || [])],
      comms: [comm, ...(os.comms || [])],
      tasks: [task, ...(os.tasks || [])],
      followups: [{ ...blankFollowup(), leadId: lead.id, title: task.title, due, kind: 'Website inquiry' }, ...(os.followups || [])],
      notifications: [notice, ...(os.notifications || [])].slice(0, 80),
    },
  }
}

export { todayStr, addDays }
