import styles from './Chat.module.css';

function formatPages(s) {
  if (s.page_start == null) return null;
  return s.page_start === s.page_end ? `p. ${s.page_start}` : `pp. ${s.page_start}–${s.page_end}`;
}

export default function SourcesPanel({ sources, citationsUsed, open, onToggle, activeSource }) {
  if (!sources?.length) return null;
  const citedSet = new Set(citationsUsed || []);

  return (
    <div className={styles.sourcesPanel}>
      <button className={styles.sourcesToggle} onClick={onToggle} aria-expanded={open}>
        <span className={`${styles.sourcesChevron} ${open ? styles.sourcesChevronOpen : ''}`}>›</span>
        Sources ({sources.length}{citedSet.size ? `, ${citedSet.size} cited` : ''})
      </button>
      {open && (
        <ol className={styles.sourceList}>
          {sources.map((s) => {
            const pages = formatPages(s);
            const isActive = activeSource === s.index;
            return (
              <li
                key={s.index}
                id={`source-${s.index}`}
                className={`${styles.sourceItem} ${isActive ? styles.sourceActive : ''}`}
              >
                <span className={`${styles.sourceIndex} ${citedSet.has(s.index) ? styles.sourceIndexCited : ''}`}>
                  {s.index}
                </span>
                <div className={styles.sourceBody}>
                  <span className={styles.sourceTitle}>{s.title || s.filename}</span>
                  <span className={styles.sourceMeta}>
                    {[s.authors, s.year, s.section ? `§ ${s.section}` : null, pages]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {s.snippet && <p className={styles.sourceSnippet}>{s.snippet}…</p>}
                  {typeof s.score === 'number' && (
                    <span className={styles.scoreBar} title={`Relevance ${(s.score * 100).toFixed(0)}%`}>
                      <span
                        className={styles.scoreFill}
                        style={{ width: `${Math.min(100, Math.round(s.score * 100))}%` }}
                      />
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
