import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import SourcesPanel from './SourcesPanel';
import styles from './Chat.module.css';

// Turn bare [3] citation markers into markdown links (#src-3) so the custom
// renderer below can draw them as chips. Negative lookahead skips text that
// is already a markdown link.
const toCitationLinks = (text) => text.replace(/\[(\d+)\](?!\()/g, '[$1](#src-$1)');

export default function AssistantMessage({ message, onFeedback, onAsk }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [activeSource, setActiveSource] = useState(null);
  const [copied, setCopied] = useState(false);

  const { content, status, statusText, sources, citationsUsed, refused,
    errorMessage, feedback, followups } = message;
  const processed = useMemo(() => toCitationLinks(content || ''), [content]);

  const openSource = (index) => {
    setSourcesOpen(true);
    setActiveSource(index);
    requestAnimationFrame(() => {
      document.getElementById(`source-${index}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  };

  const components = useMemo(
    () => ({
      a({ href, children }) {
        if (href?.startsWith('#src-')) {
          const n = Number(href.slice(5));
          return (
            <button
              type="button"
              className={styles.citationChip}
              onClick={() => openSource(n)}
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
    []
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
      {refused && status === 'done' && (
        <p className={styles.refusalNote}>
          The corpus did not contain enough evidence to answer this — the assistant only answers
          from BEI&rsquo;s academic papers and never guesses.
        </p>
      )}

      <SourcesPanel
        sources={sources}
        citationsUsed={citationsUsed}
        open={sourcesOpen}
        onToggle={() => setSourcesOpen((o) => !o)}
        activeSource={activeSource}
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
