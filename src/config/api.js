// Research-chat (BitResearch) backend base URL.
//
// Local dev: the Vite dev server proxies /api/* to the local btc_rag backend
// (see vite.config.js -> server.proxy), so the app calls its OWN origin
// (API_BASE = ''). No separate API URL and no CORS in dev.
//
// Production: set VITE_API_URL to the backend at build time; otherwise it falls
// back to the Cloudflare tunnel host (`batchllm`; later api.btcedu.org).
const fromEnv = import.meta.env.VITE_API_URL;

export const API_BASE =
  fromEnv !== undefined && fromEnv !== ''
    ? fromEnv
    : import.meta.env.DEV
      ? '' // same-origin -> Vite dev proxy -> btc_rag
      : 'https://bei-api.batchllm-workspace.info';
