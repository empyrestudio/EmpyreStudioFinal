# Empyré Elevation Engine

Internal Brand Assessment + Elevation System. Password-gated. Client-agnostic.

## Reusable website

**Hostable folder:** `dist/`  
Upload the whole folder to any static host. Open `index.html`.

**Single file:** `dist-single/index.html`  
One HTML file. Open it locally or send it. No extra assets required for the app to run.

```
npm install
npm run dev          # working preview
npm run build        # dist/ folder
npm run build:single # one HTML file
npm run preview      # serve dist/
```

The access password is stored as a SHA-256 hash in `src/lib/auth.js` (`ACCESS_HASH`). It is never written in plaintext. Closing the tab locks the session.

This is an interface gate for an internal tool. It is not a substitute for hosting behind a real server login if the file itself must stay secret.
