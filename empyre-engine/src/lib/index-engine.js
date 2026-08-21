import { uid, nowIso } from './utils.js'

export const PILLARS = [
  { id: 'strategic', name: 'Strategic Clarity', weight: 12, asks: 'Positioning, audience, offer, differentiation, promise, price/value signaling.' },
  { id: 'messaging', name: 'Messaging Authority', weight: 10, asks: 'Headline, value proposition, voice, specificity, persuasion, consistency.' },
  { id: 'visual', name: 'Visual Distinction', weight: 12, asks: 'Logo, type, color, image, art direction, memorability, category difference.' },
  { id: 'system', name: 'System Consistency', weight: 10, asks: 'Visual and verbal rules, reusable system, cross-channel cohesion, guidelines.' },
  { id: 'digital', name: 'Digital Presence', weight: 12, asks: 'First impression, navigation, UX, mobile, IA, CTA, polish.' },
  { id: 'trust', name: 'Trust and Credibility', weight: 10, asks: 'Proof, reviews, credentials, team presence, transparency.' },
  { id: 'experience', name: 'Customer Experience', weight: 10, asks: 'Inquiry/booking friction, information access, journey, confidence.' },
  { id: 'market', name: 'Market Position', weight: 8, asks: 'Differentiation, premium perception, audience fit, authority.' },
  { id: 'content', name: 'Content and Visibility', weight: 8, asks: 'Content quality, search/topic clarity, presence, portfolio depth.' },
  { id: 'scale', name: 'Scale Readiness', weight: 8, asks: 'System maturity, assets, handover, internal adoption, maintainability.' },
]

export const INDEX_STATUS = [
  { max: 39, id: 'foundation', label: 'Foundation Required' },
  { max: 59, id: 'inconsistent', label: 'Inconsistent Expression' },
  { max: 74, id: 'emerging', label: 'Emerging Standard' },
  { max: 89, id: 'established', label: 'Established Presence' },
  { max: 100, id: 'defining', label: 'Category-Defining System' },
]

export const EVIDENCE_STATUS = ['Observed', 'Client-reported', 'Expert inference', 'Not yet verified']
export const CONFIDENCE = ['High', 'Medium', 'Low']
export const SEVERITY = ['Critical', 'High', 'Medium', 'Low']
export const TOUCH_STATES = ['Strong', 'Inconsistent', 'Weak', 'Missing', 'Not assessed']
export const TOUCHPOINTS = ['Website', 'Social', 'Packaging', 'Print', 'Email', 'Sales material', 'Reviews', 'In-person environment', 'Customer journey', 'Brand assets', 'Content system', 'Internal documentation']
export const INTERVENTIONS = [
  'Brand strategy', 'Positioning', 'Messaging', 'Naming', 'Tagline', 'Verbal identity',
  'Logo system', 'Color system', 'Typography', 'Art direction', 'Photography direction',
  'Packaging', 'Print collateral', 'Website strategy', 'Website design', 'Website development',
  'Social-media system', 'Launch campaign', 'Brand guidelines', 'Brand Bible', 'Brand handover',
  'Ongoing Brand Stewardship',
]
export const DIAG_TYPES = ['Baseline', 'Mid-project', 'Final', 'Post-launch', 'Stewardship review']
export const PROJ_STAGES = ['Prospect', 'Discovery', 'In Progress', 'Delivered', 'Post-launch Review']
export const REPORT_STATUS = ['Draft', 'Internal review', 'Client-ready', 'Locked']
export const INDEX_ROLES = [
  { id: 'admin', label: 'Empyré Admin' },
  { id: 'strategist', label: 'Empyré Strategist / Designer' },
  { id: 'client', label: 'Client Viewer' },
]

export function statusFor(score) {
  const n = Number(score) || 0
  return INDEX_STATUS.find((s) => n <= s.max) || INDEX_STATUS[INDEX_STATUS.length - 1]
}

export function weighted(raw, weight) {
  const r = Math.max(1, Math.min(10, Number(raw) || 1))
  return Math.round((r * weight / 10) * 10) / 10
}

export function totalFrom(pillars) {
  return Math.round(PILLARS.reduce((sum, p) => {
    const row = pillars?.[p.id] || {}
    return sum + weighted(row.raw ?? 1, p.weight)
  }, 0))
}

export function blankPillars(defaults = {}) {
  const o = {}
  PILLARS.forEach((p) => {
    o[p.id] = {
      raw: defaults[p.id] ?? 4,
      override: '',
      overrideReason: '',
      evidence: '',
      confidence: 'Medium',
      status: 'Expert inference',
      scoredBy: 'Empyré',
      scoredAt: nowIso(),
    }
  })
  return o
}

export function blankIndex(prefill = {}) {
  return {
    id: uid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isSample: false,
    clientId: '',
    leadId: '',
    projectId: '',
    assessmentId: '',
    brandName: '',
    industry: '',
    website: '',
    location: '',
    projectStatus: 'Prospect',
    projectType: 'Identity Transformation',
    contactName: '',
    contactEmail: '',
    launchDate: '',
    leadName: 'Empyré',
    diagnosticDate: nowIso().slice(0, 10),
    diagnosticType: 'Baseline',
    offer: '',
    highValue: '',
    audience: '',
    problem: '',
    differentiation: '',
    growthGoal: '',
    conversion: '',
    conversion2: '',
    competitors: '',
    obstacles: '',
    desiredPerception: '',
    priceNow: '',
    priceWant: '',
    geo: '',
    channels: '',
    proof: '',
    attributes: '',
    avoid: '',
    voice: '',
    emotion: '',
    position: '',
    promise: '',
    taglineNow: '',
    taglineWant: '',
    hasGuidelines: 'No',
    hasAssets: 'No',
    logoStatus: '',
    websiteStatus: '',
    photoStatus: '',
    interventions: [],
    evidence: [],
    strengths: [],
    gaps: [],
    touchpoints: Object.fromEntries(TOUCHPOINTS.map((t) => [t, { state: 'Not assessed', note: '' }])),
    pillarsBefore: blankPillars(),
    pillarsAfter: blankPillars({ strategic: 4, messaging: 4, visual: 4, system: 4, digital: 4, trust: 4, experience: 4, market: 4, content: 4, scale: 4 }),
    afterEnabled: false,
    comparisons: [],
    readerNotes: [],
    history: [{ id: uid(), at: nowIso(), user: 'Empyré', summary: 'Diagnostic created', previous: '', updated: 'Draft', visibility: 'internal' }],
    reportStatus: 'Draft',
    locked: false,
    clientPortal: false,
    commentsOn: false,
    reviewed: false,
    perceptionDesired: '',
    perceptionObserved: '',
    perceptionGap: '',
    afterNarrative: '',
    remaining: '',
    closing: '',
    internalRisks: '',
    upsell: '',
    ...prefill,
  }
}

export function addHistory(rec, summary, extra = {}) {
  return {
    ...rec,
    history: [{ id: uid(), at: nowIso(), user: extra.user || 'Empyré', summary, previous: extra.previous || '', updated: extra.updated || '', visibility: extra.visibility || 'internal' }, ...(rec.history || [])].slice(0, 80),
  }
}

export function runReader(rec) {
  const total = totalFrom(rec.pillarsBefore)
  const st = statusFor(total)
  const missing = []
  if (!rec.offer) missing.push('What the business sells')
  if (!rec.audience) missing.push('Ideal customer')
  if (!rec.website && !(rec.evidence || []).length) missing.push('Website URL or before evidence')
  const findings = [
    {
      id: uid(),
      finding: rec.offer
        ? `Based on visible and client-reported information, the offer is described as: ${rec.offer.slice(0, 180)}`
        : 'The offer is not yet stated with enough specificity to brief identity or the site.',
      evidence: rec.offer ? 'Client-reported' : 'Not yet verified',
      implication: 'Without a held offer, visual work becomes decoration.',
      action: rec.offer ? 'Lock a one-sentence offer before identity exploration.' : 'Complete business-reality intake before scoring Visual Distinction above 5.',
      confidence: rec.offer ? 'Medium' : 'Low',
      status: rec.offer ? 'Client-reported' : 'Not yet verified',
      pillar: 'strategic',
      review: true,
    },
    {
      id: uid(),
      finding: 'The current experience appears to carry more activity than a held standard. This is an expert assessment, not a measured performance result.',
      evidence: 'Expert inference from available fields and assets.',
      implication: 'Prospects may not understand why this option over a nearer, louder, or cheaper one.',
      action: 'Build the Brand Clarity Map before a logo lock.',
      confidence: 'Medium',
      status: 'Expert inference',
      pillar: 'messaging',
      review: true,
    },
  ]
  const strengths = rec.strengths?.length ? rec.strengths : [
    { id: uid(), title: 'A real offer exists to build on', evidence: rec.offer || 'Client-reported existence of the business.', why: 'Identity needs something true.', action: 'Preserve specificity; do not genericize.', touch: 'Brand assets', clientVisible: true },
  ]
  const gaps = rec.gaps?.length ? rec.gaps : [
    { id: uid(), category: 'Positioning', severity: 'High', finding: 'The premium or serious promise is not consistently supported across identity, messaging, and digital.', evidence: 'Expert inference from incomplete system fields.', consequence: 'The brand is chosen later, or not at all, in a comparison.', implication: 'A sprint or identity transformation is warranted before launch theatre.', response: 'Lock positioning, then identity, then site hierarchy.', pillar: 'strategic', intervention: 'Positioning', clientVisible: true },
    { id: uid(), category: 'Digital', severity: 'High', finding: 'Conversion hierarchy appears unclear. Validation through analytics is recommended.', evidence: 'Not yet verified unless analytics were supplied.', consequence: 'Enquiries stall at the first screen.', implication: 'A single primary action should sit in the hero.', response: 'Rewrite homepage hierarchy around one action.', pillar: 'digital', intervention: 'Website strategy', clientVisible: true },
  ]
  const perception = {
    desired: rec.desiredPerception || rec.perceptionDesired || 'A specific, trusted option in its band.',
    observed: rec.perceptionObserved || 'Visually inconsistent expression with unclear offer hierarchy.',
    gap: rec.perceptionGap || 'The intended standard is not yet visible in the artefacts a stranger would see.',
  }
  const nextTier = total < 40 ? 'Brand Clarity Sprint' : total < 75 ? 'Identity Transformation' : 'Brand Stewardship'
  return {
    missing,
    status: st,
    total,
    findings,
    strengths,
    gaps,
    perception,
    nextTier,
    note: 'The Standard Reader drafts. Empyré reviews. Nothing here is a guarantee of revenue, rankings, or sentiment.',
  }
}

export function sampleIndex() {
  const before = blankPillars({
    strategic: 3, messaging: 3, visual: 3, system: 2, digital: 3,
    trust: 4, experience: 3, market: 4, content: 3, scale: 2,
  })
  const after = blankPillars({
    strategic: 8, messaging: 8, visual: 8, system: 8, digital: 8,
    trust: 7, experience: 8, market: 7, content: 6, scale: 8,
  })
  const rec = blankIndex({
    isSample: true,
    brandName: 'Maison Vale',
    industry: 'Restaurant & Dining',
    website: 'https://example.invalid/maison-vale',
    location: 'A named city (fictional)',
    projectStatus: 'Delivered',
    projectType: 'Signature Launch Suite',
    contactName: 'A. Vale',
    contactEmail: 'studio@example.invalid',
    diagnosticType: 'Post-launch',
    offer: 'A seasonal dining room — tasting menu and a short bar — for guests who plan an evening, not a drop-in.',
    audience: 'Diners who choose rooms, not trends.',
    problem: 'The previous expression read as a concept restaurant, not a held house.',
    differentiation: 'Sequence of arrival, a named method, a room that behaves.',
    conversion: 'Reserve',
    desiredPerception: 'A serious dining room. Warmth with standards.',
    perceptionDesired: 'Premium, trusted, modern hospitality brand',
    perceptionObserved: 'Visually inconsistent local business with unclear offer hierarchy',
    perceptionGap: 'The premium promise was not consistently supported by identity, messaging, proof, or digital experience.',
    attributes: 'Held, precise, hospitable, seasonal, quiet',
    avoid: 'Foodie, hidden gem, vibe, farm-to-table as slogan',
    voice: 'Host voice. Concrete. Calm tempo.',
    interventions: ['Brand strategy', 'Positioning', 'Verbal identity', 'Logo system', 'Color system', 'Typography', 'Website strategy', 'Website design', 'Brand guidelines', 'Brand Bible', 'Brand handover'],
    pillarsBefore: before,
    pillarsAfter: after,
    afterEnabled: true,
    reportStatus: 'Client-ready',
    reviewed: true,
    afterNarrative: 'Maison Vale now communicates as a house: offer first, room second, proof third. The system is documented so the standard can be kept after handover.',
    remaining: 'Analytics after 30 days of live reservations; photography production beyond the launch set; Brand Stewardship if the calendar begins to drift.',
    closing: 'Before the engagement, Maison Vale had an offer without a held expression. Through positioning, a verbal system, identity, website architecture, and a documented Brand Bible, the brand now has a standard it can keep across the door, the table, and the screen. The new system is designed to help Maison Vale show up with greater clarity, consistency, and confidence across website, reservations, and the room.',
    internalRisks: 'SAMPLE. Do not treat as a real client. Photography was adjacent, not assumed.',
    upsell: 'SAMPLE: Brand Stewardship after day 90.',
    strengths: [
      { id: 's1', title: 'A real dining room and method', evidence: 'Client-reported offer and room.', why: 'Craft can be shown, not claimed.', action: 'Keep process visible.', touch: 'In-person environment', clientVisible: true },
      { id: 's2', title: 'A defined guest', evidence: 'Audience stated as planners, not drop-ins.', why: 'Exclusion is a standard.', action: 'Do not chase volume language.', touch: 'Messaging', clientVisible: true },
    ],
    gaps: [
      { id: 'g1', category: 'Identity', severity: 'Critical', finding: 'No reusable mark or type system existed.', evidence: 'Observed from sample baseline (fictional).', consequence: 'The house could not be recognized outside the door.', implication: 'Identity Transformation was required, not a refresh.', response: 'Build a complete identity system.', pillar: 'visual', intervention: 'Logo system', clientVisible: true },
      { id: 'g2', category: 'Digital', severity: 'High', finding: 'Homepage did not hold a single reservation action.', evidence: 'Expert inference on sample baseline.', consequence: 'Guests bounced before booking.', implication: 'Site hierarchy is strategy.', response: 'One hero, one CTA.', pillar: 'digital', intervention: 'Website strategy', clientVisible: true },
    ],
    evidence: [
      { id: 'e1', title: 'Former homepage (sample)', type: 'Website screenshot', source: '', date: '2025-01-12', by: 'Empyré', touch: 'Website', pillar: 'digital', status: 'Observed', clientVisible: true, caption: 'SAMPLE — fictional baseline.', annotation: 'No primary reservation action.', confidence: 'High', verify: '', internalOnly: false },
    ],
    comparisons: [
      { id: 'c1', mode: 'before-after', touch: 'Website', beforeNote: 'Generic hero, three equal buttons.', afterNote: 'One sentence, one Reserve action.', pillar: 'digital', clientVisible: true, reason: 'Hierarchy is the standard made visible.' },
    ],
    history: [{ id: uid(), at: nowIso(), user: 'Empyré', summary: 'Sample diagnostic loaded', previous: '', updated: 'Client-ready', visibility: 'internal' }],
  })
  rec.brandName = 'Maison Vale — SAMPLE PROJECT — FOR DEMONSTRATION ONLY'
  return rec
}
