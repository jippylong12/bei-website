import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import styles from './AnimatedSection.module.css';

export default function AnimatedSection({ title, children, image, imageAlt, reverse, id }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const duration = 0.6;

  return (
    <section className={styles.section} id={id} ref={ref}>
      <div className={`container ${styles.inner} ${reverse ? styles.reverse : ''}`}>
        {image && (
          <motion.div
            className={styles.imageWrap}
            initial={{ opacity: 0, x: reverse ? 60 : -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={image} alt={imageAlt || ''} className={styles.image} />
          </motion.div>
        )}
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, x: reverse ? -40 : 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {title && (
            <h2 className={styles.title}>{title}</h2>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
