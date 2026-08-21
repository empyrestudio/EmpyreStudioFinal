import { storeGet, storeSet, storeRemove, sessionGet, sessionSet, sessionRemove } from './store.js'

const SESSION_KEY = 'empyre.elevation.session'
const FAIL_KEY = 'empyre.elevation.fails'

export const ACCESS_HASHES = [
  '88c0139cb4b0ff4f32752500fc83c945765d22f1a1bd1f033851714783ba837d',
  '6c87182b0c1a78abbc7cab746f8da28a3a97803879b270a3b0205ec1ffc95485',
]

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function sha256Fallback(message) {
  const msg = unescape(encodeURIComponent(message))
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]
  const rr = (n, s) => (n >>> s) | (n << (32 - s))
  const bitLen = msg.length * 8
  const bytes = []
  for (let i = 0; i < msg.length; i++) bytes.push(msg.charCodeAt(i) & 255)
  bytes.push(0x80)
  while (bytes.length % 64 !== 56) bytes.push(0)
  for (let i = 7; i >= 0; i--) bytes.push((bitLen / 2 ** (i * 8)) & 255)
  for (let off = 0; off < bytes.length; off += 64) {
    const w = []
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
    }
    let [a, b, c, d, e, f, g, hh] = h
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const t1 = (hh + S1 + ch + k[i] + w[i]) >>> 0
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + maj) >>> 0
      hh = g
      g = f
      f = e
      e = (d + t1) >>> 0
      d = c
      c = b
      b = a
      a = (t1 + t2) >>> 0
    }
    h[0] = (h[0] + a) >>> 0
    h[1] = (h[1] + b) >>> 0
    h[2] = (h[2] + c) >>> 0
    h[3] = (h[3] + d) >>> 0
    h[4] = (h[4] + e) >>> 0
    h[5] = (h[5] + f) >>> 0
    h[6] = (h[6] + g) >>> 0
    h[7] = (h[7] + hh) >>> 0
  }
  return h.map((n) => n.toString(16).padStart(8, '0')).join('')
}

export async function sha256(str) {
  try {
    if (globalThis.crypto?.subtle && globalThis.isSecureContext) {
      const data = new TextEncoder().encode(str)
      const buf = await crypto.subtle.digest('SHA-256', data)
      return bytesToHex(new Uint8Array(buf))
    }
  } catch {
    /* file:// and some browsers block SubtleCrypto */
  }
  return sha256Fallback(str)
}

function candidates(password) {
  const raw = String(password ?? '')
  const trimmed = raw.trim()
  const set = new Set([raw, trimmed])
  if (trimmed.startsWith('**')) set.add(trimmed.slice(2))
  if (trimmed.endsWith('**')) set.add(trimmed.replace(/\*\*$/, ''))
  if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
    set.add(trimmed.slice(2, -2))
  }
  return [...set].filter((s) => s.length > 0)
}

export function isAuthed() {
  const v = sessionGet(SESSION_KEY) || storeGet(SESSION_KEY)
  return ACCESS_HASHES.includes(v)
}

export function lock() {
  sessionRemove(SESSION_KEY)
  storeRemove(SESSION_KEY)
}

function failState() {
  try {
    const raw = JSON.parse(sessionGet(FAIL_KEY) || '{}')
    const count = Number(raw.count) || 0
    const until = Number(raw.until) || 0
    return { count, until, lockedUntil: until > Date.now() ? until : 0 }
  } catch {
    return { count: 0, until: 0, lockedUntil: 0 }
  }
}

export async function tryUnlock(password) {
  try {
    const { count, lockedUntil } = failState()
    const hashes = []
    for (const c of candidates(password)) hashes.push(await sha256(c))
    const match = hashes.find((h) => ACCESS_HASHES.includes(h))
    if (match) {
      sessionSet(SESSION_KEY, match)
      sessionRemove(FAIL_KEY)
      return { ok: true }
    }
    if (lockedUntil) {
      const wait = Math.ceil((lockedUntil - Date.now()) / 1000)
      return { ok: false, error: `Too many attempts. Wait ${wait}s, then try again.` }
    }
    const next = count + 1
    if (next >= 8) {
      sessionSet(FAIL_KEY, JSON.stringify({ count: next, until: Date.now() + 60_000 }))
      return { ok: false, error: 'Too many attempts. Wait 60s.' }
    }
    sessionSet(FAIL_KEY, JSON.stringify({ count: next, until: 0 }))
    return { ok: false, error: 'Access denied. Check spelling, zeros vs the letter O, and special characters.' }
  } catch {
    return { ok: false, error: 'Could not verify access in this browser.' }
  }
}
