import { motion } from 'motion/react';
import styles from './AnimatedFocusCard.module.css';

export default function AnimatedFocusCard({ title, description, index = 0 }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -6,
        borderColor: 'var(--color-accent)',
        transition: { duration: 0.2 },
      }}
    >
      <div className={styles.accentBar} />
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </motion.div>
  );
}
