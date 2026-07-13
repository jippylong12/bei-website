import { useRef, useState } from 'react';
import styles from './Chat.module.css';

const MAX_CHARS = 2000;

export default function Composer({ onSend, onStop, isStreaming, deep, onToggleDeep }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const submit = () => {
    const value = text.trim();
    if (!value || isStreaming) return;
    onSend(value);
    setText('');
    const el = textareaRef.current;
    if (el) el.style.height = 'auto';
  };

  const onChange = (e) => {
    setText(e.target.value.slice(0, MAX_CHARS));
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.composer}>
      <button
        type="button"
        className={`${styles.deepToggle} ${deep ? styles.deepToggleOn : ''}`}
        onClick={onToggleDeep}
        disabled={isStreaming}
        title="Deep research: plans multiple corpus searches and synthesizes a broader evidence pool (slower, more thorough)"
        aria-pressed={deep}
      >
        Deep
      </button>
      <textarea
        ref={textareaRef}
        className={styles.input}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Ask about the research — e.g. selfish mining, energy use, volatility…"
        rows={1}
        aria-label="Your question"
      />
      {isStreaming ? (
        <button type="button" className={styles.stopButton} onClick={onStop}>
          Stop
        </button>
      ) : (
        <button
          type="button"
          className={styles.sendButton}
          onClick={submit}
          disabled={!text.trim()}
          aria-label="Send question"
        >
          Send
        </button>
      )}
    </div>
  );
}
