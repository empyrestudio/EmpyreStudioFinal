import { STATUS_LABEL } from '../lib/constants.js'

export function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const tone = {
    draft: '',
    discovery: 'warn',
    review: 'gold',
    'client-ready': 'ok',
    archived: '',
  }[status] || ''
  return <Badge tone={tone}>{STATUS_LABEL[status] || status}</Badge>
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

export function Input({ value, onChange, ...rest }) {
  return (
    <input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export function Area({ value, onChange, rows = 4, ...rest }) {
  return (
    <textarea
      rows={rows}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export function Select({ value, onChange, options, placeholder = 'Select', ...rest }) {
  const opts = options.map((o) =>
    typeof o === 'string' ? { id: o, label: o } : o
  )
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} {...rest}>
      <option value="">{placeholder}</option>
      {opts.filter((o) => o.id !== '').map((o) => (
        <option key={String(o.id)} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function SourceTag({ source }) {
  if (source === 'client') return <Badge tone="fact">Client fact</Badge>
  if (source === 'hypothesis') return <Badge tone="hyp">Strategic hypothesis</Badge>
  return null
}

export function Block({ kicker, title, children, extra }) {
  return (
    <div className="block">
      {kicker && <h4>{kicker}</h4>}
      {title && <h3>{title}</h3>}
      {extra}
      {children}
    </div>
  )
}

export function Editable({ value, onChange, multiline, className = '' }) {
  if (multiline) {
    return (
      <textarea
        className={`editable ${className}`}
        value={value || ''}
        rows={Math.max(3, String(value || '').split('\n').length + 1)}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  return (
    <input
      className={`editable ${className}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function Modal({ title, children, onClose, actions }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="kicker">Empyré Studio</p>
        <h2 className="display">{title}</h2>
        <div style={{ marginTop: 12 }}>{children}</div>
        <div className="form-actions" style={{ marginTop: 22 }}>
          <button className="btn ghost" onClick={onClose}>Close</button>
          <div style={{ display: 'flex', gap: 8 }}>{actions}</div>
        </div>
      </div>
    </div>
  )
}
