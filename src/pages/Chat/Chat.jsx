import { useState } from 'react';
import { motion } from 'motion/react';
import Composer from './Composer';
import MessageList from './MessageList';
import useChatStream from './useChatStream';
import { exportTranscript } from './storage';
import styles from './Chat.module.css';

const STARTERS = [
  'What is selfish mining and why does it threaten Bitcoin?',
  'What does the research say about Bitcoin mining energy consumption?',
  'What drives Bitcoin price volatility according to academic studies?',
  'How effective is Bitcoin as an inflation hedge?',
];

// A short read on what the corpus covers, so users calibrate what to ask.
const CORPUS_TOPICS =
  'mining & consensus, energy use, price volatility & forecasting, adoption, ' +
  'regulation, macro & monetary policy, the Lightning Network, and market microstructure';

export default function Chat() {
  const { messages, isStreaming, send, stop, reset, sendFeedback } = useChatStream();
  const [deep, setDeep] = useState(false);
  const empty = messages.length === 0;
  const ask = (text) => send(text, { deep });

  return (
    <section className={styles.page}>
      <div className={styles.chatFrame}>
        {empty ? (
          <div className={styles.emptyState}>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Research Chat
            </motion.h1>
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Ask questions across BEI&rsquo;s corpus of ~2,900 academic papers on Bitcoin.
              Every answer cites the specific studies it draws from.
            </motion.p>
            <div className={styles.starters}>
              {STARTERS.map((q, i) => (
                <motion.button
                  key={q}
                  type="button"
                  className={styles.starter}
                  onClick={() => ask(q)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.06 }}
                  whileHover={{ y: -2 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
            <motion.p
              className={styles.corpusNote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              The corpus covers {CORPUS_TOPICS}. Ask about findings, methods, or how
              studies compare — not live prices or predictions.
            </motion.p>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <span className={styles.toolbarTitle}>Research Chat</span>
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
          </>
        )}

        <div className={styles.composerArea}>
          <Composer
            onSend={ask}
            onStop={stop}
            isStreaming={isStreaming}
            deep={deep}
            onToggleDeep={() => setDeep((d) => !d)}
          />
          <p className={styles.disclaimer}>
            Answers are generated solely from BEI&rsquo;s corpus of academic papers and cite their
            sources. They are educational material, not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
