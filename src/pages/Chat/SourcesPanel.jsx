import { API_BASE } from '../../config/api';
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

function doiHref(doi) {
  if (!doi) return null;
  return String(doi).startsWith('http') ? doi : `https://doi.org/${doi}`;
}

// Corpus PDF hosted by the API. `pdf` is a path, not an absolute URL, so it is
// prefixed with API_BASE like every other backend call — a bare /api/... would
// resolve against btcedu.org, which serves no API.
function pdfHref(s) {
  return s.pdf ? `${API_BASE}${s.pdf}` : null;
}

// Identifier chips shown under a source: DOI / arXiv / PDF (linked) + chunk count.
function sourceChips(s) {
  const chips = [];
  const dh = doiHref(s.doi);
  if (dh) chips.push({ key: 'doi', label: 'DOI', href: dh });
  if (s.arxiv_id)
    chips.push({ key: 'arxiv', label: `arXiv:${s.arxiv_id}`, href: `https://arxiv.org/abs/${s.arxiv_id}` });
  // The backend sets `pdf` only on papers it will actually serve — the ones with
  // no DOI, arXiv id or publisher URL, whose titles would otherwise be dead text
  // with nowhere for a reader to go. Papers the publisher hosts get null here, so
  // this chip never competes with the DOI link and never 404s.
  const ph = pdfHref(s);
  if (ph) chips.push({ key: 'pdf', label: 'PDF', href: ph });
  if (s.num_chunks) chips.push({ key: 'chunks', label: `${s.num_chunks} chunks`, ghost: true });
  return chips;
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
            const affils = (s.affiliations || []).filter(Boolean).slice(0, 4);
            const emails = (s.emails || []).filter(Boolean).slice(0, 4);
            const chips = sourceChips(s);
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
                    {s.category && <span className={styles.sourceCat}>{s.category}</span>}
                    {[s.authors, s.year, s.section ? `§ ${s.section}` : null, pages]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {affils.length > 0 && (
                    <span className={styles.sourceAffil}>
                      <span className={styles.sourceIcon} aria-hidden="true">🏛</span>
                      {' '}
                      {affils.join(' · ')}
                    </span>
                  )}
                  {emails.length > 0 && (
                    <span className={styles.sourceEmails}>
                      <span className={styles.sourceIcon} aria-hidden="true">✉</span>
                      {' '}
                      {emails.map((e, i) => (
                        <span key={e}>
                          {i > 0 ? ' · ' : ''}
                          <a className={styles.sourceEmailLink} href={`mailto:${e}`}>
                            {e}
                          </a>
                        </span>
                      ))}
                    </span>
                  )}
                  {chips.length > 0 && (
                    <span className={styles.sourceChips}>
                      {chips.map((c) =>
                        c.href ? (
                          <a
                            key={c.key}
                            className={styles.chip}
                            href={c.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {c.label}
                          </a>
                        ) : (
                          <span key={c.key} className={`${styles.chip} ${c.ghost ? styles.chipGhost : ''}`}>
                            {c.label}
                          </span>
                        )
                      )}
                    </span>
                  )}
                  {s.snippet && <p className={styles.sourceSnippet}>{s.snippet}…</p>}
                  {s.abstract && (
                    <details className={styles.sourceAbstract}>
                      <summary className={styles.sourceAbstractSummary}>Abstract</summary>
                      <p className={styles.sourceAbstractText}>{s.abstract}…</p>
                    </details>
                  )}
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
