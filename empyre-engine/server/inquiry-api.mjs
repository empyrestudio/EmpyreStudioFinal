import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..', 'empyre-website')
const DATA = path.join(__dirname, '..', 'data')
const STORE = path.join(DATA, 'inquiries.json')
const FALLBACK = path.join(DATA, 'inquiry-fallback.json')
const LOG = path.join(DATA, 'inquiry-errors.json')
const PORT = Number(process.env.PORT || 5173)
const INGEST_KEY = process.env.EMPYRE_INGEST_KEY || ''
const MAX = {
  name: 120, business: 160, email: 180, phone: 40, url: 300, text: 4000, utm: 120,
}

fs.mkdirSync(DATA, { recursive: true })

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function send(res, code, body, extra = {}) {
  const json = JSON.stringify(body)
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': extra.origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Empyre-Ingest-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
    ...extra.headers,
  })
  res.end(json)
}

function allowedOrigin(origin) {
  if (!origin) return true
  try {
    const h = new URL(origin).hostname
    return (
      h === 'empyrestudio.com' ||
      h.endsWith('.empyrestudio.com') ||
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h.endsWith('.e2b.app')
    )
  } catch {
    return false
  }
}

function clip(s, n) {
  return String(s ?? '').replace(/<[^>]*>/g, '').trim().slice(0, n)
}

function validEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > 8
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > 80_000) {
        reject(new Error('too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      if (req.headers['content-type']?.includes('application/json')) {
        try { resolve(JSON.parse(raw)) } catch { reject(new Error('invalid json')) }
        return
      }
      const params = new URLSearchParams(raw)
      const o = {}
      params.forEach((v, k) => { o[k] = v })
      resolve(o)
    })
    req.on('error', reject)
  })
}

function normalize(body) {
  return {
    fullName: clip(body.fullName || body.name || body.contactName, MAX.name),
    businessName: clip(body.businessName || body.company || body.brand, MAX.business),
    email: clip(body.email, MAX.email).toLowerCase(),
    phone: clip(body.phone || body.tel, MAX.phone),
    website: clip(body.website || body.url, MAX.url),
    socials: clip(body.instagram || body.socials || body.social, MAX.url),
    industry: clip(body.industry, 80),
    location: clip(body.location || body.serviceArea, 160),
    serviceInterest: clip(body.service || body.serviceInterest || body.interest, 160),
    projectType: clip(body.projectType || body.project, 120),
    budget: clip(body.budget, 80),
    timeline: clip(body.timeline, 80),
    challenge: clip(body.challenge || body.obstacle, MAX.text),
    message: clip(body.message || body.inquiry || body.comments, MAX.text),
    referralSource: clip(body.referral || body.referralSource || body.source, 120),
    consent: body.consent === true || body.consent === 'true' || body.consent === 'on' || body.consent === '1',
    landingPage: clip(body.landingPage || body.page || body.referrer, MAX.url),
    utmSource: clip(body.utm_source || body.utmSource, MAX.utm),
    utmMedium: clip(body.utm_medium || body.utmMedium, MAX.utm),
    utmCampaign: clip(body.utm_campaign || body.utmCampaign, MAX.utm),
    utmTerm: clip(body.utm_term || body.utmTerm, MAX.utm),
    utmContent: clip(body.utm_content || body.utmContent, MAX.utm),
    formName: clip(body.formName || body.form || 'Website inquiry', 80),
    honeypot: clip(body._hp || body.fax || body.company_website, 80),
    submittedAt: new Date().toISOString(),
    sourceUrl: 'https://empyrestudio.com',
  }
}

function mime(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8'
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (file.endsWith('.css')) return 'text/css; charset=utf-8'
  if (file.endsWith('.png')) return 'image/png'
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg'
  if (file.endsWith('.webp')) return 'image/webp'
  if (file.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'
  const file = path.normalize(path.join(ROOT, urlPath))
  if (!file.startsWith(ROOT)) {
    res.writeHead(403)
    res.end()
    return
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      const index = path.join(ROOT, 'index.html')
      fs.readFile(index, (e2, html) => {
        if (e2) {
          res.writeHead(404)
          res.end('Not found')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
      })
      return
    }
    res.writeHead(200, { 'Content-Type': mime(file) })
    res.end(data)
  })
}

function logError(entry) {
  const rows = readJson(LOG, [])
  rows.unshift({ at: new Date().toISOString(), ...entry })
  writeJson(LOG, rows.slice(0, 100))
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || ''
  if (req.method === 'OPTIONS') {
    send(res, 204, {}, { origin: allowedOrigin(origin) ? origin : '' })
    return
  }
  const url = (req.url || '').split('?')[0]
  const ip = req.socket.remoteAddress || 'unknown'

  try {
    if (url === '/api/health' && req.method === 'GET') {
      send(res, 200, { ok: true, service: 'empyre-inquiry', time: new Date().toISOString() })
      return
    }

    if (url === '/api/inquiries' && req.method === 'POST') {
      if (!allowedOrigin(origin) && origin) {
        send(res, 200, { ok: true })
        return
      }
      if (rateLimited(ip)) {
        logError({ type: 'rate-limit', ip: 'redacted' })
        send(res, 200, { ok: true })
        return
      }
      const body = await parseBody(req)
      const n = normalize(body)
      if (n.honeypot) {
        send(res, 200, { ok: true })
        return
      }
      if (!n.email || !validEmail(n.email) || !n.fullName) {
        send(res, 200, { ok: true })
        writeJson(FALLBACK, [ { at: new Date().toISOString(), reason: 'validation', emailPresent: !!n.email }, ...readJson(FALLBACK, []) ].slice(0, 200))
        return
      }
      const rec = {
        id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...n,
        raw: {
          fullName: n.fullName,
          businessName: n.businessName,
          email: n.email,
          phone: n.phone,
          website: n.website,
          message: n.message,
          challenge: n.challenge,
          utmSource: n.utmSource,
          utmMedium: n.utmMedium,
          utmCampaign: n.utmCampaign,
          landingPage: n.landingPage,
          formName: n.formName,
          consent: n.consent,
        },
        spamStatus: 'clear',
        synced: false,
      }
      const store = readJson(STORE, [])
      store.unshift(rec)
      writeJson(STORE, store.slice(0, 500))
      send(res, 200, { ok: true })
      return
    }

    if (url === '/api/inquiries/pending' && req.method === 'GET') {
      const key = req.headers['x-empyre-ingest-key'] || ''
      const local = !INGEST_KEY && (ip === '127.0.0.1' || ip === '::1' || ip.endsWith('127.0.0.1'))
      if (INGEST_KEY && key !== INGEST_KEY && !local) {
        send(res, 401, { ok: false })
        return
      }
      const store = readJson(STORE, [])
      send(res, 200, { ok: true, inquiries: store.filter((r) => !r.synced) })
      return
    }

    if (url === '/api/inquiries/ack' && req.method === 'POST') {
      const key = req.headers['x-empyre-ingest-key'] || ''
      const local = !INGEST_KEY && (ip === '127.0.0.1' || ip === '::1' || ip.endsWith('127.0.0.1'))
      if (INGEST_KEY && key !== INGEST_KEY && !local) {
        send(res, 401, { ok: false })
        return
      }
      const body = await parseBody(req)
      const ids = Array.isArray(body.ids) ? body.ids : []
      const store = readJson(STORE, [])
      store.forEach((r) => { if (ids.includes(r.id)) r.synced = true })
      writeJson(STORE, store)
      send(res, 200, { ok: true })
      return
    }

    if (url === '/api/inquiries/status' && req.method === 'GET') {
      const store = readJson(STORE, [])
      const fail = readJson(LOG, [])
      send(res, 200, {
        ok: true,
        connected: true,
        pending: store.filter((r) => !r.synced).length,
        last: store[0]?.submittedAt || null,
        lastFail: fail[0]?.at || null,
        form: 'Website inquiry — empyrestudio.com',
      })
      return
    }

    serveStatic(req, res)
  } catch (err) {
    logError({ type: 'handler', message: 'failed' })
    if (url.startsWith('/api/inquiries') && req.method === 'POST') {
      try {
        writeJson(FALLBACK, [{ at: new Date().toISOString(), reason: 'handler-fail' }, ...readJson(FALLBACK, [])].slice(0, 200))
      } catch { /* ignore */ }
      send(res, 200, { ok: true })
      return
    }
    send(res, 500, { ok: false })
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Empyré inquiry + studio on 0.0.0.0:${PORT}`)
})
