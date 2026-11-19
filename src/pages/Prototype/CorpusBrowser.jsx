import { useId, useMemo, useState } from 'react';
import { authorLine } from './prototypeData';
import styles from './Prototype.module.css';

// The papers of the prototype corpus (GET /api/papers, parsed by parsePapers):
// search, a subject filter, and links to each paper's publication or DOI. The
// full texts are not hosted, so there is no PDF link.

// Rows shown before "Show all".
const FIRST_ROWS = 10;

function PaperRow({ paper }) {
  const { title, authors, year, venue, doi, url, linkType, category, published, abstract } = paper;
  return (
    <li className={styles.paper}>
      {url ? (
        <a
          className={styles.paperTitle}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={linkType === 'publication' ? 'Open the publication' : 'Find this paper'}
        >
          {title}
          <span className={styles.paperLinkIcon} aria-hidden="true">
            {' ↗'}
          </span>
        </a>
      ) : (
        <span className={styles.paperTitle}>{title}</span>
      )}
      <p className={styles.paperMeta}>{[authorLine(authors), year, venue].filter(Boolean).join(' · ')}</p>
      <div className={styles.paperTags}>
        <span className={styles.tag}>{category}</span>
        {!published && <span className={`${styles.tag} ${styles.tagQuiet}`}>Unpublished</span>}
        {doi && (
          <a
            className={styles.doiLink}
            href={`https://doi.org/${encodeURI(doi)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            DOI {doi}
          </a>
        )}
      </div>
      {abstract && (
        <details className={styles.paperAbstract}>
          <summary>Abstract</summary>
          <p>{abstract}</p>
        </details>
      )}
    </li>
  );
}

function PaperList({ papers }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [showAll, setShowAll] = useState(false);
  const searchId = useId();
  const subjectId = useId();

  // Newest first; the text each paper is searched by.
  const rows = useMemo(
    () =>
      [...papers]
        .sort((a, b) => (b.year || '0').localeCompare(a.year || '0') || a.title.localeCompare(b.title))
        .map((paper) => ({
          paper,
          text: [paper.title, paper.authors.join(' '), paper.year, paper.venue, paper.category, paper.doi]
            .join(' ')
            .toLowerCase(),
        })),
    [papers],
  );

  const subjects = useMemo(() => {
    const counts = new Map();
    for (const p of papers) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [papers]);

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = words.length > 0 || category !== '';
  const shown = rows
    .filter((r) => (!category || r.paper.category === category) && words.every((w) => r.text.includes(w)))
    .map((r) => r.paper);
  const visible = showAll ? shown : shown.slice(0, FIRST_ROWS);
  const noun = (n) => (n === 1 ? 'paper' : 'papers');

  const clear = () => {
    setQuery('');
    setCategory('');
  };

  return (
    <div className={styles.browser}>
      <div className={styles.browserControls}>
        <label className="sr-only" htmlFor={searchId}>
          Search the papers
        </label>
        <input
          id={searchId}
          className={`${styles.field} ${styles.searchField}`}
          type="search"
          placeholder="Search titles, authors, years"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="sr-only" htmlFor={subjectId}>
          Subject
        </label>
        <select
          id={subjectId}
          className={`${styles.field} ${styles.subjectField}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All subjects ({papers.length})</option>
          {subjects.map(([name, n]) => (
            <option key={name} value={name}>
              {name} ({n})
            </option>
          ))}
        </select>
      </div>

      <p className={styles.browserCount} aria-live="polite">
        {filtered
          ? `${shown.length} of ${papers.length} papers match`
          : `${papers.length} ${noun(papers.length)}, newest first`}
      </p>

      {shown.length > 0 ? (
        <ol className={styles.paperList}>
          {visible.map((p) => (
            <PaperRow key={p.id} paper={p} />
          ))}
        </ol>
      ) : (
        <p className={styles.quiet}>
          No paper matches.{' '}
          <button type="button" className={styles.linkButton} onClick={clear}>
            Clear the search
          </button>
        </p>
      )}

      {shown.length > visible.length && (
        <button type="button" className={styles.moreButton} onClick={() => setShowAll(true)}>
          Show all {shown.length} {noun(shown.length)}
        </button>
      )}
    </div>
  );
}

// `state` is usePrototypeApi's: {status: 'loading' | 'ready' | 'unavailable', data}.
export default function CorpusBrowser({ state }) {
  if (state.status === 'loading') return <p className={styles.quiet}>Loading the list of papers…</p>;
  if (state.status !== 'ready') {
    return <p className={styles.quiet}>The list of papers is not available right now. Please try again later.</p>;
  }
  return <PaperList papers={state.data} />;
}
