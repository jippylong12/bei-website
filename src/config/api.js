// Research-chat backend (FastAPI SSE server in the rag_bitcoin repo), exposed
// through the Cloudflare tunnel. Override per-build with VITE_API_URL (see
// .env.development for local dev).
//
// Interim host: served by the `batchllm` tunnel on a zone already on
// Cloudflare. When btcedu.org's nameservers move to Cloudflare, add an
// `api.btcedu.org` ingress rule to the tunnel and change this to
// 'https://api.btcedu.org' (CORS already allows the btcedu.org origin either way).
export const API_BASE =
  import.meta.env.VITE_API_URL || 'https://bei-api.batchllm-workspace.info';
