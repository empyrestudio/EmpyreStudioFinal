import { LogoLockup, LogoMark } from '../assets/Brand.jsx'
import { NAV } from '../lib/os-constants.js'

export default function Layout({ view, setView, children, top, onMenu, onLock, flash, collapsed, setCollapsed }) {
  return (
    <div className={`app os ${collapsed ? 'rail-collapsed' : ''}`}>
      <aside className={`sidebar glass-1 ${onMenu?.open ? 'open' : ''}`}>
        <div className="brand-lockup">
          <LogoLockup className="sidebar-lockup" />
          <LogoMark className="sidebar-mark-only" />
          <div className="brand-kicker">
            Elevation Engine
            <br />
            Internal command
          </div>
        </div>
        <button className="btn ghost small new-action" onClick={() => setView('intake')}>New assessment</button>
        <nav className="nav" aria-label="Studio">
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="nav-label">{g.group}</div>
              {g.items.map((it) => (
                <button
                  key={it.id}
                  className={`nav-btn ${view === it.id ? 'active' : ''}`}
                  onClick={() => setView(it.id)}
                >
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <em>The standard, made visible.</em>
          Internal notes never leave with a client export.
          {flash && <div className="save-pill" style={{ marginTop: 8 }}>{flash}</div>}
          {onLock && (
            <button className="btn ghost small" style={{ marginTop: 12, width: '100%' }} onClick={onLock}>
              Lock
            </button>
          )}
        </div>
      </aside>
      <div className="main">
        <div className="topbar glass-1">
          <div className="topbar-left">
            <button className="btn small mobile-toggle" onClick={onMenu?.toggle}>Menu</button>
            <div className="crumb">{top?.crumb || <><strong>Empyré</strong> · Elevation Engine</>}</div>
          </div>
          <div className="topbar-actions">
            {top?.actions}
            <button className="btn small primary" onClick={() => setView('intake')}>New</button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
