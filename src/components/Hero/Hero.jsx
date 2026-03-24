import { motion } from 'motion/react';
import styles from './Hero.module.css';

export default function Hero({ title, subtitle, backgroundImage, children }) {
  const hasBackground = !!backgroundImage;
  const heroClass = `${styles.hero} ${hasBackground ? styles.heroFull : styles.heroCompact}`;

  return (
    <section
      className={heroClass}
      style={{
        backgroundImage: hasBackground
          ? `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${backgroundImage})`
          : undefined,
      }}
    >
      <div className={`container ${styles.content}`}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            className={styles.cta}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
