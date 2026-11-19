import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local API target for the dev proxy: the btc_rag FastAPI backend. Override with
// VITE_DEV_API_TARGET if you run it on a different host/port.
const API_TARGET = process.env.VITE_DEV_API_TARGET || 'http://localhost:8082'

// Local target for the BitResearch prototype page (/prototype), used only when
// it is started with VITE_PROTOTYPE_API_URL=/prototype-api (see
// src/config/prototypeApi.js). Override with VITE_DEV_PROTOTYPE_API_TARGET.
const PROTOTYPE_API_TARGET = process.env.VITE_DEV_PROTOTYPE_API_TARGET || 'http://localhost:8620'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  // `npm test` (Vitest). jsdom gives the component tests a browser-like DOM.
  test: {
    environment: 'jsdom',
  },
  server: {
    // The app calls its OWN origin (/api/*); Vite proxies that to btc_rag, so
    // there is no separate API URL and no CORS in local dev. The SSE chat stream
    // passes through unchanged. `npm run preview` uses the same proxy.
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      // /prototype-api/api/chat -> <PROTOTYPE_API_TARGET>/api/chat
      '/prototype-api': {
        target: PROTOTYPE_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/prototype-api/, ''),
      },
    },
  },
})
