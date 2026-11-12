import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { fetchDirectory, imageUrl, loadToken } from './facultyApi';
import People from './People';
import styles from './Faculty.module.css';

// The public Faculty Affiliates page, at /faculty: a row per person with a
// headshot, name, title and organisation. The course materials and the
// speakers are the separate, sign-in-only Portal (Portal.jsx), reached from
// the button beside the page title.
//
// The people are not part of this site's code. The directory and the pictures
// come from the backend, so the list has one home and this (public)
// repository holds none of it.
//
// The page is built from the same parts as the rest of the site: the gold
// button, and the bordered panel of rows the 2026 agenda uses. The top is a
// one-line title row, not the site's tall Hero band: the owner asked for the
// list to start higher up. It still arrives the way the other pages do: the
// title rises in, then the button, then the list (Faculty.module.css, "Moving
// between views").

// What to show for an answer from the directory endpoint.
const toState = (res) =>
  res.ok ? { status: 'ready', people: res.faculty } : { status: 'error', message: res.message };

export default function Faculty() {
  const [state, setState] = useState({ status: 'loading' }); // + people | message
  const signedIn = Boolean(loadToken());

  useEffect(() => {
    fetchDirectory().then((res) => setState(toState(res)));
  }, []);

  const retry = async () => {
    setState({ status: 'loading' });
    setState(toState(await fetchDirectory()));
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.pageHead}>
          <h1 className={`${styles.pageTitle} ${styles.rise}`}>Faculty Affiliates</h1>
          <motion.div
            className={`${styles.headAction} ${styles.riseNext}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link to="/faculty/portal" className={styles.cta}>
              {!signedIn && <LockIcon />}
              Portal
              {!signedIn && (
                <>
                  {' '}
                  <span className="sr-only">(sign-in needed)</span>
                </>
              )}
            </Link>
          </motion.div>
        </div>

        {state.status === 'loading' && (
          <p className={`${styles.text} ${styles.waiting}`} role="status">
            Loading the faculty…
          </p>
        )}

        {state.status === 'error' && (
          <div className={`${styles.problem} ${styles.enter}`} role="alert">
            <p>The faculty could not be loaded. {state.message}</p>
            <button className={styles.cta} type="button" onClick={retry}>
              Try Again
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <div className={styles.enter}>
            <People people={state.people} imageUrl={imageUrl} searchLabel="Search the faculty" />
          </div>
        )}
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg className={styles.lock} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" />
    </svg>
  );
}
