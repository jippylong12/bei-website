import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../themes/ThemeContext';
import styles from './ThemePicker.module.css';

export default function ThemePicker() {
  const { theme, themes, nextTheme, prevTheme, setTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Design Themes</span>
              <button
                className={styles.closeBtn}
                onClick={() => setExpanded(false)}
                aria-label="Close theme picker"
              >
                &times;
              </button>
            </div>
            <div className={styles.themeList}>
              {themes.map((t) => (
                <motion.button
                  key={t.id}
                  className={`${styles.themeOption} ${t.id === theme.id ? styles.active : ''}`}
                  onClick={() => setTheme(t.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span
                    className={styles.swatch}
                    style={{
                      background: t.vars['--color-bg'],
                      borderColor: t.vars['--color-accent'],
                    }}
                  >
                    <span
                      className={styles.swatchAccent}
                      style={{ background: t.vars['--color-accent'] }}
                    />
                  </span>
                  <div className={styles.themeInfo}>
                    <span className={styles.themeName}>{t.name}</span>
                    <span className={styles.themeDesc}>{t.description}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.fabRow}>
        <motion.button
          className={styles.navBtn}
          onClick={prevTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous theme"
        >
          &#8249;
        </motion.button>

        <motion.button
          className={styles.fab}
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle theme picker"
        >
          <span className={styles.fabIcon}>&#9672;</span>
          <span className={styles.fabLabel}>{theme.name}</span>
        </motion.button>

        <motion.button
          className={styles.navBtn}
          onClick={nextTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next theme"
        >
          &#8250;
        </motion.button>
      </div>
    </div>
  );
}
