// Research chat is unreleased. It stays out of the nav and only renders for
// people given the preview link:
//
//   /#/research?preview=bei-preview-2026
//
// Access is remembered for the tab (sessionStorage) so in-site navigation and
// refreshes don't drop it. Revoke by changing PREVIEW_KEY and redeploying.
//
// This is a soft gate: the chat code still ships in the bundle and the API is
// still reachable directly. It hides the feature; it does not secure it.
const PREVIEW_KEY = 'bei-preview-2026';
const STORAGE_KEY = 'bei:research-preview';

export function hasResearchPreview() {
  // HashRouter puts the query inside the hash: #/research?preview=xxx
  const hash = window.location.hash;
  const qs = hash.slice(hash.indexOf('?') + 1);
  if (hash.includes('?') && new URLSearchParams(qs).get('preview') === PREVIEW_KEY) {
    try {
      sessionStorage.setItem(STORAGE_KEY, PREVIEW_KEY);
    } catch {
      // Private mode / storage disabled: the URL param still works per-load.
    }
    return true;
  }

  try {
    return sessionStorage.getItem(STORAGE_KEY) === PREVIEW_KEY;
  } catch {
    return false;
  }
}
