import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import styles from './Chat.module.css';

const MAX_CHARS = 2000;

export default function Composer({
  onSend,
  onStop,
  isStreaming,
  deep,
  onToggleDeep,
  autoFocus,
  ref,
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Grow the box to fit its content, from wherever the content came from.
  // This has to run AFTER React has written the new value to the DOM —
  // measuring scrollHeight in the same tick as setText reads the box's
  // previous contents, which silently clipped any prefilled question long
  // enough to wrap.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  // Filling the box from elsewhere on the page (the class chart) is something
  // that happens ON A CLICK, so it is exposed as a method the parent calls
  // rather than a prop an effect watches: a `prefill` prop would need a nonce
  // to re-fire on a repeat pick, and syncing it into state from an effect is
  // the render-loop hazard react-hooks/set-state-in-effect is there to catch.
  // Deliberately fills rather than sends — the phrasing is a starting point,
  // and the visitor should get to edit it first.
  useImperativeHandle(ref, () => ({
    fill(question) {
      setText(question.slice(0, MAX_CHARS));
      const el = textareaRef.current;
      if (!el) return;
      // The composer sits above the chart, so it is off-screen when the click
      // lands. Scroll it back deliberately rather than letting focus() jerk
      // the page to wherever the browser decides.
      el.focus({ preventScroll: true });
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    },
  }), []);

  const submit = () => {
    const value = text.trim();
    if (!value || isStreaming) return;
    onSend(value);
    setText('');
  };

  const onChange = (e) => {
    setText(e.target.value.slice(0, MAX_CHARS));
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
        placeholder="Ask a question about the research…"
        rows={1}
        aria-label="Your question"
        autoFocus={autoFocus}
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
