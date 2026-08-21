import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import styles from './Header.module.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/what-we-do', label: 'What We Do' },
  { to: '/about', label: 'About' },
  { to: '/donate', label: 'Donate' },
  { to: '/contact', label: 'Contact' },
  { to: '/conference-2026', label: '2026 Conference' },
  { to: '/conference-2027', label: '2027 Conference' },
  // BitResearch is intentionally absent. /BitResearch still loads for anyone
  // holding the URL, but it must not be discoverable from btcedu.org itself —
  // do not add it back here. See src/pages/Chat/ChatLazy.jsx.
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <img
            src={`${import.meta.env.BASE_URL}brand/primary-horizontal-logo/BEI_Wordmark_White.svg`}
            alt="Bitcoin Education Institute"
            width="265"
            height="98"
          />
        </Link>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navLinks.map(({ to, label }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
            >
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setMenuOpen(false)}
                end={to === '/'}
              >
                {label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
