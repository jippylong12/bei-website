import { useEffect, useRef } from 'react';
import AssistantMessage from './AssistantMessage';
import styles from './Chat.module.css';

// `assistantProps` (optional) go to every AssistantMessage; see its options.
// onFeedback gets the answer's turn id as a third argument, so the feedback
// POST does not have to read it back out of state.
export default function MessageList({ messages, onFeedback, onAsk, assistantProps }) {
  const scrollRef = useRef(null);
  const stickRef = useRef(true); // follow the stream unless the user scrolls up

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className={styles.messageList} ref={scrollRef} onScroll={onScroll}>
      <div className={styles.messageColumn}>
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className={styles.userMessage}>
              {m.content}
            </div>
          ) : (
            <AssistantMessage
              key={m.id}
              message={m}
              onFeedback={(rating) => onFeedback?.(m.id, rating, m.turnId)}
              onAsk={onAsk}
              {...assistantProps}
            />
          )
        )}
      </div>
    </div>
  );
}
