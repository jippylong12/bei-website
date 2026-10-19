import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import { API_BASE } from '../../config/api';
import styles from './Newsletter.module.css';

// BitResearch Weekly sign-up, at /BitResearch/newsletter. The page lives on the
// site; the subscriber list stays in btc_rag, so the form posts to the same
// /api/newsletter/subscribe the old bei-api /newsletter page used.
const MESSAGES = {
  already: 'That address is already subscribed.',
  resubscribed: 'Welcome back! Your subscription is active again.',
  subscribed: "You're subscribed. The next weekly digest will land in your inbox.",
};

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { ok: boolean, text: string }

  // Same search stance as /BitResearch: reachable by link, kept out of search.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), key: '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus({ ok: true, text: MESSAGES[data.status] || MESSAGES.subscribed });
        setEmail('');
      } else {
        setStatus({
          ok: false,
          text: data.message || 'That did not work. Please check the address and try again.',
        });
      }
    } catch {
      setStatus({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Hero
        title="BitResearch Weekly"
        subtitle="The week in Bitcoin research, in your inbox."
      />

      <section className={styles.section}>
        <div className="container">
          <motion.p
            className={styles.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Every week, the BitResearch corpus grows as new academic papers on Bitcoin are
            collected. Subscribe to get a weekly digest, with each new paper introduced the way
            the Bitcoin Education Institute writes them: what it asks, what it finds, and why it
            matters.
          </motion.p>

          <motion.form
            className={styles.form}
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <label htmlFor="nl-email" className={styles.srOnly}>
              Email address
            </label>
            <input
              id="nl-email"
              className={styles.input}
              type="email"
              required
              maxLength={320}
              autoComplete="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.button} type="submit" disabled={busy}>
              {busy ? 'Subscribing…' : 'Subscribe'}
            </button>
          </motion.form>

          <p
            className={`${styles.status} ${status ? (status.ok ? styles.ok : styles.err) : ''}`}
            role="status"
            aria-live="polite"
          >
            {status?.text}
          </p>

          <p className={styles.note}>
            One email a week, sent Friday morning. No advertising, and your address is never
            shared. Unsubscribe with one click from any issue.
          </p>

          <p className={styles.back}>
            <Link to="/BitResearch">Ask the BitResearch corpus a question →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
