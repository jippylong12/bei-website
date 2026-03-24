import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTheme } from '../../themes/ThemeContext';
import styles from './BitcoinHero.module.css';

function BitcoinSymbol({ size, x, y, opacity, delay }) {
  return (
    <motion.svg
      className={styles.floatingBtc}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{ left: `${x}%`, top: `${y}%`, opacity }}
      initial={{ y: 20, opacity: 0 }}
      animate={{
        y: [20, -10, 20],
        opacity: [0, opacity, 0],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fontSize="48"
        fill="currentColor"
        className={styles.btcGlyph}
      >
        &#8383;
      </text>
    </motion.svg>
  );
}

const floatingSymbols = [
  { size: 40, x: 8, y: 20, opacity: 0.06, delay: 0 },
  { size: 28, x: 85, y: 15, opacity: 0.05, delay: 1.5 },
  { size: 56, x: 75, y: 65, opacity: 0.04, delay: 3 },
  { size: 32, x: 15, y: 70, opacity: 0.07, delay: 2 },
  { size: 24, x: 50, y: 10, opacity: 0.04, delay: 4 },
  { size: 48, x: 92, y: 45, opacity: 0.05, delay: 1 },
  { size: 20, x: 30, y: 80, opacity: 0.06, delay: 3.5 },
  { size: 36, x: 65, y: 30, opacity: 0.04, delay: 2.5 },
];

export default function BitcoinHero({ title, subtitle, children }) {
  const ref = useRef(null);
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const isKinetic = theme.id === 'kinetic';

  return (
    <section className={styles.hero} ref={ref}>
      {/* Animated background grid */}
      <motion.div className={styles.bgLayer} style={{ y: bgY }}>
        <div className={styles.gridOverlay} />
        <div className={styles.radialGlow} />
        {floatingSymbols.map((s, i) => (
          <BitcoinSymbol key={i} {...s} />
        ))}
      </motion.div>

      {/* Large central Bitcoin symbol */}
      <motion.div
        className={styles.centralSymbol}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: isKinetic ? 1.5 : 1,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <svg viewBox="0 0 200 200" className={styles.centralSvg}>
          <defs>
            <radialGradient id="btcGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="95" fill="url(#btcGlow)" />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            opacity="0.15"
          />
          <text
            x="100"
            y="125"
            textAnchor="middle"
            fontSize="90"
            fill="var(--color-accent)"
            opacity="0.12"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
          >
            &#8383;
          </text>
        </svg>
      </motion.div>

      {/* Content */}
      <motion.div
        className={`container ${styles.content}`}
        style={{ opacity }}
      >
        <motion.h1
          className={styles.title}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            className={styles.subtitle}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            className={styles.cta}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {children}
          </motion.div>
        )}

        {/* Animated divider line */}
        <motion.div
          className={styles.divider}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </section>
  );
}
