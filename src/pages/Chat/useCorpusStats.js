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
  // Primary-subject counts, same snapshot. Unlike the headline figures these
  // are exact rather than rounded down: a bar chart's parts have to sum to its
  // stated total, so "3,900+" style rounding would make the footnote wrong.
  byClass: [
    ['Volatility and Risk', 738], ['Markets and Asset Pricing', 633],
    ['Macro and Monetary', 398], ['Protocol', 398],
    ['Forecasting and Prediction', 325], ['Cryptography and Security', 246],
    ['Mining and Energy', 233], ['Regulation/Law/Policy', 206],
    ['Adoption and Society', 203], ['Other', 174],
    ['AI and Machine Learning', 158], ['Data and Networks', 134],
    ['Illicit Use and Forensics', 106], ['Other Crypto and DeFi', 101],
    ['Surveys and Reviews', 63], ['Corporate Treasury and DATCos', 28],
    ['Supply and Halving', 16], ['Uncategorized', 1],
  ],
  classified: 4161,
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
    ...classesFromApi(data),
  };
}

// by_class arrives as [[name, papers], ...]. It is optional — the endpoint only
// has it when the payload came from the database, not from the CSV fallback —
// so an absent or malformed field keeps the snapshot distribution rather than
// emptying the chart, the same way a missing `venues` keeps its snapshot tile. `classified` is the
// chart's denominator and is derived from the rows themselves, never from
// `papers`, which also counts citable papers the classifier has not reached.
function classesFromApi(data) {
  const snapshot = { byClass: FALLBACK.byClass, classified: FALLBACK.classified };
  if (!Array.isArray(data.by_class)) return snapshot;
  const byClass = data.by_class
    .filter((row) => Array.isArray(row) && typeof row[0] === 'string' && row[0].trim())
    .map(([name, n]) => [name.trim(), Number(n)])
    .filter(([, n]) => Number.isFinite(n) && n > 0);
  if (!byClass.length) return snapshot;
  return { byClass, classified: byClass.reduce((sum, [, n]) => sum + n, 0) };
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
