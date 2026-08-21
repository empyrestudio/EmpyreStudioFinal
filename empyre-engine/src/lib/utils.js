export const uid = () => {
  try {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  } catch {
    /* file:// or old browser */
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const nowIso = () => new Date().toISOString()

export const fmtDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export const filled = (v) => typeof v === 'string' && v.trim().length > 0

export const clean = (v) => (typeof v === 'string' ? v.trim() : '')

export const orDash = (v) => (filled(v) ? v.trim() : '—')

export const nameOf = (client) => filled(client?.businessName) ? client.businessName.trim() : 'Untitled assessment'

export const industryOf = (client) => filled(client?.industry) ? client.industry : 'the category'

export const offerOf = (client) =>
  filled(client?.primaryOffer) ? client.primaryOffer.trim() : 'the core offer'

export const audienceOf = (client) =>
  filled(client?.primaryAudience) ? client.primaryAudience.trim() : 'the primary audience'

export const placeOf = (client) =>
  filled(client?.location) ? client.location.trim() : filled(client?.geoMarket) ? client.geoMarket.trim() : 'the market'

export const actionOf = (client) => filled(client?.desiredAction) ? client.desiredAction : 'inquire'

export const firstWord = (name) => {
  const n = clean(name)
  if (!n) return 'the brand'
  return n.split(/\s+/)[0]
}

export function completeness(client = {}) {
  const keys = [
    'businessName', 'industry', 'primaryOffer', 'stage',
    'primaryAudience', 'desiredAction',
    'challenges', 'goals', 'conversionGoal',
  ]
  const optional = [
    'website', 'location', 'businessModel', 'typicalValue',
    'secondaryAudience', 'motivations', 'objections', 'painPoints',
    'strengths', 'unclear', 'mustRemain', 'admiredBrands',
    'competitors', 'differentiators', 'desiredPerception', 'timeline', 'budget',
  ]
  const requiredFilled = keys.filter((k) => filled(client[k])).length
  const optionalFilled = optional.filter((k) => filled(client[k])).length
  const score = Math.round((requiredFilled / keys.length) * 70 + (optionalFilled / optional.length) * 30)
  const missing = keys.filter((k) => !filled(client[k]))
  return { score, missing, requiredFilled, requiredTotal: keys.length }
}

export function download(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function slug(s) {
  return clean(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'assessment'
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}
