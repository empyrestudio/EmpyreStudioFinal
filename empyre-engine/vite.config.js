import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    plugins: single ? [react(), viteSingleFile()] : [react()],
    base: './',
    build: {
      outDir: single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? 20_000_000 : 4096,
      cssCodeSplit: !single,
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
    },
  }
})
