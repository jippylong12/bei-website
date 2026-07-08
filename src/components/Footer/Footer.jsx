import { motion } from 'motion/react';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className={styles.footer}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.identity}>
          <img
            src={`${import.meta.env.BASE_URL}brand/primary-horizontal-logo/BEI_Wordmark_White.svg`}
            alt="Bitcoin Education Institute"
            width="265"
            height="98"
          />
          <p>
            Advancing rigorous Bitcoin teaching, research, and academic
            convening.
          </p>
        </div>
        <div className={styles.col}>
          <p>&copy; {year} Bitcoin Education Institute</p>
          <p>All Rights Reserved.</p>
          <p className={styles.status}>
            501(c)(3) tax-exempt nonprofit corporation.
          </p>
        </div>
        <div className={styles.col}>
          <a href="mailto:info@btcedu.org">info@btcedu.org</a>
          <motion.a
            href="https://pay.zaprite.com/pl_JCxJao3lKs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.donateLink}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Donate to BEI
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
}
