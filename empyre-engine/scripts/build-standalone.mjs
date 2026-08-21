import * as esbuild from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tmpJs = join(root, '.standalone-app.js')
const tmpCss = join(root, '.standalone-app.css')

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'iife',
  outfile: tmpJs,
  jsx: 'automatic',
  loader: {
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.jpeg': 'dataurl',
    '.webp': 'dataurl',
    '.svg': 'dataurl',
    '.css': 'css',
  },
  minify: true,
  legalComments: 'none',
  logLevel: 'info',
})

const js = readFileSync(tmpJs, 'utf8').replace(/<\/script/gi, '<\\u002fscript')
const css = readFileSync(tmpCss, 'utf8')

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="theme-color" content="#05070c"/>
<meta name="robots" content="noindex, nofollow"/>
<title>Empyré Elevation Engine</title>
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script>
function empyreFail(msg) {
  var el = document.getElementById('root');
  if (!el) return;
  el.innerHTML = '<div style="padding:48px;font-family:Georgia,serif;color:#e8eef4;background:#05070c;min-height:100vh"><p style="color:#c4a07a;letter-spacing:.2em;font-size:11px;text-transform:uppercase">Empyré Studio</p><h1 style="font-weight:400">The engine could not start.</h1><p style="color:#8b95a3">' + String(msg) + '</p></div>';
}
window.onerror = function (msg) { empyreFail(msg); };
window.addEventListener('unhandledrejection', function (e) { empyreFail(e.reason || e); });
</script>
<script>
${js}
</script>
</body>
</html>
`

const outFile = join(root, '..', 'Empyre-Elevation-Engine.html')
const siteDir = join(root, '..', 'empyre-website')
mkdirSync(siteDir, { recursive: true })
writeFileSync(outFile, html)
writeFileSync(join(siteDir, 'index.html'), html)

try {
  copyFileSync(join(root, 'public', 'favicon.png'), join(siteDir, 'favicon.png'))
} catch {
  /* optional */
}

console.log('Wrote', outFile, html.length, 'bytes')
console.log('Wrote', join(siteDir, 'index.html'))
