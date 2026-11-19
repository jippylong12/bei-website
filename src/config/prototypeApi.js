// API base for the BitResearch prototype page (/prototype), and only for it.
//
// The prototype has its own API: 100 papers, answered by an open-weight model
// on our own GPU. It must never reach the production BitResearch API (the one
// /BitResearch uses, src/config/api.js), so this rule has no way to get there:
//
// - VITE_PROTOTYPE_API_URL=https://host    that host, at build time or in dev.
// - VITE_PROTOTYPE_API_URL=/prototype-api  the page's own origin. In `npm run
//   dev` and `npm run preview` the Vite proxy forwards it to
//   VITE_DEV_PROTOTYPE_API_TARGET (vite.config.js), so a local API needs no CORS.
// - unset, empty, not a URL, or a production API host
//                                          DEFAULT_PROTOTYPE_API_URL.
//
// There is no "same origin, empty base" case: on btcedu.org that is no API at
// all, and in dev it is the /api proxy to the production backend.
export const DEFAULT_PROTOTYPE_API_URL = 'https://prototype-api.batchllm-workspace.info';

// Hosts that serve the production BitResearch corpus (and subdomains of them).
const PRODUCTION_HOSTS = ['bei-api.batchllm-workspace.info', 'api.btcedu.org'];

function originOf(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

// `productionBase` is the production chat's own API base (VITE_API_URL); the
// prototype never uses the same origin, whatever its host is called.
export function resolvePrototypeApiBase(raw, { productionBase } = {}) {
  const value = String(raw ?? '').trim().replace(/\/+$/, '');
  if (!value) return DEFAULT_PROTOTYPE_API_URL;

  // A path on this origin, for the dev/preview proxy. "//host" is not a path.
  if (value.startsWith('/') && !value.startsWith('//')) return value;

  let url;
  try {
    url = new URL(value);
  } catch {
    return DEFAULT_PROTOTYPE_API_URL;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return DEFAULT_PROTOTYPE_API_URL;

  const host = url.hostname.toLowerCase();
  if (PRODUCTION_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return DEFAULT_PROTOTYPE_API_URL;
  }
  const production = productionBase ? originOf(productionBase) : null;
  if (production && production === url.origin) return DEFAULT_PROTOTYPE_API_URL;

  return value;
}

export const PROTOTYPE_API_BASE = resolvePrototypeApiBase(import.meta.env.VITE_PROTOTYPE_API_URL, {
  productionBase: import.meta.env.VITE_API_URL,
});
