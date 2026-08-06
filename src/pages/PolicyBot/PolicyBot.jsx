import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import styles from './PolicyBot.module.css';

// The SwIRL policy bot runs on a workstation and reaches Dropbox with a token
// that can *edit* the handbooks, so it is not embedded here and not proxied
// through this site. This page only points at it; Cloudflare Access sits in
// front of that hostname and asks for an emailed code, so the five people on
// the allowlist get in and nobody else does.
//
// Set VITE_POLICYBOT_URL at build time to override (staging, renamed tunnel).
const BOT_URL =
  import.meta.env.VITE_POLICYBOT_URL ||
  'https://swirlpolicybot.batchllm-workspace.info';

const REDIRECT_AFTER_MS = 2500;

export default function PolicyBot() {
  const [redirecting, setRedirecting] = useState(true);

  // Unlinked, not private — same posture as BitResearch. Nothing on btcedu.org
  // points here, and this noindex plus the Disallow in public/robots.txt keeps
  // the URL out of search results.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => meta.remove();
  }, []);

  // A short pause before leaving, so the sign-in requirement is read rather
  // than flashed past — otherwise the Access code page arrives with no context
  // and looks like something has gone wrong. Depends on `redirecting` so that
  // cancelling actually clears the timer rather than only changing the caption.
  useEffect(() => {
    if (!redirecting) return undefined;

    const timer = setTimeout(() => {
      window.location.href = BOT_URL;
    }, REDIRECT_AFTER_MS);

    return () => clearTimeout(timer);
  }, [redirecting]);

  return (
    <section className={styles.wrap}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className={styles.eyebrow}>SwIRL · staff only</p>
        <h1 className={styles.title}>SwIRL Policy Bot</h1>
        <p className={styles.text}>
          Answers questions from the SwIRL handbooks and drafts edits to them,
          with every change shown as a diff for approval before anything is
          written.
        </p>
        <p className={styles.text}>
          It is hosted separately from this site and is restricted to the SwIRL
          team. You will be asked to sign in with your work email and a code
          sent to it.
        </p>

        <a className={styles.button} href={BOT_URL}>
          Continue to the policy bot
        </a>

        <p className={styles.note}>
          {redirecting
            ? 'Taking you there now — use the button if nothing happens.'
            : 'Use the button above to continue.'}
        </p>

        {redirecting && (
          <button
            type="button"
            className={styles.cancel}
            onClick={() => setRedirecting(false)}
          >
            Stay on this page
          </button>
        )}
      </motion.div>
    </section>
  );
}
