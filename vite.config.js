import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local API target for the dev proxy: the btc_rag FastAPI backend. Override with
// VITE_DEV_API_TARGET if you run it on a different host/port.
const API_TARGET = process.env.VITE_DEV_API_TARGET || 'http://localhost:8082'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    // The app calls its OWN origin (/api/*); Vite proxies that to btc_rag, so
    // there is no separate API URL and no CORS in local dev. The SSE chat stream
    // passes through unchanged.
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})
