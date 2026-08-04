import { useEffect, useState } from 'react';
import { API_BASE } from '../../config/api';

// Fallback snapshot of the corpus library metadata (metadata.zip, 2026-08-03),
// shown until GET /api/stats responds — and kept if it can't. Snapshot values
// are rounded down so they stay true as the corpus grows; live values from the
// API are exact and refresh with each harvest.
const FALLBACK = {
  live: false,
  papers: '3,900+',
  papersApprox: '~3,900',
  researchers: '7,400+',
  venues: '~1,000',
  citations: '72,000+',
  byYear: [
    [2008, 52], [2009, 55], [2010, 37], [2011, 38], [2012, 37], [2013, 56],
    [2014, 151], [2015, 133], [2016, 128], [2017, 191], [2018, 281], [2019, 330],
    [2020, 322], [2021, 361], [2022, 345], [2023, 308], [2024, 283], [2025, 507],
    [2026, 245],
  ],
  preChart: 215,
  earliestYear: 1938,
  asOf: null,
};

// Years before this are folded into the footnote instead of charted.
export const FIRST_CHART_YEAR = 2008;

const fmt = (n) => n.toLocaleString('en-US');

// Normalize the /api/stats payload into display form; null if it isn't usable.
function fromApi(data) {
  if (!data || typeof data.papers !== 'number' || typeof data.by_year !== 'object' || !data.by_year) {
    return null;
  }
  const entries = Object.entries(data.by_year)
    .map(([y, n]) => [Number(y), Number(n)])
    .filter(([y, n]) => Number.isFinite(y) && Number.isFinite(n) && n >= 0);
  // Drop future-dated outliers (bad metadata years); they still count in totals.
  const maxYear = new Date().getFullYear();
  const byYear = entries
    .filter(([y]) => y >= FIRST_CHART_YEAR && y <= maxYear)
    .sort((a, b) => a[0] - b[0]);
  if (!byYear.length) return null;
  return {
    live: true,
    papers: fmt(data.papers),
    papersApprox: fmt(data.papers),
    researchers: typeof data.researchers === 'number' ? fmt(data.researchers) : FALLBACK.researchers,
    venues: typeof data.venues === 'number' ? fmt(data.venues) : FALLBACK.venues,
    citations: typeof data.citations === 'number' ? fmt(data.citations) : FALLBACK.citations,
    byYear,
    preChart: entries.filter(([y]) => y < FIRST_CHART_YEAR).reduce((s, [, n]) => s + n, 0),
    earliestYear: Math.min(...entries.map(([y]) => y)),
    asOf: typeof data.as_of === 'string' ? data.as_of : null,
  };
}

// Fetch once per page load; later mounts reuse the cached result.
let cached = null;

export default function useCorpusStats() {
  const [stats, setStats] = useState(cached ?? FALLBACK);

  useEffect(() => {
    if (cached) return undefined;
    const ctrl = new AbortController();
    fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const live = fromApi(data);
        if (live) {
          cached = live;
          setStats(live);
        }
      })
      .catch(() => {}); // fallback snapshot stays up
    return () => ctrl.abort();
  }, []);

  return stats;
}
