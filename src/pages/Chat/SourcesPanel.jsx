import styles from './Chat.module.css';

function formatPages(s) {
  if (s.page_start == null) return null;
  return s.page_start === s.page_end
    ? `p. ${s.page_start}`
    : `pp. ${s.page_start}–${s.page_end}`;
}

// The API returns absolute publication URLs: a direct DOI (doi.org) where one
// was resolved, else a Google Scholar search that lands on the publication.
function sourceHref(s) {
  return s.url || null;
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
                  {(() => {
                    const href = sourceHref(s);
                    const label = s.title || s.filename;
                    return href ? (
                      <a
                        className={styles.sourceTitleLink}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={
                          s.link_type === 'publication'
                            ? 'Open the publication'
                            : 'Find this paper'
                        }
                      >
                        {label}
                        <span className={styles.sourceLinkIcon} aria-hidden="true">
                          {' ↗'}
                        </span>
                      </a>
                    ) : (
                      <span className={styles.sourceTitle}>{label}</span>
                    );
                  })()}
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
