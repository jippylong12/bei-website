// Calls to the faculty portal API, which lives in the btc_rag backend
// (faculty.py there), next to the BitResearch chat API.
//
// Every call resolves to { ok, status, ...body } and never throws. A network
// failure comes back as { ok: false, status: 0, message }, so the pages handle
// one shape whatever went wrong.
import { API_BASE } from '../../config/api';

const NETWORK_ERROR = 'Network error. Please check your connection and try again.';
const FALLBACK_ERROR = 'That did not work. Please try again.';

async function call(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR };
  }

  const data = await res.json().catch(() => ({}));
  if (res.ok) return { ...data, ok: true, status: res.status };
  return {
    ok: false,
    status: res.status,
    code: data.code,
    message: data.message || FALLBACK_ERROR,
  };
}

// ---- Public: the directory ----

export const fetchDirectory = () => call('/api/faculty/directory');

// kind is 'headshots' or 'logos'; name is the file name a directory row gives.
export const imageUrl = (kind, name) =>
  `${API_BASE}/api/faculty/images/${kind}/${encodeURIComponent(name)}`;

// ---- Sign-in ----

// One password, shared by all faculty. The answer carries a session token.
export const signIn = (password) =>
  call('/api/faculty/sign-in', { method: 'POST', body: { password } });

export const signOut = (token) => call('/api/faculty/sign-out', { method: 'POST', token });

// ---- Signed-in: the Portal (course materials and speakers) ----

export const fetchMaterials = (token) => call('/api/faculty/materials', { token });

// The speakers: names, emails and details, no pictures.
export const fetchSpeakers = (token) => call('/api/faculty/speakers', { token });

// Start a download of one materials file. A browser cannot send the session
// token when it follows a link, so the backend first hands out a link that
// works for two minutes, and the browser then follows that. The file arrives
// as an attachment, so the page stays where it is.
export async function downloadFile(token, path) {
  const res = await call('/api/faculty/materials/link', { method: 'POST', body: { path }, token });
  if (!res.ok) return res;
  const link = document.createElement('a');
  link.href = `${API_BASE}${res.url}`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  return res;
}

// The session token is kept in localStorage so a signed-in person stays signed
// in across visits (the backend ends the session after 30 days). The API is on
// another site, so a cookie would be a third-party cookie, which browsers
// block. If storage is unavailable the sign-in simply lasts until the page is
// closed.
const TOKEN_KEY = 'bei.faculty.session.v1';

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function saveToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage blocked: nothing to persist
  }
}
