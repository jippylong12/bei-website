import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Composer from './Composer';
import CorpusStats from './CorpusStats';
import MessageList from './MessageList';
import useChatStream from './useChatStream';
import useCorpusStats from './useCorpusStats';
import { exportTranscript } from './storage';
import styles from './Chat.module.css';

export default function Chat() {
  const { messages, isStreaming, send, stop, reset, sendFeedback } = useChatStream();
  const stats = useCorpusStats();
  const [deep, setDeep] = useState(false);
  const composerRef = useRef(null);
  const empty = messages.length === 0;
  const ask = (text) => send(text, { deep });
  const suggest = (text) => composerRef.current?.fill(text);

  const composer = (
    <Composer
      onSend={ask}
      onStop={stop}
      isStreaming={isStreaming}
      deep={deep}
      onToggleDeep={() => setDeep((d) => !d)}
      autoFocus={empty}
      ref={composerRef}
    />
  );

  return (
    <section className={styles.page}>
      <div className={`${styles.chatFrame} ${empty ? styles.chatFrameEmpty : ''}`}>
        {empty ? (
          <div className={styles.emptyState}>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              BitResearch
            </motion.h1>
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Ask questions across BEI&rsquo;s corpus of {stats.papersApprox} academic papers on Bitcoin.
              Every answer cites the specific studies it draws from.
            </motion.p>
            <motion.div
              className={styles.composerCentered}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {composer}
            </motion.div>
            {/* The class chart below lists what the corpus covers, in the
                proportions it actually covers them — so this line no longer
                spells the topics out, it only says what kind of question
                works. */}
            <motion.p
              className={styles.corpusNote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Ask about findings, methods, or how studies compare — not live prices
              or predictions.
            </motion.p>
            <motion.p
              className={styles.newsletterNote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Want a weekly digest of new Bitcoin research?{' '}
              <Link className={styles.newsletterLink} to="/BitResearch/newsletter">
                Subscribe to BitResearch Weekly
              </Link>
              .
            </motion.p>
            <motion.div
              className={styles.corpusStatsReveal}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <CorpusStats stats={stats} onPick={suggest} />
            </motion.div>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <span className={styles.toolbarTitle}>BitResearch</span>
              <div className={styles.toolbarActions}>
                <button
                  type="button"
                  className={styles.newChat}
                  onClick={() => exportTranscript(messages)}
                >
                  Export
                </button>
                <button
                  type="button"
                  className={styles.newChat}
                  onClick={reset}
                  disabled={isStreaming}
                >
                  New conversation
                </button>
              </div>
            </div>
            <MessageList messages={messages} onFeedback={sendFeedback} onAsk={ask} />
            <div className={styles.composerArea}>
              {composer}
              <p className={styles.disclaimer}>
                Answers are generated solely from BEI&rsquo;s corpus of academic papers and cite
                their sources. They are educational material, not financial advice.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
