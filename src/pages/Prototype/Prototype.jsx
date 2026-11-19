import { useRef } from 'react';
import CorpusStats from '../Chat/CorpusStats';
import useCorpusStats from '../Chat/useCorpusStats';
import { PROTOTYPE_API_BASE } from '../../config/prototypeApi';
import BenchmarkPanel from './BenchmarkPanel';
import CorpusBrowser from './CorpusBrowser';
import HowItWorks from './HowItWorks';
import PrototypeChat from './PrototypeChat';
import usePrototypeApi from './usePrototypeApi';
import { PAPER_COUNT, PROTOTYPE_STATS_FALLBACK, parseBenchmark, parseHealth, parsePapers } from './prototypeData';
import styles from './Prototype.module.css';

// btcedu.org/prototype: the BitResearch prototype for the grant demo. A
// question box over 100 papers, answered with citations by an open-weight
// model on our own GPU, then how it works, the benchmark and the papers.
// Everything it shows comes from the prototype API (src/config/prototypeApi.js),
// never from the production BitResearch API.
const STATS_OPTIONS = { apiBase: PROTOTYPE_API_BASE, fallback: PROTOTYPE_STATS_FALLBACK };

export default function Prototype() {
  const stats = useCorpusStats(STATS_OPTIONS);
  const health = usePrototypeApi('/api/health', parseHealth);
  const papers = usePrototypeApi('/api/papers', parsePapers);
  const benchmark = usePrototypeApi('/api/benchmark', parseBenchmark);
  const composerRef = useRef(null);
  const modelLabel = health.data?.modelLabel;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Bitcoin Education Institute</p>
        <h1 className={styles.title}>BitResearch prototype</h1>
        <p className={styles.lede}>
          Ask questions about {PAPER_COUNT} Bitcoin research papers. Every answer cites the papers it comes from.
        </p>
        <ul className={styles.badges} aria-label="About this prototype">
          <li className={styles.badge}>{stats.papers} papers</li>
          <li className={styles.badge}>
            {modelLabel ? (
              <>
                <span className={styles.badgeStrong}>{modelLabel}</span> · open weights, our own GPU
              </>
            ) : (
              'Open-weight model · our own GPU'
            )}
          </li>
          <li className={styles.badge}>No sign-up</li>
        </ul>
      </div>

      <PrototypeChat composerRef={composerRef} />

      <HowItWorks />

      {benchmark.status === 'ready' && <BenchmarkPanel benchmark={benchmark.data} />}

      <section className={styles.section} aria-labelledby="prototype-papers">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} id="prototype-papers">
            The {PAPER_COUNT} papers
          </h2>
          <p className={styles.sectionLede}>
            Published and unpublished research on Bitcoin, from markets and monetary economics to protocol
            design, security and mining. Each title links to the publication, or to a search for it; the
            full texts are not hosted here.
          </p>
        </div>
        <div className={styles.statsWrap}>
          <CorpusStats stats={stats} onPick={(q) => composerRef.current?.fill(q)} noteUndated />
        </div>
        <CorpusBrowser state={papers} />
      </section>
    </div>
  );
}
