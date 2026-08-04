import { useEffect, useMemo, useState } from 'react';
import styles from './Chat.module.css';
import { API_BASE } from '../../config/api';

// Fallback snapshot of the corpus library metadata (metadata.zip, 2026-08-03),
// shown until GET /api/stats responds — and kept if it can't. Snapshot values
// are rounded down so they stay true as the corpus grows; live values from the
// API are exact and refresh with each harvest.
const FALLBACK = {
  papers: '3,900+',
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
const FIRST_CHART_YEAR = 2008;

// Chart geometry (SVG user units; the SVG itself scales to its container).
const W = 640;
const H = 190;
const PAD = { top: 20, right: 6, bottom: 22, left: 34 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const fmt = (n) => n.toLocaleString('en-US');

// Normalize the /api/stats payload into display form; null if it isn't usable.
function fromApi(data) {
  if (!data || typeof data.papers !== 'number' || typeof data.by_year !== 'object' || !data.by_year) {
    return null;
  }
  const entries = Object.entries(data.by_year)
    .map(([y, n]) => [Number(y), Number(n)])
    .filter(([y, n]) => Number.isFinite(y) && Number.isFinite(n) && n >= 0);
  const byYear = entries.filter(([y]) => y >= FIRST_CHART_YEAR).sort((a, b) => a[0] - b[0]);
  if (!byYear.length) return null;
  return {
    papers: fmt(data.papers),
    researchers: typeof data.researchers === 'number' ? fmt(data.researchers) : FALLBACK.researchers,
    venues: typeof data.venues === 'number' ? fmt(data.venues) : FALLBACK.venues,
    citations: typeof data.citations === 'number' ? fmt(data.citations) : FALLBACK.citations,
    byYear,
    preChart: entries.filter(([y]) => y < FIRST_CHART_YEAR).reduce((s, [, n]) => s + n, 0),
    earliestYear: Math.min(...entries.map(([y]) => y)),
    asOf: typeof data.as_of === 'string' ? data.as_of : null,
  };
}

// Bar with a 4px rounded data-end and a square baseline.
function barPath(bx, barW, by) {
  const base = PAD.top + PLOT_H;
  const r = Math.min(4, (base - by) / 2, barW / 2);
  return [
    `M ${bx} ${base}`,
    `L ${bx} ${by + r}`,
    `Q ${bx} ${by} ${bx + r} ${by}`,
    `L ${bx + barW - r} ${by}`,
    `Q ${bx + barW} ${by} ${bx + barW} ${by + r}`,
    `L ${bx + barW} ${base}`,
    'Z',
  ].join(' ');
}

export default function CorpusStats() {
  const [hover, setHover] = useState(null);
  const [live, setLive] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const stats = fromApi(data);
        if (stats) setLive(stats);
      })
      .catch(() => {}); // fallback snapshot stays up
    return () => ctrl.abort();
  }, []);

  const stats = live ?? FALLBACK;

  const chart = useMemo(() => {
    const { byYear } = stats;
    const peak = Math.max(...byYear.map(([, n]) => n));
    const tickStep = peak > 400 ? 250 : peak > 150 ? 100 : 50;
    const yMax = Math.max(Math.ceil(peak * 1.03), tickStep);
    const ticks = [];
    for (let t = 0; t <= yMax; t += tickStep) ticks.push(t);
    const band = PLOT_W / byYear.length;
    const barW = Math.min(24, Math.max(2, band - 4));
    const x = (i) => PAD.left + i * band + (band - barW) / 2;
    const y = (n) => PAD.top + PLOT_H * (1 - n / yMax);
    return { peak, ticks, band, barW, x, y };
  }, [stats]);

  const headline = [
    { value: stats.papers, label: 'academic papers' },
    { value: stats.researchers, label: 'researchers' },
    { value: stats.venues, label: 'journals & venues' },
    { value: stats.citations, label: 'citations to these papers' },
  ];

  const firstYear = stats.byYear[0][0];
  const lastYear = stats.byYear[stats.byYear.length - 1][0];
  const peakYear = stats.byYear.find(([, n]) => n === chart.peak)[0];
  const asOfLabel =
    stats.asOf &&
    new Date(stats.asOf).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });

  return (
    <div className={styles.corpusStats}>
      <div className={styles.statRow}>
        {headline.map((s) => (
          <div key={s.label} className={styles.statTile}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.chartBlock}>
        <p className={styles.chartTitle}>Papers by year of publication</p>
        <div className={styles.chartWrap}>
          <svg
            className={styles.chart}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Column chart of corpus papers by publication year, ${firstYear} to ${lastYear}. Research output grows from ${stats.byYear[0][1]} papers in ${firstYear} to a peak of ${chart.peak} in ${peakYear}.`}
            onMouseLeave={() => setHover(null)}
          >
            {chart.ticks.map((t) => (
              <g key={t}>
                <line
                  className={styles.gridline}
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={chart.y(t)}
                  y2={chart.y(t)}
                />
                <text
                  className={styles.tickLabel}
                  x={PAD.left - 6}
                  y={chart.y(t) + 3}
                  textAnchor="end"
                >
                  {t}
                </text>
              </g>
            ))}
            {stats.byYear.map(([year, n], i) => (
              <g key={year}>
                <path
                  className={hover === i ? styles.barHover : styles.bar}
                  d={barPath(chart.x(i), chart.barW, chart.y(n))}
                />
                {n === chart.peak && hover !== i && (
                  <text
                    className={styles.peakLabel}
                    x={chart.x(i) + chart.barW / 2}
                    y={chart.y(n) - 6}
                    textAnchor="middle"
                  >
                    {n}
                  </text>
                )}
                {year % 5 === 0 && (
                  <text
                    className={styles.tickLabel}
                    x={chart.x(i) + chart.barW / 2}
                    y={H - 6}
                    textAnchor="middle"
                  >
                    {year}
                  </text>
                )}
                <rect
                  className={styles.hitArea}
                  x={PAD.left + i * chart.band}
                  y={PAD.top}
                  width={chart.band}
                  height={PLOT_H}
                  onMouseEnter={() => setHover(i)}
                />
              </g>
            ))}
          </svg>
          {hover !== null && (
            <div
              className={styles.chartTooltip}
              style={{
                left: `${((PAD.left + hover * chart.band + chart.band / 2) / W) * 100}%`,
              }}
            >
              {stats.byYear[hover][0]} · {stats.byYear[hover][1]} papers
            </div>
          )}
        </div>
        <p className={styles.chartFootnote}>
          {stats.preChart > 0 &&
            `Plus ${stats.preChart} earlier foundational works dating back to ${stats.earliestYear}. `}
          {lastYear >= new Date().getFullYear() && `${lastYear} is year-to-date.`}
          {asOfLabel && ` Corpus updated ${asOfLabel}.`}
        </p>
      </div>
    </div>
  );
}
