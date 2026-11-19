import { useEffect, useId, useRef, useState } from 'react';
import Composer from '../Chat/Composer';
import MessageList from '../Chat/MessageList';
import useChatStream from '../Chat/useChatStream';
import { createMemoryStore, exportTranscript } from '../Chat/storage';
import { PROTOTYPE_API_BASE } from '../../config/prototypeApi';
import { EXAMPLE_QUESTIONS } from './examples';
import { PAPER_COUNT } from './prototypeData';
import chatStyles from '../Chat/Chat.module.css';
import styles from './Prototype.module.css';

// The chat on /prototype, built from /BitResearch's parts (Composer,
// MessageList, useChatStream) with the prototype's API and options. Its
// conversation is its own: it survives leaving the page and coming back, not a
// reload, and never mixes with /BitResearch's.
const store = createMemoryStore();

const NETWORK_ERROR = 'The BitResearch prototype could not be reached. Please try again in a moment.';

const ASSISTANT_PROPS = {
  // A citation opens the evidence beside the answer; the title in the sources
  // panel still links to the paper.
  chipsOpenPanel: true,
  refusalNote:
    `The ${PAPER_COUNT} papers in this prototype do not contain enough evidence to answer this, ` +
    'so BitResearch does not attempt an answer.',
  // The prototype hosts no full texts, and shows no author e-mail addresses.
  sourcesPanelProps: { showPdf: false, showEmails: false, tidyMetadata: true, apiBase: PROTOTYPE_API_BASE },
};

const MODE_TITLES = {
  quick: 'Quick: answers from the most relevant passages',
  deep: 'Deep: searches more widely across the papers (slower, more thorough)',
};

const PAGE_URL = 'https://btcedu.org/prototype';

function transcriptOptions() {
  const date = new Date().toISOString().slice(0, 10);
  return {
    title: 'BitResearch prototype transcript',
    preamble: [`${date} · Corpus: ${PAPER_COUNT} papers · ${PAGE_URL}`],
    filename: 'bitresearch-prototype-transcript.md',
  };
}

const matches = (query) =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

// `composerRef` lets the page fill the question box from elsewhere (the
// subject chart).
export default function PrototypeChat({ composerRef }) {
  const { messages, isStreaming, send, stop, reset, sendFeedback } = useChatStream({
    apiBase: PROTOTYPE_API_BASE,
    store,
    networkError: NETWORK_ERROR,
  });
  const [deep, setDeep] = useState(false);
  // Focus the box on load only with a mouse: on a phone it would open the
  // keyboard over the page.
  const [finePointer] = useState(() => matches('(pointer: fine)'));
  const cardRef = useRef(null);
  const wasEmpty = useRef(messages.length === 0);
  const examplesLabel = useId();
  const empty = messages.length === 0;

  const ask = (text) => send(text, { deep });

  // The first question turns the card into a conversation, taller than the
  // examples it replaces: bring its top into view, so the answer is seen
  // arriving rather than below the fold.
  useEffect(() => {
    if (wasEmpty.current && !empty) {
      cardRef.current?.scrollIntoView?.({
        block: 'start',
        behavior: matches('(prefers-reduced-motion: reduce)') ? 'auto' : 'smooth',
      });
    }
    wasEmpty.current = empty;
  }, [empty]);

  return (
    <section ref={cardRef} className={styles.chatCard} aria-label="Ask the papers">
      {!empty && (
        <>
          <div className={styles.chatToolbar}>
            <span className={styles.chatToolbarTitle}>Conversation</span>
            <div className={styles.chatToolbarActions}>
              <button
                type="button"
                className={chatStyles.newChat}
                onClick={() => exportTranscript(messages, transcriptOptions())}
              >
                Export
              </button>
              <button type="button" className={chatStyles.newChat} onClick={reset} disabled={isStreaming}>
                New conversation
              </button>
            </div>
          </div>
          <div className={styles.conversation}>
            <MessageList
              messages={messages}
              onFeedback={sendFeedback}
              onAsk={ask}
              assistantProps={ASSISTANT_PROPS}
            />
          </div>
        </>
      )}

      <Composer
        onSend={ask}
        onStop={stop}
        isStreaming={isStreaming}
        deep={deep}
        onToggleDeep={() => setDeep((d) => !d)}
        modeControl="segmented"
        modeTitles={MODE_TITLES}
        placeholder={`Ask a question about the ${PAPER_COUNT} papers…`}
        className={styles.composer}
        autoFocus={empty && finePointer}
        ref={composerRef}
      />

      {empty && (
        <div className={styles.examples}>
          <p className={styles.examplesLabel} id={examplesLabel}>
            Try a question
          </p>
          <ul className={styles.exampleList} aria-labelledby={examplesLabel}>
            {EXAMPLE_QUESTIONS.map((q) => (
              <li key={q}>
                <button type="button" className={styles.exampleChip} onClick={() => ask(q)} disabled={isStreaming}>
                  {q}
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.chatNote}>
            Ask about findings, methods, or how studies compare, not live prices or predictions. If the
            papers do not cover a question, BitResearch is designed to say so instead of guessing.
          </p>
        </div>
      )}

      <p className={styles.disclaimer}>
        Prototype: answers come only from the {PAPER_COUNT} papers in this corpus and cite their sources.
        Educational material, not financial advice.
      </p>
    </section>
  );
}
