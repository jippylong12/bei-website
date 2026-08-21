import { motion } from 'motion/react';
import Hero from '../../components/Hero/Hero';
import styles from './Conference.module.css';

// 2027 form comes from Daniel; the Register button renders once this is set.
const REGISTRATION_FORM_URL = null;

export default function Conference2027() {
  return (
    <>
      <Hero
        title="Annual Bitcoin Education Institute Conference 2027"
        subtitle="A formal gathering for Bitcoin educators, researchers, and interdisciplinary academic work — July 14, 2027 in Nashville, Tennessee."
      >
        {REGISTRATION_FORM_URL ? (
          <motion.a
            href={REGISTRATION_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.registerButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Register
          </motion.a>
        ) : (
          <p className={styles.registerSoon}>Registration opens soon.</p>
        )}
      </Hero>

      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.grid}>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={styles.cardTitle}>Who Should Attend</h2>
              <p>
                Our conference brings together educators, researchers, and
                practitioners from across higher education to advance the
                rigorous, interdisciplinary study of Bitcoin.
              </p>
              <p>
                Faculty, graduate students, researchers, and Bitcoin-interested
                individuals across disciplines including economics, finance,
                computer science, law, energy, or policy.
              </p>
            </motion.div>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className={styles.cardTitle}>What to Expect</h2>
              <p>
                Keynote presentations from leading Bitcoin researchers and
                educators.
              </p>
              <p>
                Research presentations showcasing rigorous approaches to the
                academic study of Bitcoin.
              </p>
              <p>
                Networking with colleagues who are developing Bitcoin curricula
                nationwide.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
