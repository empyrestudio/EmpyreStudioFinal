import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

if (typeof structuredClone !== 'function') {
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value))
}

const root = document.getElementById('root')
try {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (err) {
  root.innerHTML =
    '<div style="padding:48px;font-family:Georgia,serif;color:#e8eef4;background:#05070c;min-height:100vh"><p style="color:#c4a07a;letter-spacing:.2em;font-size:11px;text-transform:uppercase">Empyré Studio</p><h1 style="font-weight:400">The engine could not start.</h1><p style="color:#8b95a3">' +
    String(err && err.message ? err.message : err) +
    '</p></div>'
}
