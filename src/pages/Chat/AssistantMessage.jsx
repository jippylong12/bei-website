import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import SourcesPanel from './SourcesPanel';
import { toCitationLinks } from './citations';
import styles from './Chat.module.css';

const DEFAULT_REFUSAL_NOTE =
  'The corpus did not contain enough evidence to answer this — the assistant only answers ' +
  'from BEI’s academic papers and never guesses.';

// Optional props, for pages other than /BitResearch (the /prototype page). The
// defaults are exactly what /BitResearch has always done:
// - chipsOpenPanel: a citation chip opens this answer's sources panel at that
//   source, even when the source has a link. By default a chip whose source
//   has a URL links straight to the paper online.
// - refusalNote: the line under an answer the API marked as a refusal.
// - sourcesPanelProps: passed through to SourcesPanel.
export default function AssistantMessage({
  message,
  onFeedback,
  onAsk,
  chipsOpenPanel = false,
  refusalNote = DEFAULT_REFUSAL_NOTE,
  sourcesPanelProps,
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [activeSource, setActiveSource] = useState(null);
  const [copied, setCopied] = useState(false);

  const { content, status, statusText, sources, citationsUsed, refused,
    errorMessage, feedback, followups, mode } = message;
  const processed = useMemo(() => toCitationLinks(content || ''), [content]);

  const openSource = (index) => {
    setSourcesOpen(true);
    setActiveSource(index);
    requestAnimationFrame(() => {
      document.getElementById(`source-${index}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  };

  // index -> {url, title} so a [n] chip can link straight to the paper online
  const sourceByIndex = useMemo(() => {
    const m = {};
    for (const s of sources || []) m[s.index] = s;
    return m;
  }, [sources]);

  const components = useMemo(
    () => ({
      a({ href, children }) {
        if (href?.startsWith('#src-')) {
          const n = Number(href.slice(5));
          const src = sourceByIndex[n];
          // A number with no source behind it (a bracketed year, or a model
          // citing past the end of the list) stays the text it was.
          if (!src) return <>[{n}]</>;
          if (src.url && !chipsOpenPanel) {
            // chip links to the paper online; title tooltip names it
            return (
              <a
                className={styles.citationChip}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                title={src.title || src.filename || `Source ${n}`}
                aria-label={`Open source ${n}: ${src.title || 'paper'}`}
              >
                {n}
              </a>
            );
          }
          return (
            <button
              type="button"
              className={styles.citationChip}
              onClick={() => openSource(n)}
              title={src.title || src.filename || `Source ${n}`}
              aria-label={`Show source ${n}`}
            >
              {n}
            </button>
          );
        }
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      },
    }),
    [sourceByIndex, chipsOpenPanel]
  );

  return (
    <div className={`${styles.assistantMessage} ${refused ? styles.refusedMessage : ''}`}>
      {statusText && (
        <p className={styles.statusLine}>
          <span className={styles.statusPulse} />
          {statusText}
        </p>
      )}

      {content && (
        <div className={styles.markdown}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={components}
          >
            {processed}
          </ReactMarkdown>
          {status === 'streaming' && <span className={styles.caret} />}
        </div>
      )}

      {status === 'error' && <p className={styles.errorLine}>{errorMessage}</p>}
      {status === 'stopped' && <p className={styles.stoppedLine}>Response stopped.</p>}
      {refused && status === 'done' && <p className={styles.refusalNote}>{refusalNote}</p>}

      {status === 'done' && mode === 'deep' && sources?.length > 0 && (
        <p className={styles.deepMeta}>
          Deep research — broader retrieval across {sources.length}{' '}
          {sources.length === 1 ? 'paper' : 'papers'}
        </p>
      )}

      <SourcesPanel
        sources={sources}
        citationsUsed={citationsUsed}
        open={sourcesOpen}
        onToggle={() => setSourcesOpen((o) => !o)}
        activeSource={activeSource}
        {...sourcesPanelProps}
      />

      {status === 'done' && content && !refused && (
        <div className={styles.answerActions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${feedback === 'up' ? styles.actionActive : ''}`}
            onClick={() => onFeedback?.('up')}
            aria-label="Helpful answer"
            title="Helpful"
          >
            👍
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${feedback === 'down' ? styles.actionActive : ''}`}
            onClick={() => onFeedback?.('down')}
            aria-label="Not helpful"
            title="Not helpful"
          >
            👎
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => {
              navigator.clipboard?.writeText(content).then(
                () => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                },
                () => {}
              );
            }}
            title="Copy answer"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          {feedback && <span className={styles.feedbackThanks}>Thanks for the feedback.</span>}
        </div>
      )}

      {status === 'done' && followups?.length > 0 && (
        <div className={styles.followups}>
          <span className={styles.followupsLabel}>Related questions</span>
          <div className={styles.followupChips}>
            {followups.map((q) => (
              <button
                key={q}
                type="button"
                className={styles.followupChip}
                onClick={() => onAsk?.(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
