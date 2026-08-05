// Unlisted-preview access for BitResearch.
//
// BitResearch is no longer part of the public site: it is gone from the header
// nav, excluded from robots.txt, and the /BitResearch route only renders for
// visitors who arrive with the preview token in the query string:
//
//   https://btcedu.org/BitResearch?k=<PREVIEW_TOKEN>
//
// Everyone else is redirected to the home page.
//
// This is an UNLISTED link, not a private one. The site is a static bundle, so
// the token below ships in the published JavaScript and anyone who reads that
// bundle can recover it. It keeps BitResearch out of the nav, out of search
// results, and away from casual visitors — it is not an authentication boundary.
// To hand the preview to someone new and cut off the old link, replace the
// token here and redeploy.
export const PREVIEW_TOKEN = 'IHGI4sapkd2vK2-4';

// Query parameter carrying the token.
export const PREVIEW_PARAM = 'k';

// Remembered per tab so a reload (or any client-side URL rewrite) does not lock
// an invited visitor out mid-session.
const STORAGE_KEY = 'bei.bitresearch.preview';

/**
 * Whether the current visitor may see the BitResearch preview.
 * @param {string} search - location.search for the current route.
 */
export function hasPreviewAccess(search) {
  const fromUrl = new URLSearchParams(search).get(PREVIEW_PARAM);

  if (fromUrl === PREVIEW_TOKEN) {
    remember();
    return true;
  }

  try {
    return sessionStorage.getItem(STORAGE_KEY) === PREVIEW_TOKEN;
  } catch {
    // Private browsing / storage disabled: fall back to the URL alone.
    return false;
  }
}

function remember() {
  try {
    sessionStorage.setItem(STORAGE_KEY, PREVIEW_TOKEN);
  } catch {
    // Storage is optional; the token in the URL is already enough.
  }
}
