import { motion } from 'motion/react';
import BitcoinHero from '../../components/BitcoinHero/BitcoinHero';
import AnimatedSection from '../../components/AnimatedSection/AnimatedSection';
import styles from './Conference.module.css';

const base = import.meta.env.BASE_URL;

export default function Conference() {
  return (
    <>
      <BitcoinHero
        title="Annual Bitcoin Education Institute Conference 2026"
        subtitle="Join us for the premier Bitcoin education event"
      >
        <motion.a
          href="http://forms.gle/dDMLL2XFuCEkPt1z5"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.registerButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Register
        </motion.a>
      </BitcoinHero>

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
                Teaching and research talks showcasing innovative approaches to
                Bitcoin education.
              </p>
              <p>
                Networking with colleagues who are developing Bitcoin curricula
                nationwide.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className={styles.teachingSection}>
        <AnimatedSection
          title="Teaching Talks"
          image={`${base}images/dustin-watchman-teaching.png`}
          imageAlt="Dustin Watchman teaching Bitcoin concepts in a classroom"
          reverse
        >
          <p>
            Hear from educators like Dustin Watchman who are bringing Bitcoin
            into classrooms around the world. Teaching Talks spotlight innovative
            methods for making Bitcoin accessible to students of all backgrounds.
          </p>
        </AnimatedSection>
      </div>
    </>
  );
}
