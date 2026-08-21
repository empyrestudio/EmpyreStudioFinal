import { useState } from 'react'
import { AtmospherePhoto, LogoLockup } from '../assets/Brand.jsx'
import { tryUnlock } from '../lib/auth.js'

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reveal, setReveal] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await tryUnlock(password)
      if (result.ok) onUnlock()
      else setError(result.error)
    } catch {
      setError('Could not verify access in this browser.')
    }
    setBusy(false)
  }

  return (
    <div className="lock">
      <AtmospherePhoto variant="hero" className="lock-bg" />
      <form className="lock-card glass-3" onSubmit={submit}>
        <LogoLockup className="lock-mark" />
        <p className="kicker">Internal access</p>
        <h1 className="display">Elevation Engine</h1>
        <p className="lede lock-lede">
          A quiet command room. Studio only.
        </p>
        <label className="field">
          <span>Password</span>
          <input
            type={reveal ? 'text' : 'password'}
            autoFocus
            autoComplete="off"
            spellCheck="false"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Studio password"
          />
        </label>
        <button type="button" className="btn ghost small" onClick={() => setReveal((v) => !v)}>
          {reveal ? 'Hide' : 'Show'}
        </button>
        {error && <p className="lock-error">{error}</p>}
        <button className="btn primary" type="submit" disabled={busy || !password}>
          {busy ? 'Checking' : 'Enter'}
        </button>
        <p className="lock-foot">The standard, made visible.</p>
      </form>
    </div>
  )
}
