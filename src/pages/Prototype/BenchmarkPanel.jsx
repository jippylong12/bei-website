import styles from './Prototype.module.css';

// The bake-off's result (GET /api/benchmark, parsed by parseBenchmark): the
// open-weight models answering from the corpus, beside frontier models
// answering the same questions from memory. The page leaves this panel out
// when the API has no benchmark.

const DEFAULT_METHOD =
  'Accuracy is the share of the 100 questions whose answer matches the benchmark’s answer key. ' +
  'The open-weight models answer from passages retrieved from the 100 papers; the frontier models ' +
  'answer the same questions from memory, with no papers supplied.';

const percent = (accuracy) => `${Number((accuracy * 100).toFixed(1))}%`;

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function Group({ title, entries, muted }) {
  return (
    <div className={styles.benchGroup}>
      <h3 className={styles.benchGroupTitle}>{title}</h3>
      <ul className={styles.benchList}>
        {entries.map((e, i) => (
          <li key={`${i}-${e.label}`} className={styles.benchRow}>
            <span className={styles.benchLabel}>
              {e.label}
              {e.note && <span className={styles.benchNote}>{e.note}</span>}
            </span>
            <span className={styles.benchTrack} aria-hidden="true">
              <span
                className={muted ? `${styles.benchBar} ${styles.benchBarMuted}` : styles.benchBar}
                style={{ width: `${Math.max(0.5, e.accuracy * 100)}%` }}
              />
            </span>
            <span className={styles.benchValue}>
              {percent(e.accuracy)}
              {e.correct != null && (
                <span className={styles.benchCount}>
                  {' '}
                  ({e.correct}/{e.total})
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BenchmarkPanel({ benchmark }) {
  const { models, baselines, method, asOf, retrieval, corpus } = benchmark;
  const details = [
    asOf && `Measured ${formatDate(asOf)}`,
    corpus && `Corpus: ${corpus}`,
    retrieval && `Retrieval: ${retrieval}`,
  ].filter(Boolean);

  return (
    <section className={styles.section} aria-labelledby="prototype-benchmark">
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle} id="prototype-benchmark">
          Benchmark
        </h2>
        <p className={styles.sectionLede}>
          Accuracy on the verified 100-question benchmark. Each question is drawn from one of the papers,
          and its expected answer was checked against that paper&rsquo;s text.
        </p>
      </div>
      <Group title="Open-weight models, answering from the 100 papers" entries={models} />
      {baselines.length > 0 && (
        <Group title="Frontier models answering from memory, without the corpus" entries={baselines} muted />
      )}
      <p className={styles.sectionNote}>{method || DEFAULT_METHOD}</p>
      {details.length > 0 && <p className={styles.fineprint}>{details.join(' · ')}</p>}
    </section>
  );
}
