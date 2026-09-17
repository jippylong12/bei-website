import { useMemo } from 'react';
import styles from './Chat.module.css';

// How many classes get a bar. The tail is summed into the footnote rather than
// drawn, because past ten the bars are too short to compare and the list stops
// being a chart and starts being a table. The heading spells this number out,
// so change both together.
const TOP_N = 10;

// "Other" is a real class in the taxonomy — the bucket for papers that are
// about Bitcoin but not about any of the topical classes — and it is large
// enough to place in the top ten. It is shown rather than quietly dropped: a
// chart that hides its own catch-all overstates every topic above it. Flip
// this to false for a purely topical chart, and the footnote follows along.
const INCLUDE_CATCH_ALL = true;
const CATCH_ALL = new Set(['Other', 'Uncategorized']);

// The catch-all classes are the exception to row-as-button: "What does the
// research say about Other?" is not a question, and a button that produces a
// bad query is worse than a row that stays inert. Every topical class gets one.
function questionFor(name) {
  return CATCH_ALL.has(name) ? null : `What does the research say about ${name}?`;
}

export default function ClassChart({ stats, onPick }) {
  const { byClass, classified } = stats;

  const view = useMemo(() => {
    if (!Array.isArray(byClass) || !byClass.length || !classified) {
      return { top: [], max: 1, shown: 0, tail: 0, tailClasses: 0 };
    }
    const pool = INCLUDE_CATCH_ALL ? byClass : byClass.filter(([n]) => !CATCH_ALL.has(n));
    const ranked = [...pool].sort((a, b) => b[1] - a[1]);
    const top = ranked.slice(0, TOP_N);
    const max = top.length ? top[0][1] : 1;
    const shown = top.reduce((sum, [, n]) => sum + n, 0);
    return { top, max, shown, tail: classified - shown, tailClasses: pool.length - top.length };
  }, [byClass, classified]);

  if (!view.top.length) return null;

  const share = (n) => ((n / classified) * 100).toFixed(1);

  return (
    <div className={styles.chartBlock}>
      <p className={styles.chartTitle}>The ten largest subject classes</p>
      <ul className={styles.classChart}>
        {view.top.map(([name, n], i) => {
          // The bar is the same markup either way; only its wrapper differs, so
          // an inert row lines up with the buttons above and below it.
          const cells = (
            <>
              <span className={styles.className}>{name}</span>
              <span className={styles.classTrack} aria-hidden="true">
                <span
                  className={styles.classBar}
                  style={{ width: `${(n / view.max) * 100}%`, animationDelay: `${i * 45}ms` }}
                />
              </span>
              <span className={styles.classValue}>{n.toLocaleString('en-US')}</span>
              <span className={styles.classShare}>{share(n)}%</span>
            </>
          );
          const question = onPick ? questionFor(name) : null;

          return (
            <li key={name} className={styles.classItem}>
              {question ? (
                <button
                  type="button"
                  className={`${styles.classRow} ${styles.classRowButton}`}
                  onClick={() => onPick(question)}
                  aria-label={`Ask about ${name} — ${n.toLocaleString('en-US')} papers`}
                >
                  {cells}
                </button>
              ) : (
                <div className={styles.classRow}>{cells}</div>
              )}
            </li>
          );
        })}
      </ul>
      <p className={styles.chartFootnote}>
        Each paper&rsquo;s primary subject, out of {classified.toLocaleString('en-US')} classified.
        {view.tail > 0 &&
          ` A further ${view.tail.toLocaleString('en-US')} sit in ${view.tailClasses} smaller classes not shown.`}
        {onPick && ' Select a class to start a question about it.'}
      </p>
    </div>
  );
}
