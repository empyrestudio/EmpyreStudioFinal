/**
 * Netlify Function for empyrestudio.com inquiry → Empyré CRM.
 * Environment variables (names only): EMPYRE_INGEST_KEY, EMPYRE_NOTIFY_EMAIL
 * Public POST is unauthenticated. Pending pull requires X-Empyre-Ingest-Key.
 */
const MAX = { name: 120, business: 160, email: 180, phone: 40, url: 300, text: 4000, utm: 120 }

function clip(s, n) {
  return String(s ?? '').replace(/<[^>]*>/g, '').trim().slice(0, n)
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://empyrestudio.com',
    'Access-Control-Allow-Headers': 'Content-Type, X-Empyre-Ingest-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }

  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { body = {} }
  if (body._hp || body.fax || body.company_website) return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }

  const email = clip(body.email, MAX.email).toLowerCase()
  const fullName = clip(body.fullName || body.name, MAX.name)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  }

  const inquiry = {
    id: `inq_${Date.now()}`,
    fullName,
    businessName: clip(body.businessName || body.company, MAX.business),
    email,
    phone: clip(body.phone, MAX.phone),
    website: clip(body.website, MAX.url),
    socials: clip(body.instagram || body.socials, MAX.url),
    industry: clip(body.industry, 80),
    location: clip(body.location, 160),
    serviceInterest: clip(body.service || body.serviceInterest, 160),
    projectType: clip(body.projectType, 120),
    budget: clip(body.budget, 80),
    timeline: clip(body.timeline, 80),
    challenge: clip(body.challenge, MAX.text),
    message: clip(body.message, MAX.text),
    referralSource: clip(body.referral || body.referralSource, 120),
    consent: body.consent === true || body.consent === 'on',
    landingPage: clip(body.landingPage, MAX.url),
    utmSource: clip(body.utm_source, MAX.utm),
    utmMedium: clip(body.utm_medium, MAX.utm),
    utmCampaign: clip(body.utm_campaign, MAX.utm),
    formName: clip(body.formName || 'Website inquiry', 80),
    submittedAt: new Date().toISOString(),
    sourceUrl: 'https://empyrestudio.com',
  }

  // Persist via your connected store in production (Blobs, Fauna, etc.).
  // This function never returns CRM internals to the visitor.
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }), inquiry }
}
