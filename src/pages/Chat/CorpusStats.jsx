import { useState } from 'react';
import styles from './Chat.module.css';

// Snapshot of the corpus library metadata (metadata.zip, 2026-08-03). Regenerate
// from pdf_metadata.csv when the corpus is re-harvested. Values are rounded down
// so they stay true as the corpus grows.
const HEADLINE = [
  { value: '3,900+', label: 'academic papers' },
  { value: '7,400+', label: 'researchers' },
  { value: '~1,000', label: 'journals & venues' },
  { value: '72,000+', label: 'citations to these papers' },
];

const BY_YEAR = [
  [2008, 52], [2009, 55], [2010, 37], [2011, 38], [2012, 37], [2013, 56],
  [2014, 151], [2015, 133], [2016, 128], [2017, 191], [2018, 281], [2019, 330],
  [2020, 322], [2021, 361], [2022, 345], [2023, 308], [2024, 283], [2025, 507],
  [2026, 245],
];
const PRE_2008 = 215; // foundational economics literature back to 1938

// Chart geometry (SVG user units; the SVG itself scales to its container).
const W = 640;
const H = 190;
const PAD = { top: 20, right: 6, bottom: 22, left: 34 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const Y_MAX = 520;
const Y_TICKS = [0, 250, 500];
const PEAK = Math.max(...BY_YEAR.map(([, n]) => n));

const band = PLOT_W / BY_YEAR.length;
const barW = Math.min(24, band - 4);
const x = (i) => PAD.left + i * band + (band - barW) / 2;
const y = (n) => PAD.top + PLOT_H * (1 - n / Y_MAX);

// Bar with a 4px rounded data-end and a square baseline.
function barPath(i, n) {
  const bx = x(i);
  const by = y(n);
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

  return (
    <div className={styles.corpusStats}>
      <div className={styles.statRow}>
        {HEADLINE.map((s) => (
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
            aria-label={`Column chart of corpus papers by publication year, 2008 to 2026. Research output grows from ${BY_YEAR[0][1]} papers in 2008 to a peak of ${PEAK} in 2025.`}
            onMouseLeave={() => setHover(null)}
          >
            {Y_TICKS.map((t) => (
              <g key={t}>
                <line
                  className={styles.gridline}
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                />
                <text className={styles.tickLabel} x={PAD.left - 6} y={y(t) + 3} textAnchor="end">
                  {t}
                </text>
              </g>
            ))}
            {BY_YEAR.map(([year, n], i) => (
              <g key={year}>
                <path
                  className={hover === i ? styles.barHover : styles.bar}
                  d={barPath(i, n)}
                />
                {n === PEAK && hover !== i && (
                  <text
                    className={styles.peakLabel}
                    x={x(i) + barW / 2}
                    y={y(n) - 6}
                    textAnchor="middle"
                  >
                    {n}
                  </text>
                )}
                {year % 5 === 0 && (
                  <text
                    className={styles.tickLabel}
                    x={x(i) + barW / 2}
                    y={H - 6}
                    textAnchor="middle"
                  >
                    {year}
                  </text>
                )}
                <rect
                  className={styles.hitArea}
                  x={PAD.left + i * band}
                  y={PAD.top}
                  width={band}
                  height={PLOT_H}
                  onMouseEnter={() => setHover(i)}
                />
              </g>
            ))}
          </svg>
          {hover !== null && (
            <div
              className={styles.chartTooltip}
              style={{ left: `${((PAD.left + hover * band + band / 2) / W) * 100}%` }}
            >
              {BY_YEAR[hover][0]} · {BY_YEAR[hover][1]} papers
            </div>
          )}
        </div>
        <p className={styles.chartFootnote}>
          Plus {PRE_2008} earlier foundational works dating back to 1938. 2026 is year-to-date.
        </p>
      </div>
    </div>
  );
}
